// Consent Mode v2: alt er «denied» før noe annet skript kjører. Samme tekst brukes i <head> og i testene.
export const SAMTYKKE_PARAMETRE = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];

export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`;
