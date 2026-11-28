<p align="center">
  <img src="icon.png" alt="Nutcracker logo" width="21%" />
</p>

# Nutcracker on StartOS

> Anything not listed in this document behaves as upstream Nutshell does, and the upstream documentation applies. See the Documentation section of `instructions.md` for links.

[Nutshell](https://github.com/cashubtc/nutshell) is a Cashu mint: a server that issues and redeems Chaumian eCash backed by bitcoin. Nutcracker runs Nutshell with patches upstream has not shipped: the payment-method abstraction, the NUT-30 onchain plugin, a phoenixd Lightning backend, and onchain payouts and deposits through phoenixd. Lightning settles through the operator's phoenixd node; onchain, when switched on, reads the chain from the operator's Fulcrum server. A read-only admin dashboard ([cashu-admin-ui](https://github.com/bobodread876/cashu-admin-ui)) runs beside the mint.

- **Upstream repo:** <https://github.com/cashubtc/nutshell>
- **Wrapper repo:** <https://github.com/Start9-Community/nutcracker-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The official Nutshell image with Nutcracker's patches applied, built by `./Dockerfile`.

| Property     | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Base image   | `cashubtc/nutshell`, digest-pinned                             |
| Source       | `upstream-project/` submodule at the corresponding upstream tag, then `patches/*.patch` |
| Extra        | `bdkpython`, hash-pinned in `bdk-requirements.txt`            |
| Dashboard    | `admin-ui/` submodule, with Node from the digest-pinned build stage in the Dockerfile |
| Architecture | x86_64                                                                |
| Command      | `poetry run mint`                                                     |

| Subcontainer         | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `nutcracker-sub`     | The `primary` daemon, the one to `attach` to                         |
| `deposit-wallet-sub` | The `deposit-wallet` oneshot, present only while onchain is switched on |
| `stats-sub` | Reads the live WAL ledger and writes aggregate statistics whenever the dashboard is enabled. |
| `admin-ui-sub`       | The `admin-ui` daemon (the dashboard), present once an admin password is set; mounts only the read-only `stats` volume |

The build copies Nutshell's source from the submodule over the image's `/app/cashu` (the two are identical at the pinned tag), applies the patches, and installs `bdkpython`. The image's own dependencies are left as upstream built them. Every setting this package controls is passed as environment on each start.

### Patches

`patches/` holds six patches, applied in order. Each one's header says when it retires.

| Patch | Adds | Retires when |
| ----- | ---- | ------------ |
| `0001-payment-method-abstraction` | Payment-method plugins (PR cashubtc/nutshell#1131), adapted to 0.22's melt lifecycle | Upstream ships #1131 |
| `0002-onchain-payment-plugin` | The NUT-30 onchain plugin (BDK), from upstream's `feat/onchain-payment-plugin` | Upstream ships the onchain plugin |
| `0003-onchain-phoenixd-payouts-and-deposits` | Onchain payouts as phoenixd splice-outs, an Electrum chain source, the deposit wallet and its sweep into phoenixd, and fixes for 0.22's melt flow (repeat payouts to one address, persisted fee choice, amountless deposit quotes) | Upstream ships phoenixd onchain support |
| `0004-mask-secrets-in-startup-log` | Masks secrets in the startup log: nested payment-backend options, and any setting named like a credential (upstream's fixed list prints `mint_phoenixd_api_password` and `mint_lnd_rpc_macaroon` in the clear) | Upstream masks by name |
| `0005-phoenixd-lightning-backend` | `PhoenixdWallet`, a bolt11 backend for phoenixd | Upstream ships a phoenixd backend |
| `0006-payment-state-safety` | Payment-state safety, method-wide redemptions-only enforcement, separate deposit confirmation advertising, chain-only onchain settlement, and reusable-quote CLI amounts | Upstream includes these lifecycle, method-setting and CLI guarantees |

`UPDATING.md` describes how the patches are regenerated and checked on a version bump.

## Volume and Data Layout

Three volumes.

| Volume | Mount Point | Purpose |
| ------ | ----------- | ------- |
| `main` | `/data` (mint only) | The mint database, the mint seed, the deposit wallet, and this package's settings |
| `stats` | `/stats` | Derived statistics. The collector writes here and the dashboard reads here. |
| `startos` | not mounted | `store.json`: the admin dashboard password, as a scrypt hash only |

| Path | Written by | Holds |
| ---- | ---------- | ----- |
| `mint/mint.sqlite3` | Nutshell | Keysets, proofs, quotes: the mint's ledger |
| `mint_private_key` | Init | The seed every issued proof derives from |
| `onchain/deposit.mnemonic` | The `deposit-wallet` oneshot | The deposit wallet's recovery phrase (mode 600) |
| `onchain/deposits.sqlite` | Nutshell | The deposit wallet's BDK database, rebuildable from the phrase |
| `onchain/status.json` | Nutshell, every minute | Deposit wallet balance, phoenixd swap-in balance, last sweep |
| `phoenixd-failed-sends.jsonl` | Nutshell | Payments phoenixd rejected before sending, so their melts roll back |
| `startos/config.yaml` | Init and the actions | The operator settings this package owns |

**The seed and the database are one unit.** The seed alone cannot tell you what has been issued, and the database alone cannot be spent against. They live on the same volume and are backed up together for that reason. The deposit phrase joins them: deposits that have not been swept yet are only spendable with it.

## File Models

Two models.

| File | Format | Modelled | Written by |
| ---- | ------ | -------- | ---------- |
| `startos/config.yaml` (on `main`) | YAML | `FileHelper.yaml` | Init and the actions |
| `store.json` (on `startos`) | JSON | `FileHelper.json` | Set Admin Password |

`config.yaml` is seeded on every init kind by an empty `merge`. Its four groups (`mint_info`, `fees`, `advanced`, `onchain`) map onto the configuration actions, and `startos/mintEnvironment.ts` turns them into Nutshell's environment on every start. The `onchain` group becomes a `MINT_PAYMENT_BACKENDS` entry when onchain is switched on.

`fees.fee_reserve_min` is in sats. Nutshell reads `LIGHTNING_RESERVE_FEE_MIN` in msat, so the environment carries the setting times 1,000.

## Dependencies

| Dependency | Required | Health checks | Why |
| ---------- | -------- | ------------- | --- |
| phoenixd (`phoenixd`) | Yes | `primary` | Creates and settles the Lightning invoices behind every Lightning deposit and withdrawal, and pays onchain withdrawals as splice-outs |
| Fulcrum (`fulcrum`) | Only while onchain is switched on | `primary` | The Electrum server the deposit wallet and payout checks read the chain from |

**phoenixd** is reached over the service bridge at port 9740. phoenixd exports its full-access `http-password` for dependents at `full/http-password` on its `public` volume; that directory alone is mounted read-only at `/mnt/phoenixd`, and the password is read on each start. Rotating it with phoenixd's own action takes effect here on Nutcracker's next restart.

**Fulcrum** is reached over the plaintext service bridge at port 50001 (`tcp://`). The dependency is optional and enabled from `onchain.enabled`, so a mint without onchain does not require Fulcrum.

The host ids and ports are inlined in `startos/utils.ts`, since a value import from `phoenixd-startos` or `fulcrum-startos` would bundle each one's dependency graph into this package.

## Network Access and Interfaces

| Interface | Id | Type | Port | Description |
| --------- | -- | ---- | ---- | ----------- |
| Cashu Mint API | `api` | api | 3338 | The Cashu API wallets connect to |
| Admin Dashboard | `admin` | ui | 3339 | The read-only dashboard; signs in with the Set Admin Password login |

StartOS terminates TLS for both interfaces. The dashboard uses the public Cashu API for public mint information. A separate collector opens the mint ledger in SQLite read-only mode and publishes a JSON summary to the dedicated `stats` volume every 30 seconds. It includes quote counts and time windows, spent proof and signed output counts, keyset counts, and total issued and redeemed amounts per unit. The dashboard runs as the unprivileged `nobody` user and mounts only this volume, read-only. The Graphite & Ember overview shows balances by unit and 24-hour quote counts. The Pulse Health tab reports mint reachability separately from snapshot age and exposes the detailed diagnostics. The open dashboard hides expired figures, retries automatically and shows the time of the most recent reading. The browser uses a tab-scoped, eight-hour session. Signing out or changing the dashboard password revokes access, including live updates. Authenticated monitoring clients can still use HTTP Basic authentication.

## Installation and First-Run Flow

Install phoenixd first and start it once, so it exports its password. Then install Nutcracker.

At install the package generates the mint seed and seeds `config.yaml` with defaults; onchain starts switched off. On every start it resolves phoenixd's bridge address, reads its password, builds the environment and launches the mint.

When the operator switches onchain on, the next start also resolves Fulcrum's bridge address and runs the `deposit-wallet` oneshot before the mint. The oneshot creates `onchain/deposit.mnemonic` with `O_EXCL` if it does not exist, and never touches an existing one, so a restored phrase survives.

## Actions

Six actions, all user-facing, none required for a working Lightning mint. Each takes effect on the next restart.

### Mint Info

The `mint_info` group: NUT-06 name, descriptions, message of the day, contacts and policy links. Idempotent.

### Lightning Fees

The percentage and the minimum reserve (in sats) held back on each outgoing Lightning payment. Both are reserves; `PhoenixdWallet` charges the routing fee phoenixd reports and returns the rest as change. phoenixd's API has no per-payment fee cap; any fee above the submitted reserve is borne by the mint. Idempotent.

### Onchain Settings

The `onchain` group: on/off, the smallest onchain amount (the least minted from deposits at a time and the smallest withdrawal), deposit and withdrawal confirmations, the sweep threshold, the minimum daily sweep, and the daily sweep interval. The action carries a warning that deposits wait in a hot wallet. Switching it on makes Fulcrum a required dependency. Payments to this mint's own deposit addresses also settle onchain, not as internal transfers. A payout without a recorded send-response txid remains pending for manual reconciliation; the mint never guesses its identity from another payout. A confirmed payout also waits for its fee record before returning change. Idempotent.

### Advanced Settings

Log level, the NUT-02 input fee, Lightning mint and melt ceilings, a total balance ceiling, a redemptions-only switch, and API rate limiting. A limit of 0 means unlimited: the variable is omitted. Redemptions Only blocks new quotes and all issuance, including single and batch issuance against existing onchain quotes; redemption remains available. Idempotent.

### Set Admin Password

Generates a 32-character password with the SDK, stores only its scrypt hash in `store.json`, and returns the username (`admin`) and the password (masked, copyable). Nutcracker restarts to apply it, mint included. Re-running replaces the password; the action warns before it does. While no password is set, an **important** task prompts for it and the dashboard daemon is not started. The task is important rather than critical because a critical task would keep the mint from starting.

### Mint Status

Read-only, any status. Reports whether the mint seed and the deposit phrase exist (never their values), the Lightning backend, whether onchain is on, the deposit wallet's confirmed balance from `onchain/status.json`, the listener, the database path and the log level. A **Missing** seed on a mint that has been running is an emergency.

## Tasks

| Task | Severity | Raised when | Action |
| ---- | -------- | ----------- | ------ |
| Set a password to sign in to the Admin Dashboard | important | No admin password is stored | Set Admin Password |

## Health Checks

| Check | Displayed | Method |
| ----- | --------- | ------ |
| `primary` | "Cashu Mint" | Port 3338 is listening |
| `stats` | "Dashboard statistics" | The summary is current (once an admin password is set). |
| `admin-ui` | "Admin Dashboard" | `GET /health` on 3339 answers (once a password is set) |

`stats` fails when the summary is more than about a minute old: the collector has stopped or cannot read the ledger, and its log says which. `admin-ui` failing with `stats` green means the dashboard process itself is down.

A start that fails before the daemon exists is `main.ts` throwing, and the log says why: phoenixd unreachable, phoenixd's password unreadable, or onchain switched on with Fulcrum unreachable. A listening port proves the mint is serving, not that it can settle; only a real deposit and withdrawal prove the payment paths.

## Backups and Restore

Backups cover the mint and its configuration: `sdk.Backups.ofVolumes('main', 'startos')`. The mint seed, the ledger and the deposit phrase are captured together. phoenixd's password export is mounted read-only and is never part of Nutcracker's backup; phoenixd backs itself up.

A restored instance needs nothing re-entered. Init sees the existing seed and does not generate one, and the oneshot sees the existing deposit phrase. phoenixd's and Fulcrum's addresses are resolved fresh on every start.

Restoring a stale ledger rolls back the spent-proof records: tokens redeemed after the backup can become spendable again. Tokens issued afterward are not necessarily rejected when their signing keyset is present. A backup restores a consistent snapshot, not activity since that snapshot; reopening a stale mint can lose reserves. Keep it offline until its later activity has been reconciled, and never run two instances of the same mint.

## Limitations and Differences

1. **phoenixd is the only Lightning backend.** Core Lightning and LND are not offered.
2. **SQLite only.**
3. **x86_64 only.** `bdkpython` publishes no Linux arm64 wheel and no source distribution.
4. **Onchain is mainnet only**, because phoenixd is.
5. **The deposit wallet is hot.** Its phrase is on the service volume and in its backups.
6. **Upstream database migrations run when the mint starts**, including the patches' `m043` (method data) and `m044` (accounting backfill). A downgrade is not supported.
7. **Management RPC, OIDC authentication and the Redis cache are not exposed.**

---

## Quick Reference for AI Consumers

```yaml
package_id: nutcracker
image: built from ./Dockerfile # cashubtc/nutshell digest-pinned + patches/
architectures:
  - x86_64
subcontainers:
  - nutcracker-sub # primary daemon
  - deposit-wallet-sub # oneshot, only while onchain is on
  - stats-sub # collector, mounts the ledger directory and stats
  - admin-ui-sub # dashboard, mounts only stats read-only
volumes:
  main: /data
  stats: /stats
  startos: unmounted # store.json
file_models:
  - startos/config.yaml # mint_info, fees, advanced, onchain
  - store.json # adminPasswordHash (scrypt)
startos_managed_env_vars:
  - MINT_DATABASE
  - MINT_LISTEN_HOST
  - MINT_LISTEN_PORT
  - MINT_PRIVATE_KEY
  - MINT_BACKEND_BOLT11_SAT # PhoenixdWallet
  - MINT_PHOENIXD_URL
  - MINT_PHOENIXD_API_PASSWORD
  - MINT_PHOENIXD_FAILED_SENDS_FILE
  - MINT_PAYMENT_BACKENDS # onchain backend JSON, only while onchain is on
  - MINT_INFO_NAME
  - MINT_INFO_DESCRIPTION
  - MINT_INFO_DESCRIPTION_LONG
  - MINT_INFO_MOTD
  - MINT_INFO_CONTACT
  - MINT_INFO_ICON_URL
  - MINT_INFO_TOS_URL
  - LIGHTNING_FEE_PERCENT
  - LIGHTNING_RESERVE_FEE_MIN # msat (setting in sats x 1000)
  - LOG_LEVEL
  - MINT_INPUT_FEE_PPK
  - MINT_MAX_MINT_BOLT11_SAT # omitted when unlimited
  - MINT_MAX_MELT_BOLT11_SAT # omitted when unlimited
  - MINT_MAX_BALANCE # omitted when unlimited
  - MINT_DISABLE_MINT
  - MINT_RATE_LIMIT
  - MINT_GLOBAL_RATE_LIMIT_PER_MINUTE
dependencies:
  - phoenixd # required; health check "primary"; public/full mounted read-only
  - fulcrum # only while onchain is on; health check "primary"
interfaces:
  api: { type: api, port: 3338 }
  admin: { type: ui, port: 3339 }
actions:
  - configure-mint-info
  - configure-fees
  - configure-onchain
  - configure-advanced
  - set-admin-password
  - show-mint-info
tasks:
  - set-admin-password # important, while no password is stored
health_checks:
  - primary # displayed "Cashu Mint"
  - stats # publishes the dashboard summary
  - admin-ui # displayed "Admin Dashboard"
```
