/**
 * Globale ruter for land utenfor den norske URL-en.
 * Tilbud i Norge genereres ikke her. Dagens stier er canonical.
 * /no/{region}/school-holidays/ kommer fra skolekalenderen, ikke herfra.
 * Bare kombinasjoner som har data blir sider. Tomme stubber gir ingen sider.
 */

export const TEMA_MIN_GLOBAL = 3;

export function validerGeografi(geo) {
  const feil = [];
  const land = new Set();
  for (const rad of geo.land || []) {
    if (!/^[A-Z]{2}$/.test(rad.iso2 || "")) feil.push(`ugyldig iso2 «${rad.iso2}»`);
    else if (land.has(rad.iso2)) feil.push(`iso2 ${rad.iso2} er ikke unik`);
    else land.add(rad.iso2);
    if (!rad.navn?.nb || !rad.navn?.en) feil.push(`${rad.iso2}: mangler navn`);
  }
  const regioner = new Set();
  for (const rad of geo.regioner || []) {
    if (!land.has(rad.iso2)) feil.push(`region ${rad.slug} har ukjent land ${rad.iso2}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rad.slug || "")) feil.push(`ugyldig regionslug «${rad.slug}»`);
    const nokkel = `${rad.iso2}:${rad.slug}`;
    if (regioner.has(nokkel)) feil.push(`region ${nokkel} er ikke unik`);
    else regioner.add(nokkel);
    if (!rad.navn?.nb) feil.push(`${nokkel}: mangler navn`);
  }
  const steder = new Set();
  for (const rad of geo.steder || []) {
    const nokkel = `${rad.iso2}:${rad.region}:${rad.slug}`;
    if (!regioner.has(`${rad.iso2}:${rad.region}`)) feil.push(`sted ${nokkel} mangler region`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rad.slug || "")) feil.push(`ugyldig stedslug «${rad.slug}»`);
    if (steder.has(nokkel)) feil.push(`sted ${nokkel} er ikke unikt`);
    else steder.add(nokkel);
    if (typeof rad.lat !== "number" || rad.lat < -90 || rad.lat > 90) feil.push(`${nokkel}: ugyldig lat`);
    if (typeof rad.lng !== "number" || rad.lng < -180 || rad.lng > 180) feil.push(`${nokkel}: ugyldig lng`);
  }
  return feil;
}

function teller(tilbud) {
  return tilbud.filter((rad) => rad.demo !== true && rad.synlig !== false && (rad.status === "verifisert" || rad.status === "delvis")).length;
}

/** Sider for land som ikke er Norge. NO hoppes over så norske URL-er ikke dupliseres. */
export function globaleSider(geo) {
  const sider = [];
  for (const region of geo.regioner || []) {
    if (region.iso2 === "NO") continue;
    const ferier = (geo.ferier || []).filter((rad) => rad.iso2 === region.iso2 && rad.region === region.slug && rad.eksempel !== true);
    if (!ferier.length) continue;
    const iso = region.iso2.toLowerCase();
    sider.push({
      kind: "school-holidays",
      id: `cal:${region.iso2}:${region.slug}`,
      iso2: iso,
      region: region.slug,
      path: `/${iso}/${region.slug}/school-holidays/`,
      offisiell: ferier.some((rad) => rad.offisiell === true && typeof rad.kildeUrl === "string" && rad.kildeUrl.startsWith("http")),
      locale: region.spraak || "en",
      antall: 0,
    });
  }
  const grupper = new Map();
  for (const rad of geo.tilbud || []) {
    if (rad.iso2 === "NO" || rad.eksempel === true) continue;
    const nokkel = `${rad.iso2}|${rad.region}|${rad.sted}|${rad.kategori}`;
    if (!grupper.has(nokkel)) grupper.set(nokkel, []);
    grupper.get(nokkel).push(rad);
  }
  for (const [nokkel, liste] of grupper) {
    const [iso2, region, sted, kategori] = nokkel.split("|");
    const iso = iso2.toLowerCase();
    sider.push({
      kind: "by-kategori",
      id: `kat:${nokkel}`,
      iso2: iso,
      region,
      sted,
      kategori,
      path: `/${iso}/${region}/${sted}/${kategori}/`,
      offisiell: false,
      locale: liste[0].spraak || "en",
      antall: teller(liste),
    });
  }
  const sett = new Set();
  return sider.filter((side) => (sett.has(side.path) ? false : sett.add(side.path)));
}

export function globalSideIndeks(side) {
  if (side.kind === "school-holidays") return side.offisiell === true;
  return side.antall >= TEMA_MIN_GLOBAL;
}

/**
 * hreflang bare mellom varianter som finnes. x-default peker på nb hvis den finnes, ellers den eneste varianten.
 * Sider med ulikt innhold (ulik id) lenkes ikke.
 */
export function hreflangMellom(sider) {
  const grupper = new Map();
  for (const side of sider) {
    const id = side.id || side.path;
    if (!grupper.has(id)) grupper.set(id, []);
    grupper.get(id).push(side);
  }
  const ut = [];
  for (const liste of grupper.values()) {
    const primary = liste.some((side) => side.locale === "nb") ? "nb" : liste[0].locale;
    const xDefault = liste.find((side) => side.locale === primary).path;
    for (const side of liste) {
      ut.push({
        path: side.path,
        locale: side.locale,
        xDefault,
        alternates: liste.map((annen) => ({ locale: annen.locale, path: annen.path })),
      });
    }
  }
  return ut;
}

/**
 * Tilbud under /no/ dupliserer dagens norske sider og skal ikke genereres.
 * /no/{region}/school-holidays/ er en ny regionkalender og returnerer null.
 */
export function kanoniskNorsk(path) {
  const sti = String(path);
  if (!sti.startsWith("/no/")) return null;
  if (/^\/no\/[a-z0-9]+(?:-[a-z0-9]+)*\/school-holidays\/$/.test(sti)) return null;
  return { generer: false, grunn: "Norge bruker eksisterende URL uten landprefiks. Canonical forblir den norske stien." };
}
