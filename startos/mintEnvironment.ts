import type { ConfigType } from './fileModels/config.yaml'

/** phoenixd's HTTP API as reached over the StartOS bridge. */
export type PhoenixdConnection = {
  url: string
  password: string
}

/** The Electrum server the onchain backend reads the chain from, or null. */
export type OnchainConnection = {
  electrumUrl: string
} | null

/** Nutshell's internal HTTP listener. StartOS owns external addressing. */
export const MINT_PORT = 3338
export const MINT_HOST = '0.0.0.0'

/** A directory, not a file — Nutshell writes `mint.sqlite3` inside it. */
export const MINT_DATABASE = '/data/mint'

/** The onchain deposit wallet: its recovery phrase, wallet database and status. */
export const ONCHAIN_DIR = '/data/onchain'
export const DEPOSIT_MNEMONIC_FILE = `${ONCHAIN_DIR}/deposit.mnemonic`
export const ONCHAIN_STATUS_FILE = `${ONCHAIN_DIR}/status.json`

/** phoenixd keeps no record of payments it rejects up front; the mint does. */
export const PHOENIXD_FAILED_SENDS_FILE = '/data/phoenixd-failed-sends.jsonl'

/** The onchain backend config Nutshell reads from MINT_PAYMENT_BACKENDS. */
export const buildOnchainBackend = (
  onchain: ConfigType['onchain'],
  phoenixd: PhoenixdConnection,
  electrumUrl: string,
): Record<string, unknown> => ({
  method: 'onchain',
  unit: 'sat',
  backend: 'phoenixd',
  // phoenixd runs on mainnet only.
  network: 'bitcoin',
  endpoint: phoenixd.url,
  password: phoenixd.password,
  min_amount: onchain.min_amount,
  confirmations: onchain.payout_confirmations,
  electrum_url: electrumUrl,
  sweep_threshold: onchain.sweep_threshold,
  sweep_min: onchain.sweep_min,
  sweep_max_age: onchain.sweep_max_age_hours * 3600,
  status_file: ONCHAIN_STATUS_FILE,
  deposit_wallet: {
    mnemonic_file: DEPOSIT_MNEMONIC_FILE,
    database_path: `${ONCHAIN_DIR}/deposits.sqlite`,
    confirmations: onchain.deposit_confirmations,
    min_sync_interval: 60,
    electrum_timeout: 60,
  },
})

export const buildMintEnvironment = (
  config: ConfigType | null,
  seed: string,
  phoenixd: PhoenixdConnection,
  onchain: OnchainConnection,
): Record<string, string> => {
  const mintInfo = config?.mint_info
  const fees = config?.fees
  const advanced = config?.advanced

  const env: Record<string, string> = {
    MINT_INFO_NAME: mintInfo?.name || 'My Sovereign Mint',
    MINT_INFO_DESCRIPTION:
      mintInfo?.description || 'A private Cashu eCash mint.',
    MINT_INFO_DESCRIPTION_LONG: mintInfo?.description_long ?? '',
    MINT_INFO_MOTD: mintInfo?.motd ?? '',
    MINT_BACKEND_BOLT11_SAT: 'PhoenixdWallet',
    MINT_PHOENIXD_URL: phoenixd.url,
    MINT_PHOENIXD_API_PASSWORD: phoenixd.password,
    MINT_PHOENIXD_FAILED_SENDS_FILE: PHOENIXD_FAILED_SENDS_FILE,
    LIGHTNING_FEE_PERCENT: String(fees?.fee_percent ?? 0),
    // The setting is in sats; Nutshell reads LIGHTNING_RESERVE_FEE_MIN in msat.
    LIGHTNING_RESERVE_FEE_MIN: String((fees?.fee_reserve_min ?? 100) * 1000),
    MINT_DATABASE,
    MINT_LISTEN_HOST: MINT_HOST,
    MINT_LISTEN_PORT: String(MINT_PORT),
    MINT_PRIVATE_KEY: seed.trim(),
    LOG_LEVEL: advanced?.log_level ?? 'INFO',
    MINT_INPUT_FEE_PPK: String(advanced?.input_fee_ppk ?? 0),
    MINT_BOLT11_DISABLE_MINT: advanced?.peg_out_only ? 'true' : 'false',
    MINT_RATE_LIMIT: (advanced?.rate_limit ?? true) ? 'true' : 'false',
    MINT_GLOBAL_RATE_LIMIT_PER_MINUTE: String(
      advanced?.rate_limit_per_minute ?? 60,
    ),
  }

  if (mintInfo?.icon_url) env.MINT_INFO_ICON_URL = mintInfo.icon_url
  if (mintInfo?.tos_url) env.MINT_INFO_TOS_URL = mintInfo.tos_url

  const contacts: string[][] = []
  if (mintInfo?.contact_email) contacts.push(['email', mintInfo.contact_email])
  if (mintInfo?.contact_nostr) contacts.push(['nostr', mintInfo.contact_nostr])
  if (mintInfo?.contact_twitter) {
    contacts.push(['twitter', mintInfo.contact_twitter])
  }
  if (contacts.length > 0) {
    env.MINT_INFO_CONTACT = JSON.stringify(contacts)
  }

  // Nutshell reads an unset limit as "no limit", so 0 means omit the variable
  // rather than send a literal zero, which would cap every operation at nothing.
  if (advanced && advanced.max_peg_in > 0) {
    env.MINT_MAX_MINT_BOLT11_SAT = String(advanced.max_peg_in)
  }
  if (advanced && advanced.max_peg_out > 0) {
    env.MINT_MAX_MELT_BOLT11_SAT = String(advanced.max_peg_out)
  }
  if (advanced && advanced.max_balance > 0) {
    env.MINT_MAX_BALANCE = String(advanced.max_balance)
  }

  if (config?.onchain.enabled && onchain) {
    env.MINT_PAYMENT_BACKENDS = JSON.stringify([
      buildOnchainBackend(config.onchain, phoenixd, onchain.electrumUrl),
    ])
  }

  return env
}
