import { i18n } from './i18n'
import { sdk } from './sdk'
import { MINT_PORT } from './mintEnvironment'
import { adminUiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const apiMulti = sdk.MultiHost.of(effects, 'api-multi')
  const apiOrigin = await apiMulti.bindPort(MINT_PORT, { protocol: 'http' })
  const api = sdk.createInterface(effects, {
    name: i18n('Cashu Mint API'),
    id: 'api',
    description: i18n('The Cashu API wallets connect to'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const adminMulti = sdk.MultiHost.of(effects, 'admin-multi')
  const adminOrigin = await adminMulti.bindPort(adminUiPort, {
    protocol: 'http',
  })
  const admin = sdk.createInterface(effects, {
    name: i18n('Admin Dashboard'),
    id: 'admin',
    description: i18n(
      'A read-only dashboard of the mint: balances, quotes, keysets and health',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await apiOrigin.export([api]), await adminOrigin.export([admin])]
})
