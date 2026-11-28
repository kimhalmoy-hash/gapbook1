/**
 * Ruter for SE, DE, AT, GB og IE. Bare kombinasjoner med tilbud.
 * Ingen feriedatoer finnes på, så kalendersider lages ikke.
 * Search Console er ikke verifisert: ingen av disse sidene indekseres.
 */
import { sesongDeler, gruppeNokkel, isoUke } from "./pure.mjs";
import {
  regionSlug,
  stedSlug,
  kategoriSlug,
  kategoriNavn,
  ferieSlug,
  ferieNavn,
  ukeSlug,
  maalFor,
  reserverteSlugs,
  kalenderSlug,
} from "./slug-tabell.mjs";
import { tellGrupper, overTerskel, SEARCH_CONSOLE_VERIFISERT } from "./terskel.mjs";
import { tekstFor } from "./sidetekst.mjs";

const LANDNAVN = {
  SE: "Sverige",
  DE: "Deutschland",
  AT: "Österreich",
  GB: "United Kingdom",
  IE: "Ireland",
};

function nokkel(leir) {
  return gruppeNokkel(leir);
}

function grupper(liste) {
  const mappe = new Map();
  for (const leir of liste) {
    const id = nokkel(leir);
    if (!mappe.has(id)) mappe.set(id, []);
    mappe.get(id).push(leir);
  }
  return [...mappe.values()];
}

function basis(leir) {
  const region = regionSlug(leir.region);
  const sted = stedSlug(leir);
  if (!region || !sted) return null;
  return { region, sted, maal: maalFor(leir.land), land: leir.land };
}

function indeksFor(side) {
  if (!SEARCH_CONSOLE_VERIFISERT && side.slag !== "kalender" && side.slag !== "hub") return false;
  return overTerskel(side);
}

export function tilbudSider(leirer) {
  const gyldige = leirer.filter((leir) => basis(leir));
  const sider = new Map();
  const legg = (side) => {
    if (!sider.has(side.path)) sider.set(side.path, { ...side, leirer: [] });
    sider.get(side.path).leirer.push(...(side.leirer || []));
  };
  const perLand = new Map();
  for (const leir of gyldige) {
    if (!perLand.has(leir.land)) perLand.set(leir.land, []);
    perLand.get(leir.land).push(leir);
  }
  for (const [land, liste] of perLand) {
    const iso = land.toLowerCase();
    const maal = maalFor(land);
    const antall = tellGrupper(liste);
    legg({
      kind: "land",
      slag: "hub",
      niva: "land",
      id: `hub:${land}`,
      path: `/${iso}/`,
      land,
      maal,
      region: null,
      sted: null,
      antall,
      kalendere: 0,
      offisiell: false,
      leirer: liste,
    });
    const perRegion = new Map();
    for (const leir of liste) {
      const region = regionSlug(leir.region);
      if (!perRegion.has(region)) perRegion.set(region, []);
      perRegion.get(region).push(leir);
    }
    for (const [region, rader] of perRegion) {
      const byer = new Set(rader.map((leir) => stedSlug(leir)));
      legg({
        kind: "region",
        slag: "hub",
        niva: "region",
        id: `hub:${land}:${region}`,
        path: `/${iso}/${region}/`,
        land,
        maal,
        region,
        regionNavn: rader[0].regionNavn,
        sted: null,
        antall: tellGrupper(rader),
        byer: byer.size,
        kalenderIndeks: false,
        offisiell: false,
        leirer: rader,
      });
      const perSted = new Map();
      for (const leir of rader) {
        const sted = stedSlug(leir);
        if (!perSted.has(sted)) perSted.set(sted, []);
        perSted.get(sted).push(leir);
      }
      if (land === "IE" && region === "dublin" && !perSted.has("dublin-city")) {
        perSted.set("dublin-city", []);
      }
      for (const [sted, stedsrader] of perSted) {
        const navn = stedsrader[0]?.by || (sted === "dublin-city" ? "Dublin" : sted);
        legg({
          kind: "by",
          slag: "by",
          id: `by:${land}:${region}:${sted}`,
          path: `/${iso}/${region}/${sted}/`,
          land,
          maal,
          region,
          regionNavn: rader[0].regionNavn,
          sted,
          stedNavn: navn,
          antall: tellGrupper(stedsrader),
          kalenderIndeks: false,
          offisiell: false,
          leirer: stedsrader,
        });
        const perKat = new Map();
        const perFerie = new Map();
        const perUke = new Map();
        for (const leir of stedsrader) {
          const kat = kategoriSlug(land, leir.kategori);
          if (kat) {
            if (!perKat.has(kat)) perKat.set(kat, []);
            perKat.get(kat).push(leir);
          }
          const del = sesongDeler(leir.sesong);
          const ferie = del ? ferieSlug(land, region, del.navn) : null;
          if (ferie) {
            if (!perFerie.has(ferie)) perFerie.set(ferie, []);
            perFerie.get(ferie).push(leir);
          }
          const ukeSti = del && ukeSlug(land, leir.uke);
          if (ukeSti && Number.isInteger(leir.uke)) {
            if (!perUke.has(leir.uke)) perUke.set(leir.uke, []);
            perUke.get(leir.uke).push(leir);
          }
        }
        for (const [kat, katRader] of perKat) {
          legg({
            kind: "by-kategori",
            slag: "kategori",
            id: `kat:${land}:${region}:${sted}:${kat}`,
            path: `/${iso}/${region}/${sted}/${kat}/`,
            land,
            maal,
            region,
            regionNavn: rader[0].regionNavn,
            sted,
            stedNavn: navn,
            kategori: kat,
            kategoriNavn: kategoriNavn(land, katRader[0].kategori),
            antall: tellGrupper(katRader),
            offisiell: false,
            leirer: katRader,
          });
        }
        for (const [ferie, ferieRader] of perFerie) {
          const del = sesongDeler(ferieRader[0].sesong);
          legg({
            kind: "by-ferie",
            slag: "ferie",
            id: `ferie:${land}:${region}:${sted}:${ferie}`,
            path: `/${iso}/${region}/${sted}/${ferie}/`,
            land,
            maal,
            region,
            regionNavn: rader[0].regionNavn,
            sted,
            stedNavn: navn,
            ferie,
            ferieNavn: ferieNavn(land, region, del?.navn),
            aar: del?.aar ?? null,
            antall: tellGrupper(ferieRader),
            offisiell: false,
            leirer: ferieRader,
          });
        }
        for (const [uke, ukeRader] of perUke) {
          const sti = ukeSlug(land, uke);
          legg({
            kind: "by-uke",
            slag: "uke",
            id: `uke:${land}:${region}:${sted}:${uke}`,
            path: `/${iso}/${region}/${sted}/${sti}/`,
            land,
            maal,
            region,
            sted,
            stedNavn: navn,
            uke,
            antall: tellGrupper(ukeRader),
            offisiell: false,
            leirer: ukeRader,
          });
        }
      }
    }
  }
  return [...sider.values()].map((side) => {
    const unike = [];
    const sett = new Set();
    for (const leir of side.leirer) {
      const id = nokkel(leir);
      if (sett.has(id)) continue;
      sett.add(id);
      unike.push(leir);
    }
    const utenListe = { ...side, leirer: unike };
    utenListe.indeks = indeksFor(utenListe);
    return utenListe;
  });
}

