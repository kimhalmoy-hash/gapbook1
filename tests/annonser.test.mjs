import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import {
  ADSENSE_AKTIV,
  ENHET_IDER,
  MAKS_PLASSER,
  PLASS_FORMAT,
  RESERVERT_HOYDE,
  RUTE_KINDER,
  UTELATT_KINDER,
  UTGIVER_ID,
  adsenseAktiv,
  annonsePlasser,
} from "../lib/annonser.mjs";
import { CONSENT_DEFAULT_SCRIPT, SAMTYKKE_PARAMETRE } from "../lib/samtykke.mjs";
import {
  PERSONVERN_LOKALER,
  SAMTYKKE_ANKER,
  blokkTekst,
  lesPersonvernMd,
  parseInline,
  parsePersonvern,
  personvernBeskrivelse,
} from "../lib/personvern.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const les = (...deler) => readFileSync(path.join(ROT, ...deler), "utf8");

// ---------- Bryteren ----------

test("AdSense-bryteren er AV som standard", () => {
  assert.equal(ADSENSE_AKTIV, false);
  assert.equal(adsenseAktiv({}), false);
  assert.equal(adsenseAktiv({ WEEKSLOT_ADSENSE: "" }), false);
  assert.equal(adsenseAktiv({ WEEKSLOT_ADSENSE: "annet" }), false);
});

test("bryteren kan slås på lokalt med WEEKSLOT_ADSENSE=on, og av igjen med off", () => {
  assert.equal(adsenseAktiv({ WEEKSLOT_ADSENSE: "on" }), true);
  assert.equal(adsenseAktiv({ WEEKSLOT_ADSENSE: "ON" }), true);
  assert.equal(adsenseAktiv({ WEEKSLOT_ADSENSE: "off" }), false);
});

test("next.config.ts gjør bryteren til en byggekonstant, og AnnonsePlass tegner ingenting når den er AV", () => {
  assert.match(les("next.config.ts"), /NEXT_PUBLIC_WEEKSLOT_ADSENSE: adsenseAktiv\(\) \? "on" : "off"/);
  const plass = les("components", "AnnonsePlass.tsx");
  assert.match(plass, /if \(!adsenseAktiv\(\) \|\| !plasser\.includes\(navn\)\) return null;/);
});

