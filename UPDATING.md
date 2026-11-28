# Updating the upstream version

Nutcracker builds `./Dockerfile`: the official `cashubtc/nutshell` image, digest-pinned, with Nutshell's source from the `upstream-project/` submodule copied over `/app/cashu` and `patches/*.patch` applied on top. Three pins move together on every bump:

| Pin | Where |
| --- | ----- |
| Image tag **and** `@sha256` digest | `Dockerfile` (`FROM` line) |
| Submodule commit at the same tag | `upstream-project/` (`git -C upstream-project checkout <tag>`) |
| The patches, regenerated against that tag | `patches/` |

The admin dashboard moves independently: `admin-ui/` (submodule of bobodread876/cashu-admin-ui) and the `node:22-bookworm-slim` digest in the Dockerfile's first stage. `dashboard/admin-ui.patch`, `operator-ui.patch` and `graphite-ui.patch` apply in that order to the pinned `admin-ui` commit; recheck balances, quote totals and authenticated metrics when moving that pin. The image pairs the submodule's `package.json` with `dashboard/package-lock.json`: to refresh the lock, copy both into a scratch directory, run `npm update --package-lock-only --ignore-scripts`, check `npm ci --omit=dev --ignore-scripts` and `npm audit --omit=dev`, and copy the lock back. Bump the digest with `docker buildx imagetools inspect node:22-bookworm-slim`; the build fails if `node:sqlite` or the dashboard's dependencies do not load.

The GitHub stable release is the source of truth: `gh release view -R cashubtc/nutshell --json tagName,publishedAt,url`. Ignore prereleases.

## Review compatibility first

Read every upstream release between the packaged and target versions. Check:

- database migrations and downgrade safety, and whether upstream now numbers a migration the patches also use (`m043`, `m044` in patch 0001/0003); a clash must be renumbered before release;
- renamed or removed environment variables (`startos/mintEnvironment.ts` builds the whole environment, and a renamed variable is not a type error);
- the image's working directory, Python version and command (`exec.command` in `startos/main.ts`);
- whether upstream merged any patch's feature, which retires that patch (each patch header names the condition);
- supported architectures, and whether `bdkpython` now publishes a Linux arm64 wheel (if so, add `aarch64` to the manifest and a second hash to `bdk-requirements.txt`).

## Regenerating the patches

The patches come from the `nutcracker/<version>` branch of a Nutshell checkout, rebased onto the new tag. Each patch is a `git diff` restricted to `cashu/`:

```sh
git -C <nutshell> diff <from> <to> -- cashu > patches/000N-<name>.patch   # keep the header block
```

Then confirm they apply to the exact source in the new image:

```sh
docker create --name n cashubtc/nutshell:<version>@sha256:<digest>
docker cp n:/app/cashu /tmp/img-cashu && docker rm n
diff -r upstream-project/cashu /tmp/img-cashu          # must be identical
cd /tmp && for p in <repo>/patches/*.patch; do patch -p1 --forward --batch < "$p"; done
```

Run the full Nutshell test suite on the rebased branch before regenerating; the patches are only as good as that run.

## Applying the bump

1. `docker buildx imagetools inspect cashubtc/nutshell:<version>`: record the index digest and confirm `linux/amd64` is present.
2. `Dockerfile`: set the `FROM` tag and digest.
3. `upstream-project/`: check out the same tag.
4. `patches/`: regenerate as above.
