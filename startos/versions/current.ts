import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:4',
  releaseNotes: {
    en_US:
      'View aggregate mint statistics on a phone with automatic recovery and expiring dashboard sessions.',
    es_ES:
      'Consulta las estadísticas agregadas de la casa de moneda en el móvil con actualización automática y sesiones temporales.',
    de_DE:
      'Aggregierte Mint-Statistiken auf dem Smartphone mit automatischer Aktualisierung und zeitlich begrenzten Sitzungen.',
    pl_PL:
      'Zbiorcze statystyki mennicy na telefonie z automatycznym odświeżaniem i sesjami o ograniczonym czasie trwania.',
    fr_FR:
      'Consultez les statistiques agrégées de la monnaie sur téléphone avec actualisation automatique et sessions temporaires.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
