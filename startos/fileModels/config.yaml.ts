import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const mintInfoShape = z
  .looseObject({
    name: z.string().catch('My Sovereign Mint'),
    description: z.string().catch('A private Cashu eCash mint.'),
    description_long: z.string().catch(''),
    motd: z.string().catch(''),
    contact_email: z.string().catch(''),
    contact_nostr: z.string().catch(''),
    contact_twitter: z.string().catch(''),
    icon_url: z.string().catch(''),
    tos_url: z.string().catch(''),
  })
  .catch({
    name: 'My Sovereign Mint',
    description: 'A private Cashu eCash mint.',
    description_long: '',
    motd: '',
    contact_email: '',
    contact_nostr: '',
    contact_twitter: '',
    icon_url: '',
    tos_url: '',
  })

const feesShape = z
  .looseObject({
    fee_percent: z.number().catch(0),
    fee_reserve_min: z.number().int().min(0).catch(100),
  })
  .catch({ fee_percent: 0, fee_reserve_min: 100 })

const advancedShape = z
  .looseObject({
    log_level: z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR']).catch('INFO'),
    input_fee_ppk: z.number().int().min(0).catch(0),
    max_peg_in: z.number().int().min(0).catch(0),
    max_peg_out: z.number().int().min(0).catch(0),
    max_balance: z.number().int().min(0).catch(0),
    peg_out_only: z.boolean().catch(false),
    rate_limit: z.boolean().catch(true),
    rate_limit_per_minute: z.number().int().min(1).catch(60),
  })
  .catch({
    log_level: 'INFO',
    input_fee_ppk: 0,
    max_peg_in: 0,
    max_peg_out: 0,
    max_balance: 0,
    peg_out_only: false,
    rate_limit: true,
    rate_limit_per_minute: 60,
  })

const onchainShape = z
  .looseObject({
    enabled: z.boolean().catch(false),
    min_amount: z.number().int().min(1).catch(10_000),
    payout_confirmations: z.number().int().min(1).catch(1),
    deposit_confirmations: z.number().int().min(1).catch(3),
    sweep_threshold: z.number().int().min(1).catch(500_000),
    sweep_min: z.number().int().min(1).catch(50_000),
    sweep_max_age_hours: z.number().int().min(1).catch(24),
  })
  .catch({
    enabled: false,
    min_amount: 10_000,
    payout_confirmations: 1,
    deposit_confirmations: 3,
    sweep_threshold: 500_000,
    sweep_min: 50_000,
    sweep_max_age_hours: 24,
  })

const shape = z.looseObject({
  mint_info: mintInfoShape,
  fees: feesShape,
  advanced: advancedShape,
  onchain: onchainShape,
})

export type ConfigType = z.infer<typeof shape>

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.main, subpath: 'startos/config.yaml' },
  shape,
)
