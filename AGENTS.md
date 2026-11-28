# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## This repo

- **Never make the seed write in `init/generateMintSeed.ts` unconditional.** Restore replays init as `kind === 'install'`, and a fresh `mint_private_key` orphans every token the mint has issued. The same holds for the deposit phrase: the `deposit-wallet` oneshot in `main.ts` opens it with `O_EXCL` and must never overwrite it.
- **Bump the `Dockerfile` digest, the `upstream-project` submodule and `patches/` together**, as `UPDATING.md` describes; any one alone builds a different mint than the one tested.
- **Mount phoenixd's `public` volume at `full`, never its `main`**, which holds phoenixd's seed.
- **Mount only the read-only `stats` volume in the dashboard.** The dashboard must never receive the ledger, mint seed, deposit wallet, or phoenixd's password. Keep the dashboard's setup task `important` so the mint can run by itself.
- **Keep `main.ts` refusing to start when phoenixd's address or password can't be read, or when onchain is on and Fulcrum is unreachable.** A mint without its backend takes deposits it cannot settle.
