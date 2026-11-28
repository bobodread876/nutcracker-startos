import { configYaml } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { MINT_HOST, MINT_PORT, ONCHAIN_STATUS_FILE } from '../mintEnvironment'
import { depositMnemonicFile, mintDatabaseFile, mintSeedFile } from '../utils'

export const showMintInfo = sdk.Action.withoutInput(
  'show-mint-info',

  async ({ effects }) => ({
    name: i18n('Mint Status'),
    description: i18n(
      'Show the mint seed status, Lightning backend, onchain status, listener and database path.',
    ),
    warning: null,
    // Reads the volume and the config file, not the container, so it answers
    // while the mint is stopped — which is when "is my seed still there?" is
    // the question being asked.
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const logLevel = await configYaml.read((c) => c.advanced.log_level).once()
    const onchainEnabled =
      (await configYaml.read((c) => c.onchain.enabled).once()) ?? false
    const hasDepositPhrase = await sdk.volumes.main
      .readFile(depositMnemonicFile, 'utf-8')
      .then((k) => String(k).trim().length > 0)
      .catch(() => false)
    const depositSats = await sdk.volumes.main
      .readFile(ONCHAIN_STATUS_FILE.replace(/^\/data\//, ''), 'utf-8')
      .then((raw) => JSON.parse(String(raw))?.deposit_wallet?.confirmed_sat)
      .catch(() => undefined)
    const hasSeed = await sdk.volumes.main
      .readFile(mintSeedFile, 'utf-8')
      .then((k) => String(k).trim().length > 0)
      .catch(() => false)

    return {
      version: '1',
      title: i18n('Mint Status'),
      message: null,
      result: {
        type: 'group',
        value: [
          {
            name: i18n('Mint Seed'),
            description: i18n(
              'Whether the eCash seed exists on the volume. Its value is never shown.',
            ),
            type: 'single',
            value: hasSeed ? i18n('Present') : i18n('Missing'),
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Lightning Backend'),
            description: i18n(
              'The wallet backend the mint settles payments through.',
            ),
            type: 'single',
            value: 'PhoenixdWallet (phoenixd)',
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Onchain'),
            description: i18n(
              'Whether onchain deposits and withdrawals are switched on.',
            ),
            type: 'single',
            value: onchainEnabled ? i18n('On') : i18n('Off'),
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Deposit Wallet Phrase'),
            description: i18n(
              "Whether the onchain deposit wallet's recovery phrase exists on the volume. Its value is never shown.",
            ),
            type: 'single',
            value: hasDepositPhrase ? i18n('Present') : i18n('Missing'),
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Deposit Wallet Balance'),
            description: i18n(
              "Confirmed sats in the deposit wallet waiting for the next sweep, as of the mint's last status update.",
            ),
            type: 'single',
            value:
              typeof depositSats === 'number'
                ? `${depositSats} sats`
                : i18n('Not available yet'),
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Listen Address'),
            description: i18n(
              'The address and port the mint binds inside its container.',
            ),
            type: 'single',
            value: `${MINT_HOST}:${MINT_PORT}`,
            copyable: true,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Database Path'),
            description: i18n(
              'Where the mint database is stored inside the container.',
            ),
            type: 'single',
            value: mintDatabaseFile,
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
          {
            name: i18n('Log Level'),
            description: i18n('Current logging verbosity.'),
            type: 'single',
            value: logLevel ?? 'INFO',
            copyable: false,
            qr: false,
            masked: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
