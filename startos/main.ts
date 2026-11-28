import { readFile } from 'fs/promises'
import type { manifest as phoenixdManifest } from 'phoenixd-startos/startos/manifest'
import { configYaml } from './fileModels/config.yaml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import {
  buildMintEnvironment,
  DEPOSIT_MNEMONIC_FILE,
  MINT_PORT,
  ONCHAIN_DIR,
  OnchainConnection,
} from './mintEnvironment'
import { sdk } from './sdk'
import {
  adminUiDir,
  adminUiPort,
  adminUiUser,
  fulcrumElectrumPort,
  fulcrumHostId,
  mintDatabaseDir,
  mintSeedFile,
  phoenixdHostId,
  phoenixdMountpoint,
  phoenixdPort,
} from './utils'

/**
 * Writes the deposit wallet's recovery phrase the first time onchain runs.
 * O_EXCL makes an existing file (a restored one included) a hard stop rather
 * than something to overwrite: a fresh phrase would strand every deposit.
 */
const createDepositMnemonic = `
import os, bdkpython as bdk
path = ${JSON.stringify(DEPOSIT_MNEMONIC_FILE)}
os.makedirs(${JSON.stringify(ONCHAIN_DIR)}, mode=0o700, exist_ok=True)
if not os.path.exists(path):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as fh:
        fh.write(bdk.Mnemonic(bdk.WordCount.WORDS12).as_string() + "\\n")
    print("created deposit wallet recovery phrase")
`

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Nutcracker'))

  const config = await configYaml.read().const(effects)
  const adminPasswordHash = await storeJson
    .read((s) => s.adminPasswordHash)
    .const(effects)
  const seed = await sdk.volumes.main
    .readFile(mintSeedFile, 'utf-8')
    .catch(() => '')

  // The bridge address changes only when phoenixd is installed, uninstalled or
  // rebound, so `.const()` restarts the mint exactly then.
  const phoenixdAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'phoenixd',
      hostId: phoenixdHostId,
      internalPort: phoenixdPort,
      ssl: false,
    })
    .const()
  if (!phoenixdAddress) {
    throw new Error(
      i18n(
        'phoenixd is not reachable on the internal network. Make sure phoenixd is installed and running.',
      ),
    )
  }

  let onchain: OnchainConnection = null
  if (config?.onchain.enabled) {
    const electrumAddress = await sdk.host
      .getBridgeAddress(effects, {
        packageId: 'fulcrum',
        hostId: fulcrumHostId,
        internalPort: fulcrumElectrumPort,
        ssl: false,
      })
      .const()
    if (!electrumAddress) {
      throw new Error(
        i18n(
          'Onchain is switched on, but Fulcrum is not reachable on the internal network. Install and start Fulcrum, or switch onchain off in Onchain Settings.',
        ),
      )
    }
    onchain = { electrumUrl: `tcp://${electrumAddress}` }
  }

  const dataVolume = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    dataVolume.mountDependency<typeof phoenixdManifest>({
      dependencyId: 'phoenixd',
      volumeId: 'public',
      subpath: 'full',
      mountpoint: phoenixdMountpoint,
      readonly: true,
    }),
    'nutcracker-sub',
  )

  const phoenixdPassword = await readPhoenixdHttpPassword(
    await subcontainer.rootfs,
  )

  const env = buildMintEnvironment(
    config,
    String(seed),
    { url: `http://${phoenixdAddress}`, password: phoenixdPassword },
    onchain,
  )

  const daemons = sdk.Daemons.of(effects).addOneshot('deposit-wallet', () =>
    onchain
      ? {
          subcontainer: sdk.SubContainer.of(
            effects,
            { imageId: 'main' },
            dataVolume,
            'deposit-wallet-sub',
          ),
          exec: { command: ['python', '-c', createDepositMnemonic] },
          requires: [],
        }
      : null,
  )

  const withMint = daemons.addDaemon('primary', {
    subcontainer,
    exec: { command: ['poetry', 'run', 'mint'], env },
    ready: {
      display: i18n('Cashu Mint'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, MINT_PORT, {
          successMessage: i18n('The mint is responsive'),
          errorMessage: i18n('The mint is not ready'),
        }),
    },
    requires: onchain ? ['deposit-wallet'] : [],
  })

  // Skipped until Set Admin Password has run; the task says so.
  const statsMount = {
    volumeId: 'stats',
    subpath: null,
    mountpoint: '/stats',
  } as const
  const withStats = withMint.addDaemon('stats', () =>
    adminPasswordHash
      ? {
          subcontainer: sdk.SubContainer.of(
            effects,
            { imageId: 'main' },
            sdk.Mounts.of()
              // SQLite may create WAL sidecars even on a read-only connection.
              .mountVolume({
                volumeId: 'main',
                subpath: mintDatabaseDir,
                mountpoint: '/ledger',
                readonly: false,
              })
              .mountVolume({ ...statsMount, readonly: false }),
            'stats-sub',
          ),
          exec: { command: ['python', '/opt/nutcracker/export_stats.py'] },
          ready: {
            display: i18n('Dashboard statistics'),
            fn: async () => {
              const timestamp = await sdk.volumes.stats
                .readFile('summary.json', 'utf-8')
                .then((data) => JSON.parse(String(data)).timestamp)
                .catch(() => 0)
              const age = Date.now() / 1000 - timestamp
              return age >= 0 && age <= 65
                ? {
                    result: 'success',
                    message: i18n('Dashboard statistics are current'),
                  }
                : {
                    result: 'failure',
                    message: i18n('Waiting for current mint statistics'),
                  }
            },
          },
          requires: ['primary'],
        }
      : null,
  )
  return withStats.addDaemon('admin-ui', () =>
    adminPasswordHash
      ? {
          subcontainer: sdk.SubContainer.of(
            effects,
            { imageId: 'main' },
            sdk.Mounts.of().mountVolume({ ...statsMount, readonly: true }),
            'admin-ui-sub',
          ),
          exec: {
            command: ['node', `${adminUiDir}/server.js`],
            user: 'nobody',
            env: {
              PORT: String(adminUiPort),
              HOST: '0.0.0.0',
              MINT_URL: `http://127.0.0.1:${MINT_PORT}`,
              ADMIN_USER: adminUiUser,
              ADMIN_PASS_HASH: adminPasswordHash,
            },
          },
          ready: {
            display: i18n('Admin Dashboard'),
            fn: () =>
              sdk.healthCheck.checkWebUrl(
                effects,
                `http://127.0.0.1:${adminUiPort}/health`,
                {
                  successMessage: i18n('The admin dashboard is ready'),
                  errorMessage: i18n('The admin dashboard is not responding'),
                },
              ),
          },
          requires: ['primary'],
        }
      : null,
  )
})

async function readPhoenixdHttpPassword(rootfs: string): Promise<string> {
  const password = await readFile(
    `${rootfs}${phoenixdMountpoint}/http-password`,
    'utf-8',
  )
    .then((p) => p.trim())
    .catch(() => '')
  if (!password) {
    throw new Error(
      i18n(
        "phoenixd's http-password could not be read. Start phoenixd once so it writes its config, then start Nutcracker again.",
      ),
    )
  }
  return password
}
