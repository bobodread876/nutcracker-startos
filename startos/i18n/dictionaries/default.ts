export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Nutcracker': 0,
  'Cashu Mint': 1,
  'The mint is responsive': 2,
  'The mint is not ready': 3,
  'phoenixd is not reachable on the internal network. Make sure phoenixd is installed and running.': 4,
  "phoenixd's http-password could not be read. Start phoenixd once so it writes its config, then start Nutcracker again.": 5,

  // interfaces.ts
  'Cashu Mint API': 6,
  'The Cashu API wallets connect to': 7,

  // actions/configureMintInfo.ts
  'Mint Info': 8,
  'Set the name, description and contact details wallets show for your mint (NUT-06).': 9,
  'Mint Name': 10,
  'Display name shown to wallets connecting to your mint.': 11,
  Description: 12,
  'A sentence or two about your mint, published in its public info.': 13,
  'Long Description': 14,
  'Optional longer text about your mint, published in its public info.': 15,
  'Message of the Day': 16,
  'Temporary notice shown to wallet users.': 17,
  'Contact Email': 18,
  "Published in your mint's public info so users can reach you.": 19,
  'Contact Nostr': 20,
  "Your Nostr public key (npub or hex), published in your mint's public info so users can reach you.": 21,
  'Contact Twitter/X': 22,
  "Your Twitter/X handle, published in your mint's public info so users can reach you.": 23,
  'Icon URL': 24,
  "URL of your mint's icon or logo image.": 25,
  'Terms of Service URL': 26,
  "Link to your mint's terms of service.": 27,

  // actions/configureFees.ts
  'Lightning Fees': 28,
  'Set the routing-fee reserve held back on outgoing Lightning payments.': 29,
  'Lightning Fee Reserve': 30,
  'Percentage of each outgoing Lightning payment reserved for routing fees.': 31,
  'Minimum Fee Reserve': 32,
  'Minimum satoshi reserve added to outgoing Lightning payments.': 33,

  // actions/configureAdvanced.ts
  'Advanced Settings': 34,
  'Set logging, input fees, transaction limits and rate limiting.': 35,
  'Log Level': 36,
  '- DEBUG: the most detail; turn it on while troubleshooting, then switch back\n- INFO: normal operation\n- WARNING: only warnings and errors\n- ERROR: only errors': 37,
  'Input Fee': 38,
  'Fee charged on token inputs, in parts per thousand (NUT-02). 0 charges no fee.': 39,
  'Maximum Lightning Mint Amount': 40,
  'Largest Lightning deposit allowed in a new mint quote. Does not limit onchain deposits. 0 is unlimited.': 41,
  'Maximum Lightning Melt Amount': 42,
  'Largest amount that can be redeemed to Lightning in one operation. 0 is unlimited.': 43,
  'New Lightning Invoice Balance Limit': 44,
  'Balance limit when accepting new Lightning invoices. Existing invoices and onchain deposits can take the balance above it. 0 is unlimited.': 45,
  'Redemptions Only': 46,
  'Stop issuing new eCash. Existing eCash can still be redeemed to Lightning.': 47,
  'Rate Limiting': 48,
  'Limit how many API requests the mint will answer per minute.': 49,
  'Request Limit': 50,
  'Maximum API requests per minute while rate limiting is on.': 51,

  // actions/showMintInfo.ts
  'Mint Status': 52,
  'Show the mint seed status, Lightning backend, onchain status, listener and database path.': 53,
  'Mint Seed': 54,
  'Whether the eCash seed exists on the volume. Its value is never shown.': 55,
  Present: 56,
  Missing: 57,
  'Lightning Backend': 58,
  'The wallet backend the mint settles payments through.': 59,
  'Listen Address': 60,
  'The address and port the mint binds inside its container.': 61,
  'Database Path': 62,
  'Where the mint database is stored inside the container.': 63,
  'Current logging verbosity.': 64,

  // Nutcracker: onchain settings and status
  'Onchain is switched on, but Fulcrum is not reachable on the internal network. Install and start Fulcrum, or switch onchain off in Onchain Settings.': 65,
  'Onchain Settings': 66,
  'Switch onchain deposits and withdrawals on or off, and set their limits and sweeps.': 67,
  'Onchain deposits wait in a hot wallet on this server until they are swept into phoenixd. Its recovery phrase is part of this service and its backups.': 68,
  'Onchain Deposits and Withdrawals': 69,
  'Let wallets deposit bitcoin to an onchain address and withdraw to one. Requires Fulcrum.': 70,
  'Smallest Onchain Amount': 71,
  'The least Nutcracker mints from deposits at a time, and the smallest withdrawal it pays.': 72,
  'Deposit Confirmations': 73,
  'Confirmations a deposit needs before its sats can be minted.': 74,
  'Withdrawal Confirmations': 75,
  'Confirmations a withdrawal needs before Nutcracker marks it paid.': 76,
  'Sweep Threshold': 77,
  'Confirmed deposits are swept into phoenixd as soon as the deposit wallet holds this much.': 78,
  'Minimum Daily Sweep': 79,
  'Below the threshold, deposits are swept once a day, but only when they add up to at least this much.': 80,
  'Daily Sweep Interval': 81,
  'How long the oldest confirmed deposit waits before a sweep below the threshold.': 82,
  hours: 83,
  Onchain: 84,
  'Whether onchain deposits and withdrawals are switched on.': 85,
  On: 86,
  Off: 87,
  'Deposit Wallet Phrase': 88,
  "Whether the onchain deposit wallet's recovery phrase exists on the volume. Its value is never shown.": 89,
  'Deposit Wallet Balance': 90,
  "Confirmed sats in the deposit wallet waiting for the next sweep, as of the mint's last status update.": 91,
  'Not available yet': 92,

  // Nutcracker: admin dashboard
  'Admin Dashboard': 93,
  'A read-only dashboard of the mint: balances, quotes, keysets and health': 94,
  'Set Admin Password': 95,
  'Generate a new random password for the admin dashboard. Nutcracker restarts to apply it.': 96,
  'This replaces the current admin dashboard password, and the old one stops working.': 97,
  'Admin Dashboard Login': 98,
  'Use these to sign in to the Admin Dashboard interface. Only a hash of the password is stored, so save it now.': 99,
  Username: 100,
  Password: 101,
  'Set a password to sign in to the Admin Dashboard.': 102,
  'The admin dashboard is ready': 103,
  'The admin dashboard is not responding': 104,
  'Dashboard statistics': 105,
  'Dashboard statistics are current': 106,
  'Waiting for current mint statistics': 107,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
