import { configYaml } from './fileModels/config.yaml'
import { depFulcrumDescription, depPhoenixdDescription } from './manifest/i18n'
import { sdk } from './sdk'

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.required('phoenixd', {
      description: depPhoenixdDescription,
      metadata: {
        title: 'phoenixd',
        icon: 'https://raw.githubusercontent.com/Start9-Community/phoenixd-startos/refs/heads/master/icon.svg',
      },
      versionRange: '>=0.9.2:4',
      kind: 'running',
      healthChecks: ['primary'],
    }),
  )
  .addDependency(
    // Fulcrum is the onchain chain source, so it is required only while
    // onchain deposits and withdrawals are switched on.
    sdk.Dependency.optional('fulcrum', {
      description: depFulcrumDescription,
      metadata: {
        title: 'Fulcrum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/refs/heads/master/icon.png',
      },
      versionRange: '>=2.1.4:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        (await configYaml.read((c) => c.onchain.enabled).const(effects)) ??
        false,
    }),
  )
