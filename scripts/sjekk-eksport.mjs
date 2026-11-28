/**
 * Sjekker den eksporterte HTML-en (mappen out/ etter `next build`). Kjøres automatisk som siste steg i `npm run build`.
 *
 *   node scripts/sjekk-eksport.mjs [--mappe out] [--streng] [--baseline tests/fixtures/sitemap-main-558c160.txt]
 *
 * Alltid: ads.txt, Consent Mode (alt denied, før alle tredjepartsskript i <head>), footerlenken «Samtykkeinnstillinger», personvernsidene.
 * Bryter AV: ingen AdSense-/Funding Choices-kode i noen fil, og ingen annonseplasser.
 * Bryter PÅ: plasser bare der plasseringskart.md tillater, merket, maks tre, ingen annonseforespørsel i HTML-en.
 * --baseline: alle URL-ene i fila må fortsatt stå i sitemap.xml (ingen indekserbare URL-er forsvinner).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { adsenseAktiv, MAKS_PLASSER } from "../lib/annonser.mjs";
import { CONSENT_DEFAULT_SCRIPT } from "../lib/samtykke.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const arg = (navn) => {
  const i = args.indexOf(navn);
  return i >= 0 ? args[i + 1] : null;
};
const mappe = path.resolve(ROT, arg("--mappe") || "out");
const baseline = arg("--baseline");
const feil = [];
const krev = (ok, melding) => {
  if (!ok) feil.push(melding);
};

function filer(dir) {
  const ut = [];
  for (const navn of readdirSync(dir)) {
    const full = path.join(dir, navn);
    if (statSync(full).isDirectory()) ut.push(...filer(full));
    else ut.push(full);
  }
  return ut;
}

const alle = filer(mappe);
// Bryterstilling avleses fra eksporten (Funding Choices-tagen ligger bare i <head> med bryteren PÅ).
// Med --streng (brukes av `npm run build`) må den stemme med konfigurasjonen.
const pa = alle.some((f) => f.endsWith("index.html") && readFileSync(f, "utf8").includes("fundingchoicesmessages.google.com"));
if (args.includes("--streng")) krev(pa === adsenseAktiv(), `eksporten er bygget med bryteren ${pa ? "PÅ" : "AV"}, konfigurasjonen sier ${adsenseAktiv() ? "PÅ" : "AV"}`);
const rel = (f) => "/" + path.relative(mappe, f).replaceAll(path.sep, "/");
const html = alle.filter((f) => f.endsWith(".html"));
krev(html.length > 100, `uventet få HTML-filer: ${html.length}`);

// ads.txt
const adsTxt = readFileSync(path.join(mappe, "ads.txt"), "utf8");
krev(adsTxt.trim() === "google.com, pub-5902367729233688, DIRECT, f08c47fec0942fa0", "ads.txt har feil innhold");

// Personvernsidene
const PERSONVERN = { nb: "/personvern/index.html", sv: "/sv/integritet/index.html", en: "/en/privacy/index.html" };
const SAMTYKKE_TEKST = { nb: "Samtykkeinnstillinger", sv: "Samtyckesinställningar", en: "Consent settings" };
for (const [lang, sti] of Object.entries(PERSONVERN)) {
  const f = path.join(mappe, sti);
  let tekst = "";
  try {
    tekst = readFileSync(f, "utf8");
  } catch {
    feil.push(`personvernside mangler: ${sti}`);
    continue;
  }
  krev(tekst.includes('<div lang="' + lang), `${sti}: feil språk`);
  krev(tekst.includes(">" + SAMTYKKE_TEKST[lang] + "</a>"), `${sti}: lenken ${SAMTYKKE_TEKST[lang]} mangler`);
  krev(/<h2[^>]*>/.test(tekst), `${sti}: ser ikke ut som den nye teksten (ingen overskrifter)`);
}

// Tomme-liste-tekstene, til sjekken av plasser
const i18n = readFileSync(path.join(ROT, "lib", "i18n.ts"), "utf8");
const tomTekster = [...i18n.matchAll(/^\s+empty: "([^"]+)",$/gm)].map((m) => m[1]);
krev(tomTekster.length === 3, `fant ${tomTekster.length} empty-tekster i i18n.ts, forventet 3`);

const ANNONSE_KODE = /adsbygoogle|pagead2|googlesyndication|fundingchoices|googlefcPresent/i;
const ETIKETT = { nb: "Annonse", sv: "Annons", en: "Advertisement" };
let medPlasser = 0;
let antallPlasser = 0;

for (const f of html) {
  const sti = rel(f);
  const kilde = readFileSync(f, "utf8");
  const er404 = sti === "/404.html" || sti.startsWith("/_not-found/");
  const noindex = /<meta name="robots" content="noindex/.test(kilde);

  // Consent Mode: standard denied, før første skript med src
  const headSlutt = kilde.indexOf("</head>");
  const head = headSlutt > 0 ? kilde.slice(0, headSlutt) : kilde;
  const standardPos = head.indexOf(CONSENT_DEFAULT_SCRIPT);
  krev(standardPos >= 0, `${sti}: Consent Mode-standard mangler i <head>`);
  // Next legger egne async-chunks (eget domene) øverst i <head>. Kravet er at ingen tredjepartsskript kommer før.
  const forsteEkstern = head.search(/<script[^>]*\ssrc="(?:https?:)?\/\//);
  krev(forsteEkstern < 0 || standardPos < forsteEkstern, `${sti}: Consent Mode-standard står ikke før første tredjepartsskript`);

  // Footerlenken
  if (kilde.includes("<footer")) {
    krev(kilde.includes('href="#samtykkeinnstillinger"'), `${sti}: footerlenken Samtykkeinnstillinger mangler`);
  }

  const plasser = [...kilde.matchAll(/data-annonse-plass="([^"]+)"/g)].map((m) => m[1]);
  antallPlasser += plasser.length;
  if (plasser.length) medPlasser++;

  if (!pa) {
    krev(!ANNONSE_KODE.test(kilde), `${sti}: AdSense-kode i HTML med bryteren AV`);
    krev(plasser.length === 0, `${sti}: annonseplass med bryteren AV`);
    continue;
  }

  // PÅ
  krev(!/<ins[^>]*adsbygoogle/.test(kilde), `${sti}: annonse-element i HTML-en (skal først komme etter samtykke)`);
  krev(!/<script[^>]*adsbygoogle\.js/.test(kilde), `${sti}: adsbygoogle.js i HTML-en (skal først lastes etter samtykke)`);
  krev(!/data-ad-format="auto"|enable_page_level_ads|google_ad_client/.test(kilde), `${sti}: Auto ads`);
  if (!plasser.length) continue;
  krev(plasser.length <= MAKS_PLASSER, `${sti}: ${plasser.length} plasser, maks ${MAKS_PLASSER}`);
  krev(!er404, `${sti}: annonseplass på 404`);
  krev(!noindex, `${sti}: annonseplass på noindex-side`);
  krev(!/^\/(sv\/|en\/)?arrangor\//.test(sti), `${sti}: annonseplass på /arrangor/`);
  krev(!Object.values(PERSONVERN).includes(sti), `${sti}: annonseplass på personvernside`);
  const synlig = kilde.replace(/<script[\s\S]*?<\/script>/g, "");
  krev(!tomTekster.some((t) => synlig.includes(t)), `${sti}: annonseplass på side med tom liste`);
  const lang = kilde.match(/<div lang="([a-z]{2})/)?.[1] || "nb";
  const merker = [...kilde.matchAll(/<p class="annonse-merke">([^<]+)<\/p>/g)].map((m) => m[1]);
  krev(merker.length === plasser.length && merker.every((m) => m === ETIKETT[lang]), `${sti}: annonseplassene er ikke merket «${ETIKETT[lang]}»`);
  const h1 = kilde.indexOf("<h1");
  const forste = kilde.indexOf("data-annonse-plass");
  krev(h1 >= 0 && forste > h1, `${sti}: annonseplass før H1`);
  krev(kilde.includes("<header") ? forste > kilde.indexOf("</header>") : true, `${sti}: annonseplass i headeren`);
  krev(!/<a[^>]*>[^<]*<\/a><aside[^>]*data-annonse-plass/.test(kilde), `${sti}: annonse rett etter en lenke`);
}

if (!pa) {
  // Også i JS-bunten og alt annet: ingen AdSense-kode med bryteren AV.
  for (const f of alle.filter((x) => !x.endsWith(".html") && /\.(js|css|txt|xml|json|map)$/.test(x))) {
    if (rel(f) === "/ads.txt") continue;
    krev(!ANNONSE_KODE.test(readFileSync(f, "utf8")), `${rel(f)}: AdSense-kode med bryteren AV`);
  }
}

// Sitemap mot baseline
let sitemapInfo = "";
if (baseline) {
  const lesUrler = (xml) => new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const na = lesUrler(readFileSync(path.join(mappe, "sitemap.xml"), "utf8"));
  const gammel = new Set(readFileSync(path.resolve(ROT, baseline), "utf8").split("\n").filter(Boolean));
  const borte = [...gammel].filter((u) => !na.has(u));
  const nye = [...na].filter((u) => !gammel.has(u));
  sitemapInfo = `sitemap: baseline ${gammel.size}, nå ${na.size}, borte ${borte.length}, nye ${nye.length}`;
  krev(borte.length === 0, `${borte.length} indekserbare URL-er mangler i sitemap: ${borte.slice(0, 5).join(", ")}`);
}

console.log(
  `sjekk-eksport: ${html.length} HTML-filer, bryter ${pa ? "PÅ" : "AV"}, ${antallPlasser} annonseplasser på ${medPlasser} sider${sitemapInfo ? ", " + sitemapInfo : ""}`,
);
if (feil.length) {
  console.error(`sjekk-eksport: ${feil.length} feil`);
  for (const f of feil.slice(0, 40)) console.error(" - " + f);
  process.exit(1);
}
console.log("sjekk-eksport: OK");
