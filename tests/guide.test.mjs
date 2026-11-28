import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { erIntern, guideLenker, inlineTekst, parseGuide, tilpassLenker } from "../lib/guide.mjs";
import { guideData, i18n, katalog } from "./lib/last-katalog.mjs";

const { alleRuter, finnRute, indekserbar, jsonLd, metadataFor, modell, sammeSti } = katalog;
const FILER = {
  vinter: new URL("../data/guide-2027/vinterferie-nb.md", import.meta.url),
  sommer: new URL("../data/guide-2027/sommerleir-nb.md", import.meta.url),
};
const guider = Object.fromEntries(Object.entries(FILER).map(([navn, url]) => [navn, parseGuide(readFileSync(url, "utf8"))]));

const stiTilSlug = (href) => href.split("/").filter(Boolean);
const finnes = (href) => finnRute(stiTilSlug(href)) !== null;
const indekserte = new Set(alleRuter().filter((rute) => indekserbar(rute)).map((rute) => sammeSti(rute, rute.locale)));
const harSide = (href) => indekserte.has(href);

test("guiden lenker bare til interne URL-er som finnes i bygget", () => {
  for (const [navn, guide] of Object.entries(guider)) {
    const mangler = guideLenker(guide.blokker).filter((href) => erIntern(href) && !finnes(href));
    assert.deepEqual(mangler, [], `${navn}: interne lenker uten side`);
  }
});

test("lenketesten feiler for en intern URL som ikke finnes, for eksempel /sommerleir/uke-24/", () => {
  const md = `---\naar: 2027\nh1: A\ntittel: B\nbeskrivelse: C\n---\n\n## Test\n\nSe [uke 24](/sommerleir/uke-24/) og [uke 25](/sommerleir/uke-25/).\n`;
  const mangler = guideLenker(parseGuide(md).blokker).filter((href) => erIntern(href) && !finnes(href));
  assert.deepEqual(mangler, ["/sommerleir/uke-24/"]);
});

test("lenker uten indekserbar side vises som tekst, resten peker til sider i sitemap", () => {
  for (const [navn, guide] of Object.entries(guider)) {
    const blokker = tilpassLenker(guide.blokker, harSide);
    const igjen = guideLenker(blokker).filter(erIntern);
    assert.ok(igjen.length > 0, `${navn}: ingen interne lenker igjen`);
    assert.deepEqual(igjen.filter((href) => !indekserte.has(href)), [], `${navn}: lenke til side som ikke er i sitemap`);
    for (const href of new Set(guideLenker(guide.blokker).filter(erIntern))) {
      if (!indekserte.has(href)) assert.ok(!igjen.includes(href), `${navn}: ${href} skulle vært tekst`);
    }
  }
});

test("lenker som mangler side blir tekst, og tomme listepunkter og overskrifter forsvinner", () => {
  const md = `---\naar: 2027\nh1: A\ntittel: B\nbeskrivelse: C\n---\n\n## Liste\n\n- [Borte](/finnes-ikke/)\n- [Her](/ja/)\n\n## Tom\n\n- [Borte](/finnes-ikke/)\n\n## Tekst\n\nSe [uke 24](/finnes-ikke/) og [ekstern](https://example.com/).\n`;
  const blokker = tilpassLenker(parseGuide(md).blokker, (href) => href === "/ja/");
  assert.deepEqual(blokker.filter((b) => b.type === "h2").map((b) => b.tekst), ["Liste", "Tekst"]);
  const liste = blokker.find((b) => b.type === "ul");
  assert.equal(liste.punkter.length, 1);
  assert.equal(inlineTekst(blokker.find((b) => b.type === "p").deler), "Se uke 24 og ekstern.");
  assert.deepEqual(guideLenker(blokker), ["/ja/", "https://example.com/"]);
});

test("guiden gjelder bare nb-hubene for riktig år, ikke ukesider, kommunesider eller andre språk", () => {
  const hub = (slug) => finnRute(slug);
  assert.ok(guideData.guideFor(hub(["vinterferie"])));
  assert.ok(guideData.guideFor(hub(["sommerleir"])));
  assert.equal(guideData.guideFor(hub(["vinterferie", "uke-8"])), null);
  assert.equal(guideData.guideFor(hub(["sommerleir", "oslo"])), null);
  assert.equal(guideData.guideFor(hub(["sv", "vinterferie"])) ?? null, null);
  assert.equal(guideData.guideFor({ ...hub(["sommerleir"]), aar: 2028 }), null);
});

test("året står i tittel, H1 og beskrivelse, og hubene er fortsatt indekserbare", () => {
  for (const slug of [["vinterferie"], ["sommerleir"]]) {
    const rute = finnRute(slug);
    assert.ok(indekserbar(rute), `${slug} skal være indekserbar`);
    const side = modell(rute);
    assert.match(side.h1, /2027/);
    const meta = metadataFor(rute);
    assert.match(meta.title.absolute, /2027/);
    assert.match(meta.title.absolute, / \| WeekSlot$/);
    assert.ok(meta.description.length <= 160, `beskrivelse ${meta.description.length} tegn`);
    assert.deepEqual(meta.robots, { index: true, follow: true });
  }
  const sommerIntro = JSON.parse(readFileSync(new URL("../data/intro-sommerferie-nb.json", import.meta.url), "utf8"));
  assert.equal(modell(finnRute(["sommerleir"])).ingress, sommerIntro.ingress, "sommer-ingressen er uendret");
  assert.equal(modell(finnRute(["vinterferie"])).ingress, i18n.copy("nb").seasonBlurb.vinter, "vinter-ingressen er uendret");
  assert.equal(modell(finnRute(["vinterferie"])).h1, guider.vinter.meta.h1);
  assert.equal(modell(finnRute(["sommerleir"])).h1, guider.sommer.meta.h1);
});

test("FAQPage JSON-LD matcher den synlige FAQ-teksten ordrett", () => {
  for (const [navn, slug] of [["vinter", ["vinterferie"]], ["sommer", ["sommerleir"]]]) {
    const rute = finnRute(slug);
    const guide = guider[navn];
    assert.ok(guide.faq.length >= 5, `${navn}: FAQ`);
    const blokker = tilpassLenker(guide.blokker, harSide);
    const start = blokker.findIndex((b) => b.type === "h2" && b.tekst === "Ofte stilte spørsmål");
    assert.ok(start >= 0);
    const synlig = [];
    for (let i = start + 1; i < blokker.length && blokker[i].type !== "h2"; i += 2) {
      assert.equal(blokker[i].type, "h3");
      assert.equal(blokker[i + 1].type, "p");
      synlig.push({ q: blokker[i].tekst, a: inlineTekst(blokker[i + 1].deler) });
    }
    const faq = jsonLd(rute, modell(rute)).find((b) => b["@type"] === "FAQPage");
    assert.ok(faq, `${navn}: mangler FAQPage`);
    assert.deepEqual(
      faq.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text })),
      synlig,
    );
  }
});

test("andre sider får ikke FAQPage fra guiden", () => {
  for (const slug of [["vinterferie", "uke-8"], ["sommerleir", "oslo"], ["vinterferie", "oslo"], []]) {
    const rute = finnRute(slug);
    assert.ok(rute, slug.join("/"));
    assert.equal(jsonLd(rute, modell(rute)).some((b) => b["@type"] === "FAQPage"), false, slug.join("/"));
  }
});
