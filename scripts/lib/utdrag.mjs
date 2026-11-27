/**
 * Trekker ut bare fakta. Beskrivelse, bilder og kontaktpersoner tas ikke med.
 */
import { rensPerson } from "../../lib/pure.mjs";

function isoDato(verdi) {
  if (typeof verdi !== "string") return null;
  const m = verdi.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function tallPris(verdi) {
  if (typeof verdi === "number" && Number.isFinite(verdi)) return Math.round(verdi);
  if (typeof verdi === "string" && /^\d+(\.\d+)?$/.test(verdi.trim())) return Math.round(Number(verdi));
  return null;
}

function stedFra(location) {
  if (!location || typeof location !== "object") return null;
  const addr = location.address;
  if (typeof addr === "string") return rensPerson(addr);
  if (addr && typeof addr === "object") {
    const deler = [addr.streetAddress, addr.postalCode, addr.addressLocality]
      .filter((d) => typeof d === "string" && d.trim())
      .map((d) => d.trim());
    if (deler.length) return rensPerson(deler.join(", "));
  }
  if (typeof location.name === "string") return rensPerson(location.name);
  return null;
}

function noder(data) {
  if (Array.isArray(data)) return data.flatMap(noder);
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data["@graph"])) return data["@graph"].flatMap(noder);
  return [data];
}

const PAMELDING_AV = {
  instock: "apen",
  limitedavailability: "apen",
  soldout: "full",
  outofstock: "full",
  discontinued: "stengt",
};

function normaliserAvailability(verdi) {
  if (typeof verdi !== "string" || !verdi.trim()) return null;
  const token = verdi.trim().split("/").pop().toLowerCase();
  return PAMELDING_AV[token] || null;
}

/** Bare når JSON-LD offers.availability sier det rett ut. Ellers null. */
export function pameldingFraJsonLd(html) {
  const funnet = new Set();
  const blokker = String(html || "").matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const blokk of blokker) {
    let data;
    try {
      data = JSON.parse(blokk[1]);
    } catch {
      continue;
    }
    for (const node of noder(data)) {
      const offers = node.offers;
      const liste = Array.isArray(offers) ? offers : offers ? [offers] : [];
      for (const offer of liste) {
        const status = normaliserAvailability(offer?.availability);
        if (status) funnet.add(status);
      }
    }
  }
  if (funnet.size === 1) return [...funnet][0];
  return null;
}

/** Rubic: bare en kort, entydig status-tekst. Brødtekst telles ikke. */
export function pameldingFraRubic(html) {
  const funnet = new Set();
  const re = /<(span|strong|div|p|td|h2|h3)\b[^>]*>\s*(Fulltegnet|Utsolgt|Sold out|Ikke åpnet)\s*<\/\1>/gi;
  for (const m of String(html || "").matchAll(re)) {
    const ord = m[2].toLowerCase();
    if (ord === "fulltegnet" || ord === "utsolgt" || ord === "sold out") funnet.add("full");
    else if (ord === "ikke åpnet") funnet.add("ikke_apnet");
  }
  if (funnet.size === 1) return [...funnet][0];
  return null;
}

/** JSON-LD SportsEvent/Event → fakta. description og image forkastes. */
export function faktaFraJsonLd(html) {
  const ut = [];
  const blokker = String(html || "").matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const blokk of blokker) {
    let data;
    try {
      data = JSON.parse(blokk[1]);
    } catch {
      continue;
    }
    for (const node of noder(data)) {
      const type = node["@type"];
      const typer = (Array.isArray(type) ? type : [type]).map((t) => String(t || ""));
      if (!typer.some((t) => /Event$/i.test(t) || /SportsEvent/i.test(t))) continue;
      const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
      ut.push({
        tittel: rensPerson(typeof node.name === "string" ? node.name : null),
        datoFra: isoDato(node.startDate),
        datoTil: isoDato(node.endDate),
        prisNok: offers ? tallPris(offers.price) : null,
        sted: stedFra(node.location),
        url: typeof node.url === "string" ? node.url : null,
      });
    }
  }
  return ut;
}

export function h1(html) {
  const m = String(html || "").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  const tekst = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return rensPerson(tekst);
}

export function tittelFraHead(html) {
  const og = String(html || "").match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return rensPerson(og[1]);
  const title = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) return null;
  return rensPerson(title[1].replace(/\s+/g, " ").trim());
}

/** Én entydig ISO-datoperiode, ellers null. Gjetter ikke når siden har flere. */
export function entydigPeriode(html) {
  const treff = [...String(html || "").matchAll(/\d{4}-\d{2}-\d{2}/g)].map((m) => m[0]);
  const unike = [...new Set(treff)].sort();
  if (unike.length === 2) return { datoFra: unike[0], datoTil: unike[1] };
  if (unike.length === 1) return { datoFra: unike[0], datoTil: unike[0] };
  return { datoFra: null, datoTil: null };
}

const SAMLE_VERTER = [
  "spond.com",
  "hoopit.io",
  "letsreg.com",
  "rubic.no",
  "aktiviteter.dnt.no",
  "kfuk-kfum.no",
];

/** Mange ulike arrangørlenker = samleside. Da kopierer vi ikke lista. */
export function erSamleside(html, sideUrl) {
  let egen = "";
  try {
    egen = new URL(sideUrl).hostname;
  } catch {
    return false;
  }
  const verter = new Set();
  for (const m of String(html || "").matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const host = new URL(m[1]).hostname.replace(/^www\./, "");
      if (host === egen.replace(/^www\./, "")) continue;
      verter.add(host);
    } catch {
      /* hopp over */
    }
  }
  const samle = [...verter].filter((h) => SAMLE_VERTER.some((s) => h === s || h.endsWith(`.${s}`)));
  return verter.size >= 8 || samle.length >= 4;
}

export function lenkerSomMatcher(html, predikat) {
  const ut = [];
  for (const m of String(html || "").matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    if (predikat(m[1])) ut.push(m[1]);
  }
  return [...new Set(ut)];
}

export function sitemapLocs(xml) {
  return [...String(xml || "").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}
