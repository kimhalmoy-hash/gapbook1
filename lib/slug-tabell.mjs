/**
 * Slugs for bølge 1. ASCII, ingen årstall, og ferie-/kategorislugs
 * skal ikke kollidere med en by i samme region.
 */
import { slug } from "./pure.mjs";

export const REGION_SLUG = {
  "SE-AB": "stockholm",
  "SE-C": "uppsala",
  "SE-D": "sodermanland",
  "SE-E": "ostergotland",
  "SE-F": "jonkoping",
  "SE-G": "kronoberg",
  "SE-H": "kalmar",
  "SE-I": "gotland",
  "SE-K": "blekinge",
  "SE-M": "skane",
  "SE-N": "halland",
  "SE-O": "vastra-gotaland",
  "SE-S": "varmland",
  "SE-T": "orebro",
  "SE-U": "vastmanland",
  "SE-W": "dalarna",
  "SE-X": "gavleborg",
  "SE-Y": "vasternorrland",
  "SE-Z": "jamtland",
  "SE-AC": "vasterbotten",
  "SE-BD": "norrbotten",
  "DE-BW": "baden-wuerttemberg",
  "DE-BY": "bayern",
  "DE-BE": "berlin",
  "DE-BB": "brandenburg",
  "DE-HB": "bremen",
  "DE-HH": "hamburg",
  "DE-HE": "hessen",
  "DE-MV": "mecklenburg-vorpommern",
  "DE-NI": "niedersachsen",
  "DE-NW": "nordrhein-westfalen",
  "DE-RP": "rheinland-pfalz",
  "DE-SL": "saarland",
  "DE-SN": "sachsen",
  "DE-ST": "sachsen-anhalt",
  "DE-SH": "schleswig-holstein",
  "DE-TH": "thueringen",
  "AT-1": "burgenland",
  "AT-2": "kaernten",
  "AT-3": "niederoesterreich",
  "AT-4": "oberoesterreich",
  "AT-5": "salzburg",
  "AT-6": "steiermark",
  "AT-7": "tirol",
  "AT-8": "vorarlberg",
  "AT-9": "wien",
  "GB-ENG": "england",
  "GB-SCT": "scotland",
  "GB-WLS": "wales",
  "GB-NIR": "northern-ireland",
  "IE-D": "dublin",
  "IE-CO": "cork",
  "IE-G": "galway",
  "IE-L": "limerick",
  "IE-WD": "waterford",
  "IE-KE": "kildare",
  "IE-MH": "meath",
  "IE-WW": "wicklow",
  "IE-TA": "tipperary",
};

const KATEGORI = {
  idrett: { sv: "idrott", de: "sport", "en-GB": "sports-camps", "en-IE": "sports-camps" },
  multiaktivitet: { sv: "dagkollo", de: "ferienbetreuung", "en-GB": "holiday-clubs", "en-IE": "multi-activity-camps" },
  kreativt: { sv: "skapande", de: "kreativ", "en-GB": "arts-and-crafts", "en-IE": "arts-and-crafts" },
  realfag: { sv: "teknik-och-natur", de: "mint", "en-GB": "stem", "en-IE": "stem" },
  "musikk/scene": { sv: "musik-och-teater", de: "musik-und-theater", "en-GB": "music-and-drama", "en-IE": "music-and-drama" },
  overnatting: { sv: "kollo", de: "ferienlager", "en-GB": "residential-camps", "en-IE": "residential-camps" },
  natur: { sv: "natur-och-friluftsliv", de: "natur", "en-GB": "outdoors", "en-IE": "outdoors" },
  ridning: { sv: "ridlager", de: "reiten", "en-GB": "horse-riding", "en-IE": "horse-riding" },
  spraak: { sv: "sprak", de: "sprachen", "en-GB": "languages", "en-IE": "languages" },
  museum: { sv: "museer-och-lovprogram", de: "museum-und-ferienprogramm", "en-GB": "museums-and-family", "en-IE": "museums-and-family" },
};

const FERIE = {
  SE: { vinter: "sportlov", paske: "pasklov", sommer: "sommarlov", host: "hostlov" },
  DE: { vinter: "winterferien", paske: "osterferien", sommer: "sommerferien", host: "herbstferien", pinse: "pfingstferien" },
  AT: { vinter: "semesterferien", paske: "osterferien", sommer: "sommerferien", host: "herbstferien" },
  "GB-EN": { vinter: "february-half-term", paske: "easter-holidays", sommer: "summer-holidays", host: "october-half-term", halvterm: "may-half-term" },
  "GB-SCT": { vinter: "february-break", paske: "easter-holidays", sommer: "summer-holidays", host: "october-holidays" },
  IE: { vinter: "february-mid-term", paske: "easter-holidays", sommer: "summer-holidays", host: "october-mid-term" },
};

