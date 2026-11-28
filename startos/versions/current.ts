import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:5',
  releaseNotes: {
    en_US:
      'First release on the Community Registry: the Nutshell 0.22.1 Cashu mint with phoenixd for Lightning, optional NUT-30 onchain deposits and withdrawals, and a password-protected dashboard of aggregate mint statistics.',
    es_ES:
      'Primera versión en el Community Registry: la casa de moneda Cashu Nutshell 0.22.1 con phoenixd para Lightning, depósitos y retiros onchain NUT-30 opcionales y un panel protegido por contraseña con estadísticas agregadas de la casa de moneda.',
    de_DE:
      'Erste Veröffentlichung in der Community Registry: die Cashu-Mint Nutshell 0.22.1 mit phoenixd für Lightning, optionalen NUT-30-Onchain-Einzahlungen und -Auszahlungen sowie einem passwortgeschützten Dashboard mit aggregierten Mint-Statistiken.',
    pl_PL:
      'Pierwsze wydanie w Community Registry: mennica Cashu Nutshell 0.22.1 z phoenixd dla Lightning, opcjonalnymi wpłatami i wypłatami onchain NUT-30 oraz chronionym hasłem panelem z zagregowanymi statystykami mennicy.',
    fr_FR:
      'Première version sur le Community Registry : la monnaie Cashu Nutshell 0.22.1 avec phoenixd pour Lightning, des dépôts et retraits onchain NUT-30 facultatifs, et un tableau de bord protégé par mot de passe présentant des statistiques agrégées de la monnaie.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
