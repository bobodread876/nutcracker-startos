# Nutcracker

> [!IMPORTANT]
> **Install phoenixd first.** Nutcracker settles every Lightning deposit and withdrawal, and every onchain withdrawal, through it, and will not start without it. Start phoenixd once and fund its channel before you take deposits.

> [!WARNING]
> **You are holding other people's money.** A Cashu mint issues bearer tokens against bitcoin you custody. Losing the mint seed prevents redemption; losing the database removes its record of spent tokens and makes further operation unsafe. Back up early, back up after real activity, and confirm at least once that a backup restores.

## Documentation

- [Nutshell README](https://github.com/cashubtc/nutshell/blob/main/README.md) — the upstream mint, including what each setting does
- [Cashu documentation](https://docs.cashu.space) — how Cashu works
- [Cashu NUTs](https://github.com/cashubtc/nuts) — the protocol specifications the settings refer to, NUT-30 onchain among them

## What you get on StartOS

- A Cashu mint wired to your own phoenixd node. The two find each other, so there are no credentials to copy.
- Optional onchain deposits and withdrawals, reading the chain from your own Fulcrum server.
- An address you hand to Cashu wallets. Your server manages every form of it, so the mint is reachable on your LAN, over Tor, or on a domain, as you choose.
- A read-only admin dashboard showing the mint's balances, quotes, keysets and health.
- The mint's seed, its database and the onchain deposit wallet backed up together, so a single restore brings the whole mint back.

## Getting set up

Nutcracker starts with working defaults. Do these in order:

1. **Install and start phoenixd, and fund its channel.** Nutcracker will not start until it can reach phoenixd.
2. **Start Nutcracker.** It creates its own mint seed on first install and comes up on the defaults, with Lightning only.
3. **Run *Mint Info*.** Give the mint a name and a description. Wallets show this to people before they trust the mint with money. Add the contact and policy links you want published, and do this before you share the address.
4. **Run *Advanced Settings* if you want limits on Lightning deposits and withdrawals.** These start unlimited. The balance setting only controls acceptance of new Lightning invoices; it does not cap issuance from existing quotes or onchain deposits.
5. **Switch on onchain, if you want it.** Install Fulcrum and let it finish syncing, then run *Onchain Settings* and turn on *Onchain Deposits and Withdrawals*. Nutcracker creates the deposit wallet the next time it starts.
6. **Run *Set Admin Password*** to open the admin dashboard. Save the password it shows; only a hash of it is kept.
7. **Take a backup.** Verify a restore in isolation, without accepting payments or redemptions. Never serve the same mint from two instances.

Nutcracker restarts after each of these, and the change takes effect then.

## Using Nutcracker

### Connecting a wallet

Copy an address from the **Cashu Mint API** interface and add it as a mint in any Cashu wallet, such as [cashu.me](https://cashu.me) or a mobile wallet that supports adding a custom mint.

Test a small deposit and withdrawal before anyone else uses the mint. That round trip is the only proof that payments settle end to end. A green health check only means the mint is answering.

### Onchain deposits and withdrawals

With onchain switched on, a wallet that supports Cashu's onchain method can ask for a deposit address, or pay out to a bitcoin address.

- **Deposits** go to a fresh address in Nutcracker's own deposit wallet. Once a deposit has the confirmations set in *Onchain Settings* (3 by default), the wallet can mint eCash for it. Nutcracker mints at least the *Smallest Onchain Amount* (10,000 sats by default) at a time, so smaller deposits wait on the address until they add up.
- **Withdrawals** are paid by phoenixd straight from its channel. The wallet picks a fee option; Nutcracker charges the mining fee phoenixd actually paid, up to that option's reserve, and returns the rest as change. Payments to this mint's own deposit addresses also settle onchain. If a send response is lost, the payout stays pending until it can be reconciled; a confirmed payout waits for its fee record before returning change.
- **Sweeps** move confirmed deposits from the deposit wallet into phoenixd. A sweep runs as soon as the deposit wallet holds the *Sweep Threshold* (500,000 sats by default), or once a day when deposits add up to at least the *Minimum Daily Sweep* (50,000 sats by default). Sweep fees are paid by the mint.

The deposit wallet is a hot wallet on this server. Its recovery phrase is stored with the mint and included in every backup.

### The admin dashboard

Open the **Admin Dashboard** interface and sign in with the password from *Set Admin Password*; the username is filled in. A session lasts up to eight hours in that browser tab, and you can sign out at any time.

- **Overview** shows the outstanding eCash per unit and the mint and melt quotes from the last 24 hours.
- **Health** shows whether the mint is reachable and how long ago the figures were refreshed.
- The dashboard menu opens **Monitoring** (the server's load), **Keysets**, and **Sign out**.

Figures refresh about every 30 seconds. When they fall behind, the dashboard hides them until fresh ones arrive, so a zero on screen is a current reading. The dashboard only reads: mint settings are changed through the actions below.

### Actions

- **Mint Info**: the name, descriptions, message of the day, contact details and policy links wallets display for your mint.
- **Lightning Fees**: how much of each outgoing Lightning payment is held back for routing. Both settings are a reserve, and what isn't needed comes back to the user as change. phoenixd does not accept a per-payment fee cap: if the actual routing fee exceeds the reserve, the mint pays the difference. A high reserve makes withdrawing look expensive.
- **Onchain Settings**: onchain deposits and withdrawals on or off, the smallest onchain amount, confirmation counts, and the sweep rules.
- **Advanced Settings**: log level, the fee you charge on inputs, Lightning deposit and withdrawal limits, a balance limit for new Lightning invoices, a withdrawals-only switch, and API rate limiting.

  > **The balance limit is not a cap on funds or outstanding eCash.** Already accepted Lightning quotes and reusable onchain addresses can issue beyond it. Do not rely on it to bound your custody exposure.

  > **A limit of 0 means unlimited.** Leave a limit at 0 to have none.
  >
  > **Redemptions Only** stops the mint issuing new eCash while leaving what is already out there redeemable. It also blocks issuance against existing onchain deposit addresses, including batch issuance. Bitcoin can still be sent to those addresses; stop advertising deposits and reconcile paid deposits before winding down. Let people cash out, and only then shut it off.
- **Set Admin Password**: creates a new password for the admin dashboard and shows it once. Nutcracker restarts to apply it, so the mint is unavailable for a few seconds.
- **Mint Status**: confirms the mint seed and the deposit wallet's recovery phrase are on disk (without showing either), and shows the Lightning backend, whether onchain is on, the deposit wallet's confirmed balance, the listener and the database. Run it first if something looks wrong; it works whether or not the service is running.

## Restoring from a backup

Restoring brings back the whole mint: seed, database, deposit wallet and your settings. Nothing needs re-entering. phoenixd and Fulcrum are found again automatically.

A stale backup forgets which tokens were spent afterward. Those tokens can become spendable again, while tokens issued afterward may still be accepted. Reopening that mint can lose the bitcoin backing your users' eCash. Keep a stale restore offline until the later activity has been reconciled; never run the original mint and its restore at the same time. Take a fresh backup after real activity.

## Limitations

- **phoenixd is the only Lightning backend.** Core Lightning and LND are not offered.
