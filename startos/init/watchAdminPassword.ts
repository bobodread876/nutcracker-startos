import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// 'important', not 'critical': a critical task would keep the mint itself
// from starting, and the dashboard is the only thing that needs the password.
export const watchAdminPassword = sdk.setupOnInit(async (effects) => {
  const hash = await storeJson.read((s) => s.adminPasswordHash).const(effects)
  if (!hash) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'important', {
      reason: i18n('Set a password to sign in to the Admin Dashboard.'),
    })
  }
})