export function slugKollisjoner(sider) {
  const feil = [];
  const byer = new Map();
  for (const side of sider) {
    if (side.slag !== "by" || !side.region) continue;
    if (!byer.has(`${side.land}:${side.region}`)) byer.set(`${side.land}:${side.region}`, new Set());
    byer.get(`${side.land}:${side.region}`).add(side.sted);
  }
  for (const [nokkel, slugs] of byer) {
    const [land, region] = nokkel.split(":");
    const reservert = reserverteSlugs(land, region);
    reservert.add(kalenderSlug(land));
    for (const sted of slugs) {
      if (reservert.has(sted)) feil.push(`${land}/${region}: byslug «${sted}» kolliderer med en reservert slug`);
    }
  }
  return feil;
}

function kort(leir) {
  const pris = leir.gratis ? "gratis" : leir.prisBelop != null ? `${leir.prisBelop} ${leir.valuta}` : null;
  return {
    tittel: leir.tittel,
    tilbyder: leir.tilbyder,
    href: leir.url,
    meta: [leir.by, pris].filter(Boolean).join(" · "),
  };
}

/** Innholdslenker. noindex-mål begrenses til 3 kontekstlenker. */
export function innholdslenker(side, alle) {
  const barn = alle.filter((annen) => annen.path !== side.path && annen.path.startsWith(side.path) && annen.indeks);
  const kontekst = alle
    .filter((annen) => annen.path !== side.path && !annen.indeks && (annen.path.startsWith(side.path) || side.path.startsWith(annen.path)))
    .slice(0, 3);
  const tak = side.land === "GB" && side.niva === "region" ? 160 : side.slag === "hub" && side.niva === "land" ? 60 : 40;
  const navigasjon = barn.slice(0, tak);
  return [...navigasjon, ...kontekst].map((annen) => ({
    href: annen.path,
    label: annen.stedNavn || annen.regionNavn || LANDNAVN[annen.land] || annen.path,
  }));
}

export function sideInnhold(side, alle) {
  const tekst = tekstFor(side.maal, side.slag, {
    niva: side.niva,
    land: LANDNAVN[side.land],
    region: side.regionNavn || side.region,
    by: side.stedNavn || side.sted,
    kategori: side.kategoriNavn || side.kategori,
    ferie: side.ferieNavn || side.ferie,
    aar: side.aar ? String(side.aar) : "",
    nr: side.uke ? String(side.uke) : "",
    antall: side.antall,
  });
  const crumbs = [{ name: LANDNAVN[side.land] || side.land, href: `/${side.land.toLowerCase()}/` }];
  if (side.region && !(side.sted && side.sted === side.region)) {
    crumbs.push({ name: side.regionNavn || side.region, href: `/${side.land.toLowerCase()}/${side.region}/` });
  }
  if (side.sted) {
    crumbs.push({ name: side.stedNavn || side.sted, href: `/${side.land.toLowerCase()}/${side.region}/${side.sted}/` });
  }
  if (side.kategori || side.ferie || side.uke) crumbs.push({ name: tekst.h1, href: side.path });
  const grupperte = grupper(side.leirer || []);
  return {
    ...tekst,
    lang: side.maal,
    crumbs,
    tilbud: grupperte.map((liste) => kort(liste[0])),
    lenker: innholdslenker(side, alle).filter((lenke) => lenke.href !== side.path),
  };
}

export function ukeFraDato(leir) {
  if (!leir.datoFra) return null;
  return isoUke(leir.datoFra).uke;
}
