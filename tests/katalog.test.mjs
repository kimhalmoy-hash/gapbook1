import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  avvikKommuner,
  fjoraarsTekst,
  campIFerie,
  campUker,
  erFjoraarsSommer,
  erDato8,
  inneholderPerson,
  isoUke,
  kommunerMedFri,
  rensPerson,
  slug,
  TEMA_MIN,
  ukeListe,
  ukeMandag,
  utenPamelding,
  pameldingModus,
  formaterUkeTall,
  gruppeTrefferUke,
  antallSomTeller,
  prisVisning,
  skolerutaIndeks,
  hreflangLokaler,
} from "../lib/pure.mjs";
import { assertKilderTrygge, erHoopit, vurderUrl } from "../scripts/lib/plattform.mjs";
import { stiTillatt } from "../scripts/lib/robots.mjs";
import { faktaFraJsonLd, pameldingFraJsonLd, pameldingFraRubic } from "../scripts/lib/utdrag.mjs";
import { forfalte, parseSjekkPlan } from "../scripts/lib/sjekk-plan.mjs";

const config = JSON.parse(readFileSync(new URL("../config/kilder.json", import.meta.url), "utf8"));

test("iso-uke for kjente dager i 2027", () => {
  assert.deepEqual(isoUke("2027-02-15"), { aar: 2027, uke: 7 });
  assert.deepEqual(isoUke("2027-02-22"), { aar: 2027, uke: 8 });
  assert.deepEqual(isoUke("2027-03-01"), { aar: 2027, uke: 9 });
  assert.equal(ukeMandag(2027, 8), "2027-02-22");
  assert.deepEqual(isoUke("2026-09-30"), { aar: 2026, uke: 40 });
});

test("ukeListe leser tall, spenn og lister uten å finne på uker", () => {
  assert.deepEqual(ukeListe(8), [8]);
  assert.deepEqual(ukeListe("25-27"), [25, 26, 27]);
  assert.deepEqual(ukeListe("26,32,33"), [26, 32, 33]);
  assert.deepEqual(ukeListe("ikke-en-uke"), []);
  assert.deepEqual(ukeListe("1-40"), []);
});

test("ferieuker kommer fra data, ikke fra kommunenavn", () => {
  const testvik = {
    skolear: "2026-2027",
    kommune: "Testvik",
    hostferie: null,
    vinterferie: { uke: 3, datoFra: "2027-01-18", datoTil: "2027-01-22" },
    paske: null,
    kildeUrl: "https://example.com/kilde",
    merknad: null,
  };
  assert.equal(kommunerMedFri([testvik], 2027, 3)[0].kommune, "Testvik");
  assert.equal(kommunerMedFri([testvik], 2027, 8).length, 0);
  const tromso = {
    skolear: "2026-2027",
    kommune: "Tromsø",
    hostferie: { uke: 40, datoFra: "2026-09-30", datoTil: "2026-10-02" },
    vinterferie: null,
    paske: null,
    kildeUrl: "https://example.com/tromso",
    merknad: null,
  };
  const treff = kommunerMedFri([tromso], 2026, 40);
  assert.equal(treff.length, 1);
  assert.equal(treff[0].datoFra, "2026-09-30");
  assert.equal(treff[0].datoTil, "2026-10-02");
  const utenfor = {
    sesong: "host2026",
    uke: 40,
    datoFra: "2026-09-28",
    datoTil: "2026-09-29",
    kommune: "Tromsø",
  };
  assert.equal(campIFerie(utenfor, tromso).length, 0);
  const innenfor = { ...utenfor, datoFra: "2026-09-30", datoTil: "2026-10-01" };
  assert.equal(campIFerie(innenfor, tromso).length, 1);
});

test("Hoopit er blokkert selv om config skulle si tillatt", () => {
  assert.equal(erHoopit("https://app.hoopit.io/join/abc"), true);
  assert.throws(() =>
    assertKilderTrygge({
      plattformer: [{ id: "hoopit", verter: ["hoopit.io"], tillatt: true }],
      kilder: [],
    }),
  );
  assert.throws(() =>
    assertKilderTrygge({
      plattformer: [],
      kilder: [{ url: "https://app.hoopit.io/join/x" }],
    }),
  );
  assert.equal(vurderUrl(config, "https://app.hoopit.io/join/x").handling, "blokker");
  assert.doesNotThrow(() => assertKilderTrygge(config));
});

