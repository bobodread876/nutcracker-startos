# Nutcracker

> [!IMPORTANT]
> **Install phoenixd first.** Nutcracker settles every Lightning deposit and withdrawal, and every onchain withdrawal, through it, and will not start without it. Start phoenixd once and fund its channel before you take deposits.

> [!WARNING]
> **You are holding other people's money.** A Cashu mint issues bearer tokens against bitcoin you custody. If you lose the mint's seed or its database, the eCash your users hold cannot be redeemed, by you or by anyone. Back up early, back up after real activity, and confirm at least once that a backup restores.

## Documentation

- [Nutshell README](https://github.com/cashubtc/nutshell/blob/main/README.md): the upstream mint, including what each setting does.
- [Cashu documentation](https://docs.cashu.space): how Cashu works, and the NUT specifications the settings refer to.
- [NUT-30](https://github.com/cashubtc/nuts): onchain deposits and withdrawals.

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
4. **Run *Advanced Settings* if you want limits.** Lightning deposit, withdrawal and total-balance ceilings all start unlimited. A new mint is a good place to be conservative.
5. **Switch on onchain, if you want it.** Install Fulcrum and let it finish syncing, then run *Onchain Settings* and turn on *Onchain Deposits and Withdrawals*. Nutcracker creates the deposit wallet the next time it starts.
6. **Run *Set Admin Password*** to open the admin dashboard. Save the password it shows; only a hash of it is kept.
7. **Take a backup.** Then restore it somewhere and check the mint comes back.

Nutcracker restarts after each of these, and the change takes effect then.

## Using Nutcracker

### Connecting a wallet

Copy an address from the **Cashu Mint API** interface and add it as a mint in any Cashu wallet, such as [cashu.me](https://cashu.me) or a mobile wallet that supports adding a custom mint.

Test a small deposit and withdrawal before anyone else uses the mint. That round trip is the only proof that payments settle end to end. A green health check only means the mint is answering.

### Onchain deposits and withdrawals

With onchain switched on, a wallet that supports Cashu's onchain method can ask for a deposit address, or pay out to a bitcoin address.

- **Deposits** go to a fresh address in Nutcracker's own deposit wallet. Once a deposit has the confirmations set in *Onchain Settings* (3 by default), the wallet can mint eCash for it. Nutcracker mints at least the *Smallest Onchain Amount* (10,000 sats by default) at a time, so smaller deposits wait on the address until they add up.
- **Withdrawals** are paid by phoenixd straight from its channel. The wallet picks a fee option; Nutcracker charges the mining fee phoenixd actually paid, up to that option's reserve, and returns the rest as change.
- **Sweeps** move confirmed deposits from the deposit wallet into phoenixd. A sweep runs as soon as the deposit wallet holds the *Sweep Threshold* (500,000 sats by default), or once a day when deposits add up to at least the *Minimum Daily Sweep* (50,000 sats by default). Sweep fees are paid by the mint.

The deposit wallet is a hot wallet on this server. Its recovery phrase is stored with the mint and included in every backup.

### The admin dashboard

Open the **Admin Dashboard** interface and enter the password from *Set Admin Password*. The username is filled in. Your session lasts up to eight hours in this tab. You can sign out at any time. Overview shows the outstanding eCash and the mint and melt quotes from the last 24 hours. Open Health to see whether the mint is reachable and how long ago the collector refreshed its figures. Open the dashboard menu for Monitoring, Keysets or Sign out. If they are delayed, it hides them and retries automatically. A displayed zero is a current reading. It shows outstanding eCash per unit, quote counts, keysets, the mint's health and the server's load. It only reads: mint settings are changed through the actions below.

### Actions

- **Mint Info**: the name, descriptions, message of the day, contact details and policy links wallets display for your mint.
- **Lightning Fees**: how much of each outgoing Lightning payment is held back for routing. Both settings are a reserve, and what isn't needed comes back to the user as change. Too low and withdrawals fail to route; too high and withdrawing looks expensive.
- **Onchain Settings**: onchain deposits and withdrawals on or off, the smallest onchain amount, confirmation counts, and the sweep rules.
- **Advanced Settings**: log level, the fee you charge on inputs, Lightning deposit and withdrawal ceilings, a total-balance ceiling, a withdrawals-only switch, and API rate limiting.

  > **A limit of 0 means unlimited.** Leave a limit at 0 to have none.
  >
  > **Redemptions Only** stops the mint issuing new eCash while leaving what is already out there redeemable. Turn it on to wind a mint down: let people cash out, and only then shut it off.
- **Set Admin Password**: creates a new password for the admin dashboard and shows it once. Nutcracker restarts to apply it, so the mint is unavailable for a few seconds.
- **Mint Status**: confirms the mint seed and the deposit wallet's recovery phrase are on disk (without showing either), and shows the Lightning backend, whether onchain is on, the deposit wallet's confirmed balance, the listener and the database. Run it first if something looks wrong; it works whether or not the service is running.

## Restoring from a backup

Restoring brings back the whole mint: seed, database, deposit wallet and your settings. Nothing needs re-entering. phoenixd and Fulcrum are found again automatically.

A restore cannot recover eCash issued after the backup was taken. Those tokens exist in people's wallets but not in the restored ledger, and the mint will refuse them. Take a backup after any real activity.

## Limitations

- **phoenixd is the only Lightning backend**, and SQLite the only database.
- **Onchain needs Fulcrum.** It runs on mainnet, where phoenixd runs.
- **x86_64 servers only for now.** The onchain wallet library publishes no build for ARM servers.
- **This is the mint only.** Use any Cashu wallet to hold and spend the eCash your mint issues.