test("annonsekode og tredjepartsadresser finnes bare i layout (bak bryteren) og Samtykke.tsx (bak byggekonstanten)", () => {
  const kilder = ["app/layout.tsx", "components/Samtykke.tsx", "components/AnnonsePlass.tsx", "components/PageView.tsx", "components/Chrome.tsx"];
  for (const f of kilder) {
    const t = les(...f.split("/"));
    const harPagead = /pagead2|googlesyndication/.test(t);
    const harFc = /fundingchoicesmessages/.test(t);
    if (f === "components/Samtykke.tsx") {
      assert.ok(harPagead);
      assert.match(t, /if \(!ANNONSER_PA\) return;/);
      assert.match(t, /ANNONSER_PA = process\.env\.NEXT_PUBLIC_WEEKSLOT_ADSENSE === "on"/);
    } else if (f === "app/layout.tsx") {
      assert.ok(harFc);
      assert.match(t, /annonser \? \(/);
    } else {
      assert.ok(!harPagead && !harFc, `${f} skal ikke nevne annonseadresser`);
    }
  }
});

test("annonseforespørsel kommer først etter CONSENT_MODE_DATA_READY og ad_storage gitt", () => {
  const t = les("components", "Samtykke.tsx");
  const lastPos = t.indexOf("pagead2.googlesyndication.com");
  const venterPos = t.indexOf("CONSENT_MODE_DATA_READY");
  assert.ok(venterPos > 0 && lastPos > 0);
  // start() er definert før, men kalles bare fra callbacken, og bare når ad_storage er gitt.
  assert.match(t, /if \(!gitt\(verdier\.adStoragePurposeConsentStatus\)\) return;\s+start\(/);
  assert.equal((t.match(/start\(/g) || []).length, 2); // definisjon + ett kall
  assert.doesNotMatch(t, /enable_page_level_ads|data-ad-format="auto"|google_ad_client/);
});

// ---------- Consent Mode ----------

test("Consent Mode: alle fire parametere er denied som standard", () => {
  assert.deepEqual([...SAMTYKKE_PARAMETRE], ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]);
  const kall = [];
  const w = {};
  const sandbox = { window: w, dataLayer: undefined };
  vm.createContext(sandbox);
  sandbox.window = sandbox; // window.dataLayer og global dataLayer er samme objekt
  vm.runInContext(CONSENT_DEFAULT_SCRIPT, sandbox);
  for (const args of sandbox.dataLayer) kall.push(Array.from(args));
  assert.equal(kall.length, 1);
  const [kommando, type, verdier] = kall[0];
  assert.equal(kommando, "consent");
  assert.equal(type, "default");
  for (const p of SAMTYKKE_PARAMETRE) assert.equal(verdier[p], "denied", p);
  assert.ok(!Object.values(verdier).includes("granted"));
});

test("Consent Mode-standarden ligger i <head> i layout, før alt annet i <head>", () => {
  const layout = les("app", "layout.tsx");
  const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
  assert.ok(head.includes("CONSENT_DEFAULT_SCRIPT"));
  assert.ok(head.indexOf("CONSENT_DEFAULT_SCRIPT") < head.indexOf("fundingChoicesSkript"));
});

test("footeren har lenken Samtykkeinnstillinger på alle tre språk", () => {
  const i18n = les("lib", "i18n.ts");
  assert.match(i18n, /consentLink: "Samtykkeinnstillinger"/);
  assert.match(i18n, /consentLink: "Samtyckesinställningar"/);
  assert.match(i18n, /consentLink: "Consent settings"/);
  assert.match(les("components", "Chrome.tsx"), /href="#samtykkeinnstillinger"[^>]*>\{tekst\.consentLink\}/);
});

// ---------- Annonseplasser ----------

const side = (o = {}) => ({ kind: "sesong", indekserbar: true, antallKort: 5, tom: false, ukerader: 0, ...o });

test("rutetypene i annonser.mjs stemmer med typen Rute i katalog.ts", () => {
  const katalog = les("lib", "katalog.ts");
  const blokk = katalog.slice(katalog.indexOf("export type Rute ="), katalog.indexOf("const PERSONVERN_STI"));
  const kinder = [...blokk.matchAll(/kind: "([A-Za-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...kinder].sort(), [...RUTE_KINDER].sort());
});

test("ingen plasser på /arrangor/ og personvernsidene, uansett innhold", () => {
  assert.deepEqual([...UTELATT_KINDER].sort(), ["fremhevet", "personvern"]);
  for (const kind of UTELATT_KINDER) {
    assert.deepEqual(annonsePlasser(side({ kind, antallKort: 20 })), []);
    assert.deepEqual(annonsePlasser(side({ kind, ukerader: 5 })), []);
  }
});

test("ingen plasser på noindex-sider, tomme lister, 404 eller ukjente sider", () => {
  for (const kind of RUTE_KINDER) {
    assert.deepEqual(annonsePlasser(side({ kind, indekserbar: false, antallKort: 20, ukerader: 5 })), [], `noindex ${kind}`);
    assert.deepEqual(annonsePlasser(side({ kind, tom: true, antallKort: 0 })), [], `tom ${kind}`);
  }
  assert.deepEqual(annonsePlasser(side({ kind: "not-found" })), []);
  assert.deepEqual(annonsePlasser(side({ kind: "404" })), []);
});

test("plasser per sidetype følger plasseringskart.md", () => {
  assert.deepEqual(annonsePlasser(side({ kind: "hjem", antallKort: 600 })), ["H-1", "R-2"]);
  assert.deepEqual(annonsePlasser(side({ kind: "skoleruta", antallKort: 4 })), ["H-1", "R-2"]);
  assert.deepEqual(annonsePlasser(side({ kind: "ferieKommune", antallKort: 8 })), ["H-1", "R-2"]);
  assert.deepEqual(annonsePlasser(side({ kind: "ferieKommune", antallKort: 9 })), ["H-1", "R-2", "H-3"]);
  assert.deepEqual(annonsePlasser(side({ kind: "type", antallKort: 30 })), ["H-1", "R-2", "H-3"]);
  assert.deepEqual(annonsePlasser(side({ kind: "ferieUke", antallKort: 12 })), ["H-1", "R-2", "H-3"]);
  assert.deepEqual(annonsePlasser(side({ kind: "fylke", antallKort: 3 })), ["H-1", "R-2"]);
  assert.deepEqual(annonsePlasser(side({ kind: "skolerutaHub", antallKort: 50 })), ["H-1", "R-2"]);
});

test("leirdetalj: aldri før påmelding, og bare når ukeradene står imellom", () => {
  assert.deepEqual(annonsePlasser(side({ kind: "leir", antallKort: 1, ukerader: 1 })), []);
  assert.deepEqual(annonsePlasser(side({ kind: "leir", antallKort: 1, ukerader: 0 })), []);
  assert.deepEqual(annonsePlasser(side({ kind: "leir", antallKort: 1, ukerader: 2 })), ["R-1"]);
});

test("aldri mer enn tre plasser, og alle plasser har format og reservert høyde", () => {
  for (const kind of RUTE_KINDER) {
    assert.ok(annonsePlasser(side({ kind, antallKort: 100, ukerader: 9 })).length <= MAKS_PLASSER);
  }
  assert.equal(MAKS_PLASSER, 3);
  assert.deepEqual(RESERVERT_HOYDE, { H: 128, R: 278 });
  for (const navn of Object.keys(PLASS_FORMAT)) assert.ok(["H", "R"].includes(PLASS_FORMAT[navn]));
});

test("CSS reserverer fast høyde per format (CLS 0)", () => {
  const css = les("app", "globals.css");
  assert.match(css, /\.annonse-h \{\s*height: 128px;/);
  assert.match(css, /\.annonse-r \{\s*height: 278px;/);
  assert.match(css, /\.annonse \{[^}]*overflow: hidden;/);
});

test("plassene er merket Annonse / Annons / Advertisement", () => {
  const i18n = les("lib", "i18n.ts");
  assert.match(i18n, /adLabel: "Annonse"/);
  assert.match(i18n, /adLabel: "Annons"/);
  assert.match(i18n, /adLabel: "Advertisement"/);
});

test("enhet-ID-ene er tomme til AdSense-enhetene finnes, og utgiver-ID-en stemmer med ads.txt", () => {
  assert.deepEqual(ENHET_IDER, { H: "", R: "" });
  assert.equal(UTGIVER_ID, "pub-5902367729233688");
});

// ---------- ads.txt ----------

test("ads.txt har nøyaktig riktig linje", () => {
  const tekst = les("public", "ads.txt");
  assert.equal(tekst, "google.com, pub-5902367729233688, DIRECT, f08c47fec0942fa0\n");
});

// ---------- Personvern ----------

const FORVENTET_H1 = { nb: "Personvern", sv: "Integritet", en: "Privacy" };
const FORVENTET_STI = { nb: "personvern", sv: "integritet", en: "privacy" };

test("personvernsidene finnes på alle tre språk, på samme adresser som før", () => {
  assert.deepEqual([...PERSONVERN_LOKALER], ["nb", "sv", "en"]);
  const katalog = les("lib", "katalog.ts");
  for (const l of PERSONVERN_LOKALER) {
    assert.match(katalog, new RegExp(`${l}: "${FORVENTET_STI[l]}"`));
    const blokker = parsePersonvern(lesPersonvernMd(l));
    assert.equal(blokker[0].type, "h1");
    assert.equal(blokkTekst(blokker[0]), FORVENTET_H1[l]);
    assert.ok(blokker.filter((b) => b.type === "h2").length >= 8, `${l}: for få h2`);
    assert.ok(blokker.some((b) => b.type === "ul"));
  }
  const sitemap = readFileSync(path.join(ROT, "tests", "fixtures", "sitemap-main-558c160.txt"), "utf8");
  for (const u of ["https://weekslot.com/personvern/", "https://weekslot.com/sv/integritet/", "https://weekslot.com/en/privacy/"]) {
    assert.ok(sitemap.split("\n").includes(u), u);
  }
});

test("personverntekstene nevner behandlingsansvarlig og samtykkelenken, og gamle løfter er borte", () => {
  for (const l of PERSONVERN_LOKALER) {
    const md = lesPersonvernMd(l);
    assert.match(md, /HENDT AS/);
    assert.match(md, /935 113 601/);
    assert.match(md, /kontakt@weekslot\.com/);
    assert.doesNotMatch(md, /Til Kode|For Kode|Till Kode/);
    assert.match(md, /\]\(#samtykkeinnstillinger\)|\]\(#samtyckeinnstillinger\)/);
  }
  assert.doesNotMatch(lesPersonvernMd("nb"), /bruker ingen informasjonskapsler/);
});

test("lenker til samtykkevalget peker alltid til #samtykkeinnstillinger", () => {
  assert.deepEqual(parseInline("[x](#samtyckeinnstillinger)"), [{ type: "a", text: "x", href: SAMTYKKE_ANKER }]);
  assert.deepEqual(parseInline("[x](#samtykkeinnstillinger)"), [{ type: "a", text: "x", href: SAMTYKKE_ANKER }]);
  assert.deepEqual(parseInline("**fet** og [a](https://e.no)"), [
    { type: "strong", text: "fet" },
    { type: "text", text: " og " },
    { type: "a", text: "a", href: "https://e.no" },
  ]);
});

test("parseren beholder teksten ordrett (ingen tegn mistet)", () => {
  for (const l of PERSONVERN_LOKALER) {
    const md = lesPersonvernMd(l);
    const ren = (t) => t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^#{1,3} /gm, "").replace(/^- /gm, "").replace(/\s+/g, " ").trim();
    const fraParser = parsePersonvern(md).map(blokkTekst).join(" ").replace(/\s+/g, " ").trim();
    assert.equal(fraParser, ren(md), l);
  }
});

test("meta description for personvernsidene er første avsnitt", () => {
  assert.match(personvernBeskrivelse("nb"), /^WeekSlot \(weekslot\.com\) er en gratis oversikt/);
  assert.match(personvernBeskrivelse("sv"), /^WeekSlot \(weekslot\.com\) är en kostnadsfri/);
  assert.match(personvernBeskrivelse("en"), /^WeekSlot \(weekslot\.com\) is a free overview/);
});

// ---------- Sitemap og eksport ----------

test("baseline-sitemapen fra main (558c160) har 656 URL-er", () => {
  const urler = les("tests", "fixtures", "sitemap-main-558c160.txt").split("\n").filter(Boolean);
  assert.equal(urler.length, 656);
  assert.equal(new Set(urler).size, 656);
});

const ute = path.join(ROT, "out");
test(
  "eksporten (out/) består sjekk-eksport: ingen AdSense-kode med bryteren AV, consent, ads.txt og ingen tapte URL-er",
  { skip: existsSync(path.join(ute, "index.html")) ? false : "out/ finnes ikke. Kjør `npm run build` først (build kjører samme sjekk)." },
  () => {
    const r = spawnSync(process.execPath, ["scripts/sjekk-eksport.mjs", "--baseline", "tests/fixtures/sitemap-main-558c160.txt"], {
      cwd: ROT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /bryter (AV|PÅ)/);
  },
);
