import { sdk } from '../sdk'
import { configureAdvanced } from './configureAdvanced'
import { configureFees } from './configureFees'
import { configureMintInfo } from './configureMintInfo'
import { configureOnchain } from './configureOnchain'
import { setAdminPassword } from './setAdminPassword'
import { showMintInfo } from './showMintInfo'

export const actions = sdk.Actions.of()
  .addAction(configureMintInfo)
  .addAction(configureFees)
  .addAction(configureOnchain)
  .addAction(configureAdvanced)
  .addAction(setAdminPassword)
  .addAction(showMintInfo)
