import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.22.1:2',
  releaseNotes: {
    en_US: `First Nutcracker release: Nutshell 0.22.1 with Lightning through phoenixd, and onchain deposits and withdrawals (NUT-30) you can switch on in Onchain Settings. Onchain reads the chain from your Fulcrum server and keeps deposits in a hot wallet that sweeps into phoenixd. A read-only admin dashboard shows balances, quotes, keysets and health; run Set Admin Password to sign in.`,
    es_ES: `Primera versión de Nutcracker: Nutshell 0.22.1 con Lightning a través de phoenixd, y depósitos y retiros onchain (NUT-30) que puedes activar en Ajustes onchain. Onchain lee la cadena desde tu servidor Fulcrum y guarda los depósitos en una cartera caliente que se barre a phoenixd. Un panel de administración de solo lectura muestra saldos, cotizaciones, keysets y estado; ejecuta Establecer contraseña de administración para iniciar sesión.`,
    de_DE: `Erste Nutcracker-Version: Nutshell 0.22.1 mit Lightning über phoenixd sowie Onchain-Einzahlungen und -Auszahlungen (NUT-30), die du in den Onchain-Einstellungen einschalten kannst. Onchain liest die Blockchain von deinem Fulcrum-Server und hält Einzahlungen in einer Hot Wallet, die zu phoenixd übertragen wird. Ein schreibgeschütztes Admin-Dashboard zeigt Salden, Angebote, Keysets und Zustand; führe „Admin-Passwort festlegen“ aus, um dich anzumelden.`,
    pl_PL: `Pierwsze wydanie Nutcracker: Nutshell 0.22.1 z Lightning przez phoenixd oraz wpłatami i wypłatami onchain (NUT-30), które możesz włączyć w Ustawieniach onchain. Onchain odczytuje łańcuch z Twojego serwera Fulcrum i trzyma wpłaty w gorącym portfelu, który jest przelewany do phoenixd. Panel administracyjny tylko do odczytu pokazuje salda, wyceny, keysety i stan; uruchom Ustaw hasło administratora, aby się zalogować.`,
    fr_FR: `Première version de Nutcracker : Nutshell 0.22.1 avec Lightning via phoenixd, et des dépôts et retraits onchain (NUT-30) à activer dans les Paramètres onchain. Onchain lit la chaîne depuis votre serveur Fulcrum et garde les dépôts dans un portefeuille chaud transféré vers phoenixd. Un tableau de bord d'administration en lecture seule affiche soldes, devis, keysets et état ; lancez Définir le mot de passe d'administration pour vous connecter.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
