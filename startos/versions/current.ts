import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:5',
  releaseNotes: {
    en_US:
      'Graphite & Ember adds a mobile overview and a Health tab for mint reachability and statistics freshness.',
    es_ES:
      'Graphite & Ember incorpora un resumen móvil y una pestaña de salud para comprobar la conexión con la casa de moneda y la antigüedad de las estadísticas.',
    de_DE:
      'Graphite & Ember bietet eine mobile Übersicht und einen Statusbereich für die Erreichbarkeit der Mint und das Alter der Statistiken.',
    pl_PL:
      'Graphite & Ember dodaje widok mobilny oraz kartę stanu z dostępnością mennicy i wiekiem statystyk.',
    fr_FR:
      'Graphite & Ember ajoute une vue mobile et un onglet de santé pour suivre la disponibilité de la monnaie et l’âge des statistiques.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
