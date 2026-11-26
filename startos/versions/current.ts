import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:6',
  releaseNotes: {
    en_US:
      'The mint reads its API password from the phoenixd credential export. Requires phoenixd 0.9.2:4 or later.',
    es_ES:
      'La casa de moneda lee la contraseña desde la credencial exportada por phoenixd. Requiere phoenixd 0.9.2:4 o posterior.',
    de_DE:
      'Die Mint liest das API-Passwort aus dem Zugangsdatenexport von phoenixd. Benötigt phoenixd ab 0.9.2:4.',
    pl_PL:
      'Mennica odczytuje hasło API z danych dostępu udostępnionych przez phoenixd. Wymaga phoenixd w wersji 0.9.2:4 lub nowszej.',
    fr_FR:
      'La monnaie lit le mot de passe depuis les identifiants exportés par phoenixd. Nécessite phoenixd 0.9.2:4 ou ultérieur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
