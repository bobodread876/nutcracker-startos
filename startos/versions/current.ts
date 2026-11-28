import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:7',
  releaseNotes: {
    en_US:
      'Improves payment tracking and onchain fee handling. Redemptions Only stops all issuance. The balance limit applies only to new Lightning invoices. 0 remains unlimited.',
    es_ES:
      'Mejora el seguimiento de pagos y las comisiones onchain. El modo de solo canje detiene toda emisión. El límite de saldo solo se aplica a nuevas facturas Lightning. 0 sigue sin límite.',
    de_DE:
      'Verbessert die Zahlungsverfolgung und die Abrechnung von Onchain-Gebühren. Im Modus „Nur Einlösen“ endet jede Ausgabe von eCash. Das Guthabenlimit gilt nur für neue Lightning-Rechnungen. 0 bleibt unbegrenzt.',
    pl_PL:
      'Ulepszono śledzenie płatności i rozliczanie opłat onchain. Tryb tylko wykupu wstrzymuje emisję eCash. Limit salda dotyczy tylko nowych faktur Lightning. 0 nadal oznacza brak limitu.',
    fr_FR:
      'Améliore le suivi des paiements et le calcul des frais onchain. Le mode de remboursement seul suspend toute émission. La limite de solde concerne uniquement les nouvelles factures Lightning. 0 reste illimité.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
