import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import {
  ADSENSE_AKTIV,
  ENHET_IDER,
  ETIKETTER,
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
import { FLERE_TILBUD_MAKS, flereTilbud } from "../lib/pure.mjs";
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
    const harFc = /fundingchoices|googlefcPresent/.test(t);
    assert.ok(!harFc, `${f}: ingen egen Funding Choices-tag`);
    if (f === "app/layout.tsx") {
      assert.ok(harPagead, "layout laster AdSense-taggen");
      assert.match(t, /adsbygoogle\.js\?client=ca-\$\{UTGIVER_ID\}/);
      assert.match(t, /annonser \? \(/);
    } else if (f === "components/Samtykke.tsx") {
      assert.ok(!harPagead, "Samtykke.tsx laster ikke taggen selv");
      assert.match(t, /if \(!ANNONSER_PA\) return;/);
      assert.match(t, /ANNONSER_PA = process\.env\.NEXT_PUBLIC_WEEKSLOT_ADSENSE === "on"/);
    } else {
      assert.ok(!harPagead && !harFc, `${f} skal ikke nevne annonseadresser`);
    }
  }
});

test("annonseforespørsel kommer først etter CONSENT_MODE_DATA_READY og ad_storage gitt", () => {
  const t = les("components", "Samtykke.tsx");
  assert.ok(t.indexOf("CONSENT_MODE_DATA_READY") > 0);
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

test("hele samtykkeoppsettet i layout ligger bak bryteren, og Consent Mode-standarden står først i <head>", () => {
  const layout = les("app", "layout.tsx");
  const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
  assert.ok(head.includes("CONSENT_DEFAULT_SCRIPT"));
  assert.ok(head.indexOf("annonser ? (") >= 0 && head.indexOf("annonser ? (") < head.indexOf("CONSENT_DEFAULT_SCRIPT"));
  assert.ok(head.indexOf("CONSENT_DEFAULT_SCRIPT") < head.indexOf("adsenseTagSkript"));
  const body = layout.slice(layout.indexOf("<body"));
  assert.ok(body.indexOf("annonser ? (") >= 0 && body.indexOf("annonser ? (") < body.indexOf("<SamtykkeKlikk />"));
  assert.ok(body.indexOf("annonser ? (") < body.indexOf("<AnnonseStyring />"));
});

test("samtykke- og annonsetekster ligger ikke i Copy (som serialiseres inn i all HTML), og klientkoden er bak byggekonstanten", () => {
  const i18n = les("lib", "i18n.ts");
  assert.doesNotMatch(i18n, /consentLink|adLabel|Samtykkeinnstillinger|Annonse"/);
  const k = les("components", "Samtykke.tsx");
  assert.match(k, /useEffect\(\(\) => \{\s+if \(!ANNONSER_PA\) return;\s+const w = window as AdsWindow;\s+function klikk/);
  assert.match(k, /NEXT_PUBLIC_WEEKSLOT_UTGIVER/);
  assert.doesNotMatch(les("lib", "annonser.mjs").split("export const ETIKETTER")[0].replace(/\/\/.*$/gm, ""), /Annonse"/);
  assert.match(les("next.config.ts"), /NEXT_PUBLIC_WEEKSLOT_UTGIVER: adsenseAktiv\(\) \? UTGIVER_ID : ""/);
});

test("footeren har lenken Samtykkeinnstillinger på alle tre språk, men bare med bryteren PÅ", () => {
  assert.equal(ETIKETTER.nb.samtykke, "Samtykkeinnstillinger");
  assert.equal(ETIKETTER.sv.samtykke, "Samtyckesinställningar");
  assert.equal(ETIKETTER.en.samtykke, "Consent settings");
  assert.match(les("components", "Chrome.tsx"), /samtykkeTekst \? \(/);
  assert.match(les("components", "PageView.tsx"), /samtykkeTekst=\{adsenseAktiv\(\) \? ETIKETTER\[rute\.locale\]\.samtykke : undefined\}/);
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

test("leirdetalj: aldri før en innholdsseksjon, og to annonser aldri rett etter hverandre", () => {
  const leir = (o) => annonsePlasser(side({ kind: "leir", antallKort: 1, ...o }));
  assert.deepEqual(leir({ ukerader: 1 }), []);
  assert.deepEqual(leir({ ukerader: 0 }), []);
  assert.deepEqual(leir({ ukerader: 2 }), ["R-1"]); // ukelisten står imellom
  assert.deepEqual(leir({ innholdsseksjoner: 1 }), ["R-1"]); // «Flere tilbud» (kommune) står imellom
  assert.deepEqual(leir({ innholdsseksjoner: 2 }), ["R-1", "H-2"]); // kommune + fylke: R-1 mellom dem, H-2 etter den andre
  assert.deepEqual(leir({ innholdsseksjoner: 2, indekserbar: false }), []);
  assert.deepEqual(leir({ innholdsseksjoner: 2, tom: true }), []);
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
  assert.equal(ETIKETTER.nb.annonse, "Annonse");
  assert.equal(ETIKETTER.sv.annonse, "Annons");
  assert.equal(ETIKETTER.en.annonse, "Advertisement");
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
    // Med bryteren AV i konfigurasjonen (standard) kjøres sjekken streng: out/ må være bygget AV og være helt uten Google-/samtykkekode.
    const streng = adsenseAktiv() ? [] : ["--streng"];
    const r = spawnSync(process.execPath, ["scripts/sjekk-eksport.mjs", ...streng, "--baseline", "tests/fixtures/sitemap-main-558c160.txt"], {
      cwd: ROT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /bryter (AV|PÅ)/);
  },
);

// ---------- «Flere tilbud i kommunen» ----------

const I_DAG = "2026-11-28";
let teller = 0;
function grp(kommune, fylke, o = {}) {
  teller++;
  const id = o.id || `g${teller}`;
  return {
    slug: id,
    medlemmer: [
      {
        id,
        tittel: o.tittel || `Leir ${id}`,
        tilbyder: "Arrangør",
        kommune,
        fylke,
        by: null,
        status: "verifisert",
        demo: false,
        dod: false,
        lenkestatus: "ok",
        datoFra: o.datoFra || "2027-02-22",
        datoTil: o.datoTil || "2027-02-26",
        ...o.felt,
      },
    ],
  };
}
const valg = { kommuneSlug: "oslo", fylkeSlug: "oslo" };

test("flereTilbud: andre indekserbare tilbud i samme kommune, aldri siden selv", () => {
  const alle = [grp("Oslo", "Oslo", { id: "selv" }), grp("Oslo", "Oslo"), grp("Oslo", "Oslo"), grp("Oslo", "Oslo"), grp("Bergen", "Vestland")];
  const r = flereTilbud(alle, "selv", I_DAG, valg);
  assert.equal(r.kommune.length, 3);
  assert.ok(!r.kommune.some((g) => g.slug === "selv"));
  assert.deepEqual(r.fylke, []); // nok i kommunen, ingen reserve
});

test("flereTilbud: bare synlige, ikke-demo og indekserbare tilbud (verifisert eller delvis)", () => {
  const alle = [
    grp("Oslo", "Oslo", { id: "selv" }),
    grp("Oslo", "Oslo", { id: "demo", felt: { demo: true } }),
    grp("Oslo", "Oslo", { id: "forventet", felt: { status: "forventet" } }),
    grp("Oslo", "Oslo", { id: "dod", felt: { dod: true } }),
    grp("Oslo", "Oslo", { id: "utlopt", felt: { lenkestatus: "utløpt" } }),
    grp("Oslo", "Oslo", { id: "passert", datoTil: "2026-01-01" }),
    grp("Oslo", "Oslo", { id: "ok", felt: { status: "delvis" } }),
  ];
  const r = flereTilbud(alle, "selv", I_DAG, valg);
  assert.deepEqual(r.kommune.map((g) => g.slug), ["ok"]);
});

test("flereTilbud: fylket er reserve bare når kommunen har færre enn tre, og totalt maks seks", () => {
  const alle = [grp("Oslo", "Oslo", { id: "selv" }), grp("Oslo", "Oslo", { id: "a" })];
  for (let i = 0; i < 10; i++) alle.push(grp("Nordre Follo", "Oslo"));
  alle.push(grp("Bergen", "Vestland", { id: "annet-fylke" }));
  const r = flereTilbud(alle, "selv", I_DAG, valg);
  assert.deepEqual(r.kommune.map((g) => g.slug), ["a"]);
  assert.equal(r.fylke.length, FLERE_TILBUD_MAKS - 1);
  assert.ok(r.fylke.every((g) => g.medlemmer[0].fylke === "Oslo" && g.medlemmer[0].kommune !== "Oslo"));
  assert.ok(!r.fylke.some((g) => g.slug === "annet-fylke"));
});

test("flereTilbud: ingenting å vise gir tomt resultat (blokken skal da ikke tegnes)", () => {
  const r = flereTilbud([grp("Oslo", "Oslo", { id: "selv" }), grp("Bergen", "Vestland")], "selv", I_DAG, valg);
  assert.deepEqual(r, { kommune: [], fylke: [] });
  assert.deepEqual(flereTilbud([], "x", I_DAG, valg), { kommune: [], fylke: [] });
  assert.deepEqual(flereTilbud([grp("Oslo", "Oslo")], "x", I_DAG, {}), { kommune: [], fylke: [] });
});

test("flereTilbud: sortert på startdato, deretter tittel", () => {
  const alle = [
    grp("Oslo", "Oslo", { id: "selv" }),
    grp("Oslo", "Oslo", { id: "senere", datoFra: "2027-03-01" }),
    grp("Oslo", "Oslo", { id: "b", datoFra: "2027-02-15", tittel: "B" }),
    grp("Oslo", "Oslo", { id: "a", datoFra: "2027-02-15", tittel: "A" }),
  ];
  assert.deepEqual(flereTilbud(alle, "selv", I_DAG, valg).kommune.map((g) => g.slug), ["a", "b", "senere"]);
});

test("«Flere tilbud» finnes på tre språk, og blokken tegnes bare med innhold, uten påmeldingslenker", () => {
  const i18n = les("lib", "i18n.ts");
  assert.match(i18n, /moreTitle: "Flere tilbud i \{sted\}"/);
  assert.match(i18n, /moreTitle: "Fler erbjudanden i \{sted\}"/);
  assert.match(i18n, /moreTitle: "More camps in \{sted\}"/);
  const v = les("components", "PageView.tsx");
  assert.match(v, /side\.flereTilbud\[0\] \? <FlereTilbud/);
  assert.match(v, /side\.flereTilbud\[1\] \? <FlereTilbud/);
  const blokk = v.slice(v.indexOf("function FlereTilbud"), v.indexOf("function Arrangor"));
  assert.doesNotMatch(blokk, /camp\.url|signup|seeOrganiser|rel="noopener/);
  const katalog = les("lib", "katalog.ts");
  assert.match(katalog, /if \(valgt\.kommune\.length\) flereTilbud\.push/);
  assert.match(katalog, /if \(valgt\.fylke\.length && forste\.fylke\) flereTilbud\.push/);
});
