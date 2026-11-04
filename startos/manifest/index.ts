import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'nutcracker',
  title: 'Nutcracker',
  license: 'MIT',
  packageRepo: 'https://github.com/bobodread876/nutcracker-startos',
  upstreamRepo: 'https://github.com/cashubtc/nutshell',
  marketingUrl: 'https://cashu.space',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    main: {
      // Built by ./Dockerfile: the digest-pinned official Nutshell image, with
      // Nutshell's source from the upstream-project submodule and patches/
      // applied on top. See UPDATING.md before changing either pin.
      source: { dockerBuild: { dockerfile: 'Dockerfile', workdir: '.' } },
      // bdkpython (the onchain wallet) publishes no Linux arm64 wheel, so the
      // image builds for x86_64 only until it does or we build it from source.
      arch: ['x86_64'],
      emulateMissing: false,
    },
  },
})
