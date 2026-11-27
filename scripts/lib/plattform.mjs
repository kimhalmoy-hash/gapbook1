/** Plattformregler. Hoopit er hardkodet blokkert og kan ikke slås på i config. */

export function erHoopit(url) {
  const tekst = String(url || "");
  try {
    const host = new URL(tekst).hostname.toLowerCase();
    return host === "hoopit.io" || host.endsWith(".hoopit.io");
  } catch {
    return /hoopit\.io/i.test(tekst);
  }
}

export function assertKilderTrygge(config) {
  const feil = [];
  for (const p of config.plattformer || []) {
    const verter = p.verter || [];
    const erHoopitPlattform = verter.some((v) => {
      const host = String(v).toLowerCase();
      return host === "hoopit.io" || host.endsWith(".hoopit.io");
    }) || String(p.id).toLowerCase() === "hoopit";
    if (erHoopitPlattform && p.tillatt) {
      feil.push("Hoopit kan ikke settes tillatt. Plattformen er blokkert.");
    }
  }
  for (const kilde of config.kilder || []) {
    if (erHoopit(kilde.url)) {
      feil.push(`Hoopit-kilde er blokkert og kan ikke konfigureres: ${kilde.url}`);
    }
  }
  if (feil.length) {
    const err = new Error(feil.join("\n"));
    err.feil = feil;
    throw err;
  }
}

export function plattformForHost(config, hostname) {
  const host = String(hostname || "").toLowerCase();
  for (const p of config.plattformer || []) {
    if ((p.verter || []).some((v) => host === v || host.endsWith(`.${v}`))) return p;
  }
  return null;
}

/**
 * handling:
 *  blokker      – Hoopit, hentes aldri
 *  ikke-tillatt – kjent plattform med tillatt:false
 *  utenfor      – tillatt plattform, men URL-en er utenfor det vi kan lese
 *  spond | kfuk | rubic | arrangor
 */
export function vurderUrl(config, url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { handling: "ugyldig", grunn: "ugyldig-url" };
  }
  if (erHoopit(url)) return { handling: "blokker", grunn: "hoopit" };
  const plattform = plattformForHost(config, parsed.hostname);
  if (plattform && plattform.tillatt !== true) {
    return { handling: "ikke-tillatt", grunn: plattform.id, plattform };
  }
  if (plattform?.id === "spond-discover") {
    const path = parsed.pathname;
    const ok = /\/discover\/.+\/events\//.test(path) || /sitemap/i.test(path);
    if (!ok) return { handling: "utenfor", grunn: "spond-bare-sitemap-og-event", plattform };
    return { handling: "spond", plattform };
  }
  if (plattform?.id === "kfuk-kfum") return { handling: "kfuk", plattform };
  if (plattform?.id === "rubic") {
    if (parsed.pathname.startsWith("/rest/") || parsed.pathname.startsWith("/api/")) {
      return { handling: "utenfor", grunn: "rubic-ikke-api", plattform };
    }
    return { handling: "rubic", plattform };
  }
  if (plattform) return { handling: "plattform", plattform };
  return { handling: "arrangor" };
}