test("plattformer som ikke er tillatt, hentes ikke", () => {
  assert.equal(vurderUrl(config, "https://aktiviteter.dnt.no/register/1").handling, "ikke-tillatt");
  assert.equal(vurderUrl(config, "https://www.letsreg.com/no/register/1").handling, "ikke-tillatt");
  assert.equal(vurderUrl(config, "https://spond.com/discover/nb-no/events/ABC").handling, "spond");
  assert.equal(vurderUrl(config, "https://spond.com/storage/bilde.jpg").handling, "utenfor");
  assert.equal(vurderUrl(config, "https://app.rubic.no/rest/public/events").handling, "utenfor");
  assert.equal(vurderUrl(config, "https://app.rubic.no/Public/Events/1").handling, "rubic");
  assert.equal(vurderUrl(config, "https://stavangerif.no/fotballskole").handling, "arrangor");
});

test("robots.txt: lengste regel, og Hoopit-forsiden er den eneste åpne stien", () => {
  const hoopit = "user-agent: *\nAllow: /$\nDisallow: /\n";
  assert.equal(stiTillatt(hoopit, "/", "WeekSlotBot/0.1"), true);
  assert.equal(stiTillatt(hoopit, "/join/x", "WeekSlotBot/0.1"), false);
  const kfuk = "User-agent: *\nDisallow: /aktiviteter/*\nAllow: /aktiviteter/event-id-37170\n";
  assert.equal(stiTillatt(kfuk, "/aktiviteter/event-id-37170", "WeekSlotBot"), true);
  assert.equal(stiTillatt(kfuk, "/aktiviteter/event-id-99999", "WeekSlotBot"), false);
});

test("Spond-utdrag tar bare fakta", () => {
  const html = `<script type="application/ld+json">{
    "@type": "SportsEvent",
    "name": "Håndballskole",
    "description": "Kontakt Kari kari@example.com, telefon 924 14 042. Lang tekst.",
    "image": "https://spond.com/storage/x.jpg",
    "startDate": "2027-02-22T08:00:00",
    "endDate": "2027-02-24",
    "location": { "name": "Hallen", "address": "Veien 1, Oslo" },
    "offers": { "price": "950", "priceCurrency": "NOK" },
    "url": "https://spond.com/discover/nb-no/events/ABC"
  }</script>`;
  const [fakta] = faktaFraJsonLd(html);
  assert.equal(fakta.tittel, "Håndballskole");
  assert.equal(fakta.datoFra, "2027-02-22");
  assert.equal(fakta.prisNok, 950);
  assert.equal(fakta.sted, "Veien 1, Oslo");
  assert.equal("description" in fakta, false);
  assert.equal("image" in fakta, false);
  assert.equal(JSON.stringify(fakta).includes("kari@example.com"), false);
  assert.equal(JSON.stringify(fakta).includes("924"), false);
});

test("personopplysninger fjernes og ISO-datoer blir igjen", () => {
  assert.equal(inneholderPerson("Skriv til kari@example.com"), true);
  assert.equal(inneholderPerson("ring 924 14 042"), true);
  assert.equal(inneholderPerson("id 48948539 i teksten"), true);
  const spond = "https://sandnesulf.spond.club/news-article/362C3B1674AB48948539B819FAB79B29";
  assert.equal(inneholderPerson(`Kilde: ${spond}.`), false);
  assert.equal(rensPerson(`Kilde: ${spond}.`), `Kilde: ${spond}.`);
  assert.equal(rensPerson("artikkel AB48948539B slutt"), "artikkel AB48948539B slutt");
  assert.equal(erDato8("01052026"), true);
  assert.equal(inneholderPerson("register/tine_01052026"), false);
  assert.equal(inneholderPerson("2027-02-22 til 2027-02-26"), false);
  assert.equal(rensPerson("Pris 1 500. Mail kari@example.com."), "Pris 1 500. Mail.");
  assert.equal(TEMA_MIN, 3);
});

test("skolerute-avvik nevner kommuner uten ferieuke", () => {
  const linjer = JSON.parse(readFileSync(new URL("../data/skolerute-avvik.json", import.meta.url), "utf8"));
  const navn = avvikKommuner(linjer);
  for (const kommune of ["Færder", "Malvik", "Ørsta", "Nore og Uvdal"]) {
    assert.ok(navn.includes(kommune), kommune);
  }
});

test("påmeldingsstatus bare fra strukturerte felt", () => {
  const html = `<script type="application/ld+json">{"@type":"Event","name":"Camp","offers":{"availability":"https://schema.org/SoldOut","price":"100"}}</script>`;
  assert.equal(pameldingFraJsonLd(html), "full");
  assert.equal(pameldingFraJsonLd(`<p>Fulltegnet i fjor, men teksten er lang.</p>`), null);
  assert.equal(pameldingFraRubic(`<span class="status">Fulltegnet</span>`), "full");
  assert.equal(pameldingFraRubic(`<p>I fjor var leiren fulltegnet og utsolgt for alle.</p>`), null);
  assert.equal(pameldingFraJsonLd(`<script type="application/ld+json">{"offers":{"availability":"https://schema.org/InStock"}}</script>`), "apen");
});

