import { randomBytes, scryptSync } from 'crypto'
import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminUiUser } from '../utils'

/** scrypt$N$r$p$salt$hash, as the admin dashboard's ADMIN_PASS_HASH expects. */
const hashPassword = (password: string): string => {
  const N = 16384
  const r = 8
  const p = 1
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 32, { N, r, p })
  return [
    'scrypt',
    N,
    r,
    p,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join('$')
}

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',

  async ({ effects }) => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'Generate a new random password for the admin dashboard. Nutcracker restarts to apply it.',
    ),
    warning: (await storeJson.read((s) => s.adminPasswordHash).const(effects))
      ? i18n(
          'This replaces the current admin dashboard password, and the old one stops working.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })
    await storeJson.merge(effects, {
      adminPasswordHash: hashPassword(password),
    })

    return {
      version: '1',
      title: i18n('Admin Dashboard Login'),
      message: i18n(
        'Use these to sign in to the Admin Dashboard interface. Only a hash of the password is stored, so save it now.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: adminUiUser,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
