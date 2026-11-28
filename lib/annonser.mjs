// Annonser og AdSense-bryter. Alt som har med annonser å gjøre styres herfra.
//
// BRYTEREN: ADSENSE_AKTIV under. Standard er false (AV).
//   AV: ingen annonseplasser, ingen Funding Choices-/AdSense-skript, ingen annonseforespørsler, og heller
//       ingen Consent Mode-kode, ingen footerlenke for samtykke og ingen utgiver-ID i HTML eller JS.
//       Bare personvernsidene (ren tekst) og ads.txt er med.
//   PÅ: se docs/annonser.md. Slå på bare etter at AdSense-kontoen er godkjent og CMP-meldingen er publisert.
// For lokal forhåndsvisning kan byggingen overstyres med WEEKSLOT_ADSENSE=on (eller off).

export const ADSENSE_AKTIV = false;

/** Utgiver-ID (HENDT AS-kontoen). Samme ID som i public/ads.txt. */
export const UTGIVER_ID = "pub-5902367729233688";

/**
 * Annonseenhet-ID-er (data-ad-slot) fra AdSense, ett per format. Tomme til enhetene er opprettet.
 * Tom ID: plassen tegnes med reservert høyde, men det sendes ingen forespørsel.
 */
export const ENHET_IDER = { H: "", R: "" };

export function adsenseAktiv(env = process.env) {
  const v = String(env.WEEKSLOT_ADSENSE ?? "").toLowerCase();
  if (v === "on") return true;
  if (v === "off") return false;
  return ADSENSE_AKTIV === true;
}

/**
 * Tekster som bare brukes med bryteren PÅ. De ligger her og ikke i lib/i18n.ts, fordi hele Copy-objektet
 * serialiseres inn i HTML-en på alle sider, og med bryteren AV skal HTML-en ikke inneholde noe av dette.
 */
export const ETIKETTER = {
  nb: { annonse: "Annonse", samtykke: "Samtykkeinnstillinger" },
  sv: { annonse: "Annons", samtykke: "Samtyckesinställningar" },
  en: { annonse: "Advertisement", samtykke: "Consent settings" },
};

/** Format og reservert høyde (px) per plass. Merkelapp 28 px + flate 100 (H) eller 250 (R). */
export const PLASS_FORMAT = { "H-1": "H", "R-2": "R", "H-3": "H", "R-1": "R", "H-2": "H" };
export const RESERVERT_HOYDE = { H: 128, R: 278 };

/** Alle rute-typer i lib/katalog.ts. Testen sjekker at lista stemmer med typen Rute. */
export const RUTE_KINDER = [
  "hjem",
  "sesong",
  "ferieUke",
  "fylke",
  "skoleruta",
  "skolerutaHub",
  "type",
  "typeKommune",
  "leir",
  "fremhevet",
  "personvern",
  "ferieKommune",
];

/** Aldri annonser: /arrangor/ (kind «fremhevet») og personvernsidene. */
export const UTELATT_KINDER = ["fremhevet", "personvern"];

export const TREDJE_PLASS_MIN_KORT = 9;
export const MAKS_PLASSER = 3;

/**
 * Hvilke plasser en side får, etter plasseringskart.md.
 * @param {{kind: string, indekserbar: boolean, antallKort: number, tom: boolean, ukerader?: number}} side
 * @returns {string[]} plassnavn i rekkefølge nedover siden
 */
export function annonsePlasser({ kind, indekserbar, antallKort, tom, ukerader = 0 }) {
  if (!RUTE_KINDER.includes(kind)) return [];
  if (UTELATT_KINDER.includes(kind)) return [];
  if (!indekserbar) return []; // noindex-sider
  if (tom) return []; // tomme lister
  if (kind === "hjem") return ["H-1", "R-2"];
  if (kind === "leir") {
    // Bare når en innholdsseksjon (ukeradene) står mellom påmeldingsblokken og annonsen.
    return ukerader > 1 ? ["R-1"] : [];
  }
  const plasser = ["H-1", "R-2"];
  if (antallKort >= TREDJE_PLASS_MIN_KORT && kind !== "skolerutaHub") plasser.push("H-3");
  return plasser.slice(0, MAKS_PLASSER);
}
