import assert from 'node:assert/strict'
import test from 'node:test'

import { buildMintEnvironment } from '../startos/mintEnvironment.ts'

/**
 * Run with `npm test` (plain `node --test` — Node 22 strips the types, so this
 * needs no test framework and no devDependencies).
 *
 * The environment mapping is where an upstream variable rename lands silently:
 * a wrong name is not a type error and the mint starts anyway, on defaults.
 * `UPDATING.md` lists it as one of the things to re-check on every bump.
 */

const phoenixd = { url: 'http://10.0.3.1:9740', password: 'phoenixd-pw' }
const electrum = { electrumUrl: 'tcp://10.0.3.1:50001' }

const config = {
  mint_info: {
    name: 'Sovereign Mint',
    description: 'Short description',
    description_long: 'Long description',
    motd: 'Hello',
    contact_email: 'mint@example.com',
    contact_nostr: 'npub1operator',
    contact_twitter: '@operator',
    icon_url: 'https://example.com/icon.png',
    tos_url: 'https://example.com/tos',
  },
  fees: {
    fee_percent: 1.5,
    fee_reserve_min: 250,
  },
  advanced: {
    log_level: 'WARNING' as const,
    input_fee_ppk: 2,
    max_peg_in: 1000,
    max_peg_out: 900,
    max_balance: 5000,
    peg_out_only: true,
    rate_limit: true,
    rate_limit_per_minute: 120,
  },
  onchain: {
    enabled: true,
    min_amount: 20_000,
    payout_confirmations: 1,
    deposit_confirmations: 3,
    sweep_threshold: 500_000,
    sweep_min: 50_000,
    sweep_max_age_hours: 24,
  },
}

test('builds a fixed phoenixd environment for StartOS', () => {
  const env = buildMintEnvironment(config, 'private-key', phoenixd, null)

  assert.equal(env.MINT_DATABASE, '/data/mint')
  assert.equal(env.MINT_LISTEN_HOST, '0.0.0.0')
  assert.equal(env.MINT_LISTEN_PORT, '3338')
  assert.equal(env.MINT_BACKEND_BOLT11_SAT, 'PhoenixdWallet')
  assert.equal(env.MINT_PHOENIXD_URL, 'http://10.0.3.1:9740')
  assert.equal(env.MINT_PHOENIXD_API_PASSWORD, 'phoenixd-pw')
  assert.equal(
    env.MINT_PHOENIXD_FAILED_SENDS_FILE,
    '/data/phoenixd-failed-sends.jsonl',
  )
  assert.equal(env.MINT_PRIVATE_KEY, 'private-key')
  assert.equal(env.MINT_CLNREST_URL, undefined)
})

test('sends the fee reserve floor to Nutshell in msat', () => {
  const env = buildMintEnvironment(config, 'private-key', phoenixd, null)
  // The operator sets 250 sats; LIGHTNING_RESERVE_FEE_MIN is read in msat.
  assert.equal(env.LIGHTNING_RESERVE_FEE_MIN, '250000')
  assert.equal(
    buildMintEnvironment(null, 'k', phoenixd, null).LIGHTNING_RESERVE_FEE_MIN,
    '100000',
  )
})

test('configures the onchain backend only when switched on and Fulcrum is wired', () => {
  const env = buildMintEnvironment(config, 'private-key', phoenixd, electrum)
  const [backend] = JSON.parse(env.MINT_PAYMENT_BACKENDS)
  assert.equal(backend.method, 'onchain')
  assert.equal(backend.backend, 'phoenixd')
  assert.equal(backend.network, 'bitcoin')
  assert.equal(backend.endpoint, 'http://10.0.3.1:9740')
  assert.equal(backend.password, 'phoenixd-pw')
  assert.equal(backend.electrum_url, 'tcp://10.0.3.1:50001')
  assert.equal(backend.min_amount, 20_000)
  assert.equal(backend.confirmations, 1)
  assert.equal(backend.sweep_max_age, 86_400)
  assert.equal(backend.deposit_wallet.confirmations, 3)
  assert.equal(
    backend.deposit_wallet.mnemonic_file,
    '/data/onchain/deposit.mnemonic',
  )
  assert.equal(backend.deposit_wallet.mnemonic, undefined)

  const off = { ...config, onchain: { ...config.onchain, enabled: false } }
  assert.equal(
    buildMintEnvironment(off, 'k', phoenixd, electrum).MINT_PAYMENT_BACKENDS,
    undefined,
  )
  assert.equal(
    buildMintEnvironment(config, 'k', phoenixd, null).MINT_PAYMENT_BACKENDS,
    undefined,
  )
})

test('maps operator settings to current Nutshell environment variables', () => {
  const env = buildMintEnvironment(config, 'private-key', phoenixd, null)

  assert.equal(env.MINT_INFO_NAME, 'Sovereign Mint')
  assert.equal(
    env.MINT_INFO_CONTACT,
    JSON.stringify([
      ['email', 'mint@example.com'],
      ['nostr', 'npub1operator'],
      ['twitter', '@operator'],
    ]),
  )
  assert.equal(env.LIGHTNING_FEE_PERCENT, '1.5')
  assert.equal(env.MINT_MAX_MINT_BOLT11_SAT, '1000')
  assert.equal(env.MINT_MAX_MELT_BOLT11_SAT, '900')
  assert.equal(env.MINT_MAX_BALANCE, '5000')
  assert.equal(env.MINT_BOLT11_DISABLE_MINT, 'true')
  assert.equal(env.MINT_RATE_LIMIT, 'true')
  assert.equal(env.MINT_GLOBAL_RATE_LIMIT_PER_MINUTE, '120')
})

test('omits optional values and deprecated variable names', () => {
  const env = buildMintEnvironment(
    {
      ...config,
      mint_info: {
        ...config.mint_info,
        contact_email: '',
        contact_nostr: '',
        contact_twitter: '',
        icon_url: '',
        tos_url: '',
      },
      advanced: {
        ...config.advanced,
        max_peg_in: 0,
        max_peg_out: 0,
        max_balance: 0,
      },
    },
    'private-key',
    phoenixd,
    null,
  )

  assert.equal(env.MINT_INFO_CONTACT, undefined)
  assert.equal(env.MINT_INFO_ICON_URL, undefined)
  assert.equal(env.MINT_MAX_MINT_BOLT11_SAT, undefined)
  assert.equal(env.MINT_MAX_MELT_BOLT11_SAT, undefined)
  assert.equal(env.MINT_MAX_BALANCE, undefined)
  assert.equal(env.MINT_DATABASE_DIR, undefined)
  assert.equal(env.MINT_MAX_PEG_IN, undefined)
  assert.equal(env.MINT_MAX_PEG_OUT, undefined)
  assert.equal(env.MINT_PEG_OUT_ONLY, undefined)
})

test('keeps upstream rate limiting enabled when no preference is stored', () => {
  const env = buildMintEnvironment(null, 'private-key', phoenixd, null)

  assert.equal(env.MINT_RATE_LIMIT, 'true')
  assert.equal(env.MINT_GLOBAL_RATE_LIMIT_PER_MINUTE, '60')
})
