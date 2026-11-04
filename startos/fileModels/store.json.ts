import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Package-only state, on the `startos` volume that no subcontainer mounts.
 * The admin dashboard password is kept only as a scrypt hash, in the format
 * the dashboard verifies (scrypt$N$r$p$saltBase64$hashBase64).
 */
const shape = z.looseObject({
  adminPasswordHash: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
