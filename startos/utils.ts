// Here we define any constants or functions that are shared by multiple components
// throughout the package codebase.

import { DEPOSIT_MNEMONIC_FILE, MINT_DATABASE } from './mintEnvironment'

/** Reported to the operator by the Mint Status action. */
export const mintDatabaseFile = `${MINT_DATABASE}/mint.sqlite3`
// MINT_DATABASE relative to the root of the main volume
export const mintDatabaseDir = MINT_DATABASE.replace(/^\/data\//, '')

/** The mint's eCash seed, generated at install and read back on every start. */
export const mintSeedFile = 'mint_private_key'

/** The onchain deposit wallet's recovery phrase, relative to the main volume. */
export const depositMnemonicFile = DEPOSIT_MNEMONIC_FILE.replace(
  /^\/data\//,
  '',
)

// From phoenixd-startos's interfaces.ts and utils.ts; a value import would bundle its whole dependency graph.
export const phoenixdHostId = 'api-multi'
export const phoenixdPort = 9740

/** The admin dashboard: its port, install path and login name. */
export const adminUiPort = 3339
export const adminUiDir = '/opt/admin-ui'
export const adminUiUser = 'admin'

/** Where phoenixd's `public/full` export (its http-password) is mounted, read-only. */
export const phoenixdMountpoint = '/mnt/phoenixd'

// From fulcrum-startos's interfaces.ts and utils.ts, inlined for the same reason.
export const fulcrumHostId = 'main'
export const fulcrumElectrumPort = 50001
