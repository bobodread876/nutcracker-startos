import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:3',
  releaseNotes: {
    en_US:
      'The admin dashboard now receives mint statistics through a read-only summary refreshed every 30 seconds.',
    es_ES:
      'El panel de administración recibe las estadísticas de la casa de moneda mediante un resumen de solo lectura que se actualiza cada 30 segundos.',
    de_DE:
      'Das Admin-Dashboard erhält die Mint-Statistiken über eine schreibgeschützte Zusammenfassung, die alle 30 Sekunden aktualisiert wird.',
    pl_PL:
      'Panel administratora otrzymuje statystyki mennicy w podsumowaniu tylko do odczytu, odświeżanym co 30 sekund.',
    fr_FR:
      'Le tableau de bord reçoit les statistiques de la monnaie via un résumé en lecture seule actualisé toutes les 30 secondes.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
