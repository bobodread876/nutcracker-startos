import { configYaml } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const sats = (
  name: Parameters<typeof i18n>[0],
  description: Parameters<typeof i18n>[0],
  fallback: number,
) =>
  Value.number({
    name: i18n(name),
    description: i18n(description),
    warning: null,
    default: fallback,
    required: true,
    min: 1,
    max: null,
    integer: true,
    units: 'sats',
    placeholder: String(fallback),
  })

const blocks = (
  name: Parameters<typeof i18n>[0],
  description: Parameters<typeof i18n>[0],
  fallback: number,
) =>
  Value.number({
    name: i18n(name),
    description: i18n(description),
    warning: null,
    default: fallback,
    required: true,
    min: 1,
    max: 100,
    integer: true,
    units: null,
    placeholder: String(fallback),
  })

const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Onchain Deposits and Withdrawals'),
    description: i18n(
      'Let wallets deposit bitcoin to an onchain address and withdraw to one. Requires Fulcrum.',
    ),
    warning: null,
    default: false,
  }),
  min_amount: sats(
    'Smallest Onchain Amount',
    'The least Nutcracker mints from deposits at a time, and the smallest withdrawal it pays.',
    10_000,
  ),
  deposit_confirmations: blocks(
    'Deposit Confirmations',
    'Confirmations a deposit needs before its sats can be minted.',
    3,
  ),
  payout_confirmations: blocks(
    'Withdrawal Confirmations',
    'Confirmations a withdrawal needs before Nutcracker marks it paid.',
    1,
  ),
  sweep_threshold: sats(
    'Sweep Threshold',
    'Confirmed deposits are swept into phoenixd as soon as the deposit wallet holds this much.',
    500_000,
  ),
  sweep_min: sats(
    'Minimum Daily Sweep',
    'Below the threshold, deposits are swept once a day, but only when they add up to at least this much.',
    50_000,
  ),
  sweep_max_age_hours: Value.number({
    name: i18n('Daily Sweep Interval'),
    description: i18n(
      'How long the oldest confirmed deposit waits before a sweep below the threshold.',
    ),
    warning: null,
    default: 24,
    required: true,
    min: 1,
    max: 720,
    integer: true,
    units: i18n('hours'),
    placeholder: '24',
  }),
})

export const configureOnchain = sdk.Action.withInput(
  'configure-onchain',

  async ({ effects }) => ({
    name: i18n('Onchain Settings'),
    description: i18n(
      'Switch onchain deposits and withdrawals on or off, and set their limits and sweeps.',
    ),
    warning: i18n(
      'Onchain deposits wait in a hot wallet on this server until they are swept into phoenixd. Its recovery phrase is part of this service and its backups.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => (await configYaml.read((c) => c.onchain).once()) ?? {},

  async ({ effects, input }) => {
    await configYaml.merge(effects, { onchain: input })
  },
)