export function spraakFor(land) {
  if (land === "SE") return "sv";
  if (land === "DE" || land === "AT") return "de";
  if (land === "GB") return "en-GB";
  if (land === "IE") return "en-IE";
  return "nb";
}

export function maalFor(land) {
  if (land === "SE") return "sv-SE";
  if (land === "DE") return "de-DE";
  if (land === "AT") return "de-AT";
  if (land === "GB") return "en-GB";
  if (land === "IE") return "en-IE";
  return "nb-NO";
}

export function slugSpraak(verdi, spraak) {
  let tekst = String(verdi ?? "").trim();
  if (spraak === "de") {
    tekst = tekst
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/Ä/g, "Ae")
      .replace(/Ö/g, "Oe")
      .replace(/Ü/g, "Ue");
  }
  return slug(tekst);
}

export function regionSlug(isoKode) {
  return REGION_SLUG[isoKode] || null;
}

/** Dublin by er dublin-city. Andre tettsteder i county Dublin beholder sitt navn. */
export function stedSlug(leir) {
  const spraak = spraakFor(leir.land);
  const by = slugSpraak(leir.by || leir.kommune, spraak);
  if (leir.land === "IE" && regionSlug(leir.region) === "dublin" && (by === "dublin" || slugSpraak(leir.kommune, spraak) === "dublin")) {
    return "dublin-city";
  }
  return by;
}

export function kategoriSlug(land, kategori) {
  const rad = KATEGORI[kategori];
  if (!rad) return null;
  return rad[spraakFor(land)] || null;
}

export function kategoriNavn(land, kategori) {
  const navn = {
    idrett: { sv: "Idrott", de: "Sport", "en-GB": "Sports camps", "en-IE": "Sports camps" },
    multiaktivitet: { sv: "Dagkollo", de: "Ferienbetreuung", "en-GB": "Holiday clubs", "en-IE": "Multi-activity camps" },
    kreativt: { sv: "Skapande", de: "Kreativ", "en-GB": "Arts and crafts", "en-IE": "Arts and crafts" },
    "musikk/scene": { sv: "Musik och teater", de: "Musik und Theater", "en-GB": "Music and drama", "en-IE": "Music and drama" },
    overnatting: { sv: "Kollo", de: "Ferienlager", "en-GB": "Residential camps", "en-IE": "Residential camps" },
    natur: { sv: "Natur och friluftsliv", de: "Natur", "en-GB": "Outdoors", "en-IE": "Outdoors" },
  };
  return navn[kategori]?.[spraakFor(land)] || kategori;
}

function ferieTabell(land, region) {
  if (land === "GB") return region === "scotland" ? FERIE["GB-SCT"] : FERIE["GB-EN"];
  return FERIE[land] || null;
}

export function ferieSlug(land, region, sesongNavn) {
  return ferieTabell(land, region)?.[sesongNavn] || null;
}

export function ferieNavn(land, region, sesongNavn) {
  const slug = ferieSlug(land, region, sesongNavn);
  if (!slug) return sesongNavn;
  return slug
    .split("-")
    .map((del) => del.charAt(0).toUpperCase() + del.slice(1))
    .join(" ");
}

export function kalenderSlug(land) {
  if (land === "SE") return "skollov";
  if (land === "DE" || land === "AT") return "schulferien";
  return "school-holidays";
}

export function ukeSlug(land, nr) {
  if (land === "SE") return `vecka-${nr}`;
  if (land === "DE" || land === "AT") return `kw-${nr}`;
  return null;
}

export function reserverteSlugs(land, region) {
  const spraak = spraakFor(land);
  const ut = new Set();
  for (const rad of Object.values(KATEGORI)) {
    if (rad[spraak]) ut.add(rad[spraak]);
  }
  const ferier = ferieTabell(land, region) || {};
  for (const slug of Object.values(ferier)) ut.add(slug);
  ut.add(kalenderSlug(land));
  if (land === "SE" || land === "DE" || land === "AT") {
    ut.add(land === "SE" ? "vecka-1" : "kw-1");
  }
  return ut;
}

export function kutt(tekst, maks) {
  const ren = String(tekst).replace(/\s+/g, " ").trim();
  if (ren.length <= maks) return ren;
  return `${ren.slice(0, Math.max(0, maks - 1)).trimEnd()}…`;
}