test("åpent tilbud uten påmelding", () => {
  assert.equal(utenPamelding({ type: "skøyter/bading (åpent tilbud)", notat: "", prisNotat: "" }), true);
  assert.equal(utenPamelding({ type: "museum", prisNotat: "Gratis drop-in (2026)" }), true);
  assert.equal(utenPamelding({ type: "fotballskole", notat: "Påmelding åpen", prisNotat: "1 500 kr" }), false);
});

test("slugs er unike og Færder blir fardar", () => {
  assert.equal(slug("Færder"), "fardar");
  assert.equal(slug("Bærum"), "baerum");
  assert.equal(slug("Tromsø"), "tromso");
  assert.equal(slug("Ørsta"), "orsta");
  const navn = ["Oslo", "Bergen", "Færder", "Bærum", "Tromsø", "Ålesund", "Ørsta", "Øygarden"];
  assert.equal(new Set(navn.map(slug)).size, navn.length);
});

test("kommune-skolerute indekseres bare på bokmål", () => {
  assert.equal(skolerutaIndeks("skoleruta", "nb"), true);
  assert.equal(skolerutaIndeks("skoleruta", "sv"), false);
  assert.equal(skolerutaIndeks("skoleruta", "en"), false);
  assert.equal(skolerutaIndeks("skolerutaHub", "sv"), true);
  assert.equal(skolerutaIndeks("skolerutaHub", "en"), true);
  assert.deepEqual(hreflangLokaler("skoleruta"), ["nb"]);
  assert.deepEqual(hreflangLokaler("skolerutaHub"), ["nb", "sv", "en"]);
});

test("prisnotat brukes som prislinje når tallet mangler", () => {
  const mangler = "Pris ikke oppgitt";
  const notat = "Prisområde kr 6 950–7 750 per uke, kost og lunsj";
  assert.deepEqual(prisVisning(null, notat, mangler), { linje: notat, notat: null });
  assert.deepEqual(prisVisning("", "  ", mangler), { linje: mangler, notat: null });
  assert.deepEqual(prisVisning("1 050 kr", "inkl. lunsj", mangler), { linje: "1 050 kr", notat: "inkl. lunsj" });
  assert.deepEqual(prisVisning("1 050 kr", null, mangler), { linje: "1 050 kr", notat: null });
});

test("uker blir intervall eller liste", () => {
  assert.equal(formaterUkeTall([33, 25, 26, 27, 28, 29, 30, 31, 32]), "25–33");
  assert.equal(formaterUkeTall([30, 25, 27]), "25, 27, 30");
  assert.equal(formaterUkeTall([25, 26, 27, 30]), "25–27, 30");
  assert.equal(formaterUkeTall([8]), "8");
});

test("ukeside treffer bare grupper som har uken", () => {
  const hest = [25, 26, 27, 28, 29, 30, 31, 32, 33].map((uke) => ({
    id: `hest-${uke}`,
    tilbyder: "Stall",
    tittel: "Sommerleir med hest",
    kommune: "Færder",
    by: "Tjøme",
    sesong: "sommer2027",
    uke,
    datoFra: null,
    datoTil: null,
    status: "delvis",
    demo: false,
    dod: false,
  }));
  const annen = [{
    id: "annen",
    tilbyder: "Annen",
    tittel: "Annet kurs",
    kommune: "Oslo",
    by: "Oslo",
    sesong: "sommer2027",
    uke: 8,
    datoFra: null,
    datoTil: null,
    status: "verifisert",
    demo: false,
    dod: false,
  }];
  assert.equal(gruppeTrefferUke(hest, 2027, 26), true);
  assert.equal(gruppeTrefferUke(hest, 2027, 8), false);
  assert.equal(gruppeTrefferUke(annen, 2027, 8), true);
  assert.equal(antallSomTeller(hest, "2026-11-26"), 1);
  assert.ok(antallSomTeller(hest, "2026-11-26") < TEMA_MIN);
  assert.equal(antallSomTeller([...hest, ...annen], "2026-11-26"), 2);
  assert.equal(antallSomTeller(hest.map((e) => ({ ...e, status: "forventet" })), "2026-11-26"), 0);
  assert.equal(antallSomTeller([{ ...hest[0], status: "verifisert" }, ...hest.slice(1).map((e) => ({ ...e, status: "forventet" }))], "2026-11-26"), 1);
});

test("påmelding som allerede har åpnet blir én linje", () => {
  assert.equal(pameldingModus(null, "2026-11-19", "2026-11-26"), "apnet");
  assert.equal(pameldingModus(null, "2026-11-26", "2026-11-26"), "apnet");
  assert.equal(pameldingModus(null, "2027-01-01", "2026-11-26"), "apner");
  assert.equal(pameldingModus("ikke_apnet", "2027-01-01", "2026-11-26"), "apner");
  assert.equal(pameldingModus("ikke_apnet", "2026-11-19", "2026-11-26"), "status");
  assert.equal(pameldingModus(null, null, "2026-11-26"), "status");
});

