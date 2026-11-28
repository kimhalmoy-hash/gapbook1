import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  globaleSider,
  globalSideIndeks,
  hreflangMellom,
  kanoniskNorsk,
  validerGeografi,
  TEMA_MIN_GLOBAL,
} from "../lib/globale-ruter.mjs";

const geo = JSON.parse(readFileSync(new URL("../data/geografi.json", import.meta.url), "utf8"));

test("geografi har unike slugs, gyldige koordinater og iso2", () => {
  assert.deepEqual(validerGeografi(geo), []);
  const iso = geo.land.map((rad) => rad.iso2).sort();
  assert.deepEqual(iso, ["AT", "DE", "GB", "IE", "NO", "SE"]);
  assert.ok(geo.regioner.length >= 15);
  assert.ok(geo.steder.length >= 48);
  assert.equal(geo.ferier.length, 0);
  assert.equal(geo.tilbud.length, 0);
});

test("globale sider lages bare når det finnes data, og Norge dupliseres ikke", () => {
  assert.deepEqual(globaleSider(geo), []);
  assert.deepEqual(kanoniskNorsk("/no/oslo/oslo/fotball/"), {
    generer: false,
    grunn: "Norge bruker eksisterende URL uten landprefiks. Canonical forblir den norske stien.",
  });
  assert.equal(kanoniskNorsk("/sommerleir/oslo/"), null);
  const eksempel = {
    land: geo.land,
    regioner: [
      ...geo.regioner,
      { iso2: "DE", slug: "bayern", navn: { nb: "Bayern" }, spraak: "de" },
    ],
    steder: [{ iso2: "DE", region: "bayern", slug: "muenchen", navn: { nb: "München" }, lat: 48.14, lng: 11.58 }],
    ferier: [
      { iso2: "DE", region: "bayern", offisiell: false, kildeUrl: "", eksempel: false },
      { iso2: "SE", region: "finnes-ikke", offisiell: true, kildeUrl: "https://example.test/kalender", eksempel: true },
    ],
    tilbud: [
      { iso2: "DE", region: "bayern", sted: "muenchen", kategori: "ferienbetreuung", status: "verifisert", spraak: "de" },
      { iso2: "DE", region: "bayern", sted: "muenchen", kategori: "ferienbetreuung", status: "forventet", spraak: "de" },
      { iso2: "NO", region: "oslo", sted: "oslo", kategori: "fotball", status: "verifisert" },
    ],
  };
  const sider = globaleSider(eksempel);
  const stier = sider.map((side) => side.path).sort();
  assert.deepEqual(stier, [
    "/de/bayern/muenchen/ferienbetreuung/",
    "/de/bayern/school-holidays/",
  ]);
  const kalender = sider.find((side) => side.kind === "school-holidays");
  const kategori = sider.find((side) => side.kind === "by-kategori");
  assert.equal(globalSideIndeks(kalender), false);
  assert.equal(globalSideIndeks({ ...kalender, offisiell: true }), true);
  assert.equal(globalSideIndeks(kategori), false);
  assert.equal(TEMA_MIN_GLOBAL, 3);
  assert.equal(globalSideIndeks({ ...kategori, antall: 3 }), true);
});

test("hreflang lenker bare til varianter som finnes", () => {
  const sider = hreflangMellom([
    { id: "de-bayern", locale: "de", path: "/de/bayern/school-holidays/" },
    { id: "no-oslo", locale: "nb", path: "/sommerleir/oslo/" },
    { id: "no-oslo", locale: "en", path: "/en/sommerleir/oslo/" },
  ]);
  const tysk = sider.find((side) => side.locale === "de");
  assert.deepEqual(tysk.alternates.map((rad) => rad.locale), ["de"]);
  assert.equal(tysk.xDefault, "/de/bayern/school-holidays/");
  const norsk = sider.find((side) => side.locale === "nb");
  assert.deepEqual(norsk.alternates.map((rad) => rad.locale).sort(), ["en", "nb"]);
  assert.equal(norsk.xDefault, "/sommerleir/oslo/");
  assert.equal(norsk.alternates.some((rad) => rad.locale === "sv"), false);
});
