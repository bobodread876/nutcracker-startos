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

/**
 * phoenixd's API host and port, from phoenixd-startos's startos/interfaces.ts
 * and startos/utils.ts. Inlined: those modules import electrs-startos, whose
 * bitcoin-core imports do not type-check against bitcoin-core's #next.
 */
export const phoenixdHostId = 'api-multi'
export const phoenixdPort = 9740

/** The admin dashboard: its port, install path and login name. */
export const adminUiPort = 3339
export const adminUiDir = '/opt/admin-ui'
export const adminUiUser = 'admin'

/** Where phoenixd's exported API credential is mounted, read-only. */
export const phoenixdMountpoint = '/mnt/phoenixd'

/**
 * Fulcrum's Electrum host and plaintext port, from fulcrum-startos's
 * startos/utils.ts. Inlined: importing that package drags in electrs-startos,
 * whose bitcoin-core imports do not type-check against bitcoin-core's #next.
 */
export const fulcrumHostId = 'main'
export const fulcrumElectrumPort = 50001