test("fjorårsnotat blir en kort linje uten URL", () => {
  const notat = "Fjorår: 23.–26.02.2026 kl. 10–14. Kilde: https://stavangerif.no/na-apner-pameldingen.";
  assert.equal(fjoraarsTekst(notat), "23.–26.02.2026 kl. 10–14");
  assert.equal(String(fjoraarsTekst(notat)).includes("http"), false);
});

test("forfalte kilder følger sjekkDato", () => {
  const plan = parseSjekkPlan(`| tilbyder | kommune | uke 2027 | status nå | kilde-URL som skal sjekkes | når | grunnlag | anbefalt sjekkdato |
|---|---|---|---|---|---|---|---|
| Klubb | Oslo | 8 | delvis | https://example.com/a | desember | sett | 2026-12-01 |
| Annen | Bergen | 9 | forventet | https://spond.com/discover/nb-no/events/ABC | januar | sett | 2027-01-08 |`);
  assert.equal(plan[0].kildeUrl, "https://example.com/a");
  assert.equal(plan[0].sjekkDato, "2026-12-01");
  assert.equal(forfalte(plan, "2026-11-26").length, 0);
  assert.equal(forfalte(plan, "2026-12-01").length, 1);
  assert.equal(forfalte(plan, "2027-01-08").length, 2);
});

test("importert skolerute og leirer", () => {
  const skolerute = JSON.parse(readFileSync(new URL("../data/skolerute.json", import.meta.url), "utf8"));
  const leirer = JSON.parse(readFileSync(new URL("../data/leirer.json", import.meta.url), "utf8"));
  const bergen = skolerute.find((r) => r.kommune === "Bergen");
  assert.equal(bergen.skolear, "2026-2027");
  assert.equal(bergen.vinterferie.datoFra, "2027-03-01");
  assert.equal(bergen.vinterferie.datoTil, "2027-03-05");
  assert.match(bergen.merknad, /1\.–5\. mars/);
  assert.match(bergen.merknad, /22\.–26\. februar/);
  const tromso = skolerute.find((r) => r.kommune === "Tromsø");
  assert.equal(tromso.hostferie.datoFra, "2026-09-30");
  assert.equal(tromso.hostferie.datoTil, "2026-10-02");
  const stavanger = skolerute.find((r) => r.kommune === "Stavanger");
  assert.equal(stavanger.vinterferie.uke, 7);
  assert.equal(stavanger.vinterferie.datoFra, "2027-02-15");
  assert.equal(skolerute.length, 305);
  const slugs = skolerute.map((r) => r.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const alta = skolerute.find((r) => r.kommune === "Alta");
  assert.equal(alta.vinterferie.datoFra, "2027-02-24");
  assert.equal(alta.vinterferie.datoTil, "2027-02-26");
  assert.equal(skolerute.some((r) => r.kommune === "Rælingen"), true);
  assert.equal(skolerute.some((r) => r.kildeType === "ikke funnet"), false);
  assert.equal(leirer.length, 624);
  assert.equal(leirer.filter((e) => e.status === "verifisert").length, 51);
  assert.equal(leirer.filter((e) => e.status === "delvis").length, 76);
  assert.equal(leirer.filter((e) => e.status === "forventet").length, 497);
  const fjor = leirer.filter((e) => erFjoraarsSommer(e));
  assert.ok(fjor.length > 0);
  for (const e of fjor) {
    assert.equal(e.datoFra, null, e.id);
    assert.equal(e.datoTil, null, e.id);
    assert.deepEqual(campUker(e), [], e.id);
  }
  const vinter = leirer.find((e) => e.status === "forventet" && String(e.sesong).startsWith("vinter"));
  assert.equal(erFjoraarsSommer(vinter), false);
  assert.ok(campUker(vinter).some((nokkel) => nokkel.startsWith("2027-")));
  const bodo = leirer.find((e) => e.kommune === "Bodø" && e.status === "verifisert" && e.sesong === "sommer2027");
  assert.ok(campUker(bodo).includes("2027-32"));
  assert.equal(leirer.every((e) => "pameldingStatus" in e && "pameldingApner" in e), true);
  assert.equal(leirer.some((e) => e.demo), false);
  assert.equal(leirer.some((e) => /hoopit\.io/i.test(e.url)), false);
  for (const e of leirer) {
    for (const felt of ["tittel", "notat", "prisNotat", "type"]) {
      assert.equal(inneholderPerson(e[felt]), false, `${e.id} ${felt}`);
    }
  }
  const medDato = leirer.filter((e) => e.datoFra && e.datoTil);
  for (const e of medDato) assert.ok(campUker(e).length > 0);
});
