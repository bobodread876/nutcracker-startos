# Updating the upstream version

Nutshell runs the official `cashubtc/nutshell` multi-architecture image. The GitHub stable
release is the source of truth; the matching Docker Hub image is what the package executes.

The pin lives in `startos/manifest/index.ts` at `images.main.source.dockerTag`, and it carries
**both** a tag and a digest — `cashubtc/nutshell:<version>@sha256:<digest>`. A tag alone is not a
pin: the digest is what makes a rebuild reproduce the image that passed testing.

## Determining the upstream version

```sh
gh release view -R cashubtc/nutshell --json tagName,publishedAt,url
```

Ignore prereleases unless the package explicitly intends to ship one.

## Review compatibility first

Read every upstream release between the packaged and target versions, and never automate this
away. Check:

- database migrations and downgrade safety;
- renamed or removed environment variables — `startos/mintEnvironment.ts` builds the whole
  environment, and a renamed variable is not a type error: the mint starts anyway, on defaults;
- Python command or image working-directory changes (`exec.command` in `startos/main.ts`);
- CLNRest URL, rune, and transport behavior;
- data paths and file ownership — `MINT_DATABASE` is a directory, and `mintDatabaseFile` in
  `startos/utils.ts` reports the filename inside it;
- supported architectures in the image manifest.

## Applying the bump

Confirm the tag exists and record its multi-architecture index digest:

```sh
docker buildx imagetools inspect cashubtc/nutshell:<version>
```

Verify the index contains `linux/amd64` and `linux/arm64`, then:

1. `startos/manifest/index.ts` — set `dockerTag` to `cashubtc/nutshell:<version>@sha256:<digest>`.
