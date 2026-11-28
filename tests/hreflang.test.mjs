import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { klynge } from "../lib/hreflang.mjs";
import { landvelger } from "../lib/landvelger.mjs";

const hjem = [
  { locale: "nb", kode: "nb-NO", url: "https://weekslot.com/", indeks: true },
  { locale: "sv", kode: "sv-NO", url: "https://weekslot.com/sv/", indeks: true },
  { locale: "en", kode: "en-NO", url: "https://weekslot.com/en/", indeks: true },
];

test("forsiden har gjensidig hreflang og x-default på /", () => {
  const ut = klynge(hjem);
  for (const sett of ut.values()) {
    assert.equal(sett["x-default"], "https://weekslot.com/");
    assert.equal(sett["nb-NO"], "https://weekslot.com/");
    assert.equal(sett["sv-NO"], "https://weekslot.com/sv/");
    assert.equal(sett["en-NO"], "https://weekslot.com/en/");
    assert.equal(sett["sv-SE"], undefined);
    assert.equal(sett["en-GB"], undefined);
  }
});

test("en noindex-variant forsvinner fra hele klyngen", () => {
  const ut = klynge(hjem.map((rad) => (rad.locale === "sv" ? { ...rad, indeks: false } : rad)));
  assert.deepEqual(ut.get("sv"), {});
  assert.equal(ut.get("nb")["sv-NO"], undefined);
  assert.equal(ut.get("en")["sv-NO"], undefined);
  assert.equal(ut.get("nb")["x-default"], "https://weekslot.com/");
  assert.equal(ut.get("nb")["en-NO"], "https://weekslot.com/en/");
  assert.equal(ut.get("en")["nb-NO"], "https://weekslot.com/");
});

test("landvelgeren lenker til de seks landene uten å bytte sti", () => {
  const nb = landvelger("nb", "NO", "nb");
  assert.equal(nb.lukket, "Land: Norge");
  assert.equal(nb.overskrift, "Velg land");
  assert.deepEqual(
    nb.land.flatMap((land) => land.lenker.map((lenke) => lenke.href)),
    ["/", "/sv/", "/en/", "/se/", "/de/", "/at/", "/gb/", "/ie/"],
  );
  assert.equal(nb.land[0].lenker.find((lenke) => lenke.label === "Bokmål").aktiv, true);
  const se = landvelger("sv-SE", "SE", "sv");
  assert.equal(se.lukket, "Land: Sverige");
  assert.equal(se.overskrift, "Välj land");
  assert.equal(se.land.find((land) => land.kode === "AT").navn, "Österrike");
  const de = landvelger("de-DE", "DE", "de");
  assert.equal(de.lukket, "Land: Deutschland");
  assert.equal(de.overskrift, "Land wählen");
  assert.equal(de.land.find((land) => land.kode === "GB").navn, "Vereinigtes Königreich");
  const en = landvelger("en", "NO", "en");
  assert.equal(en.lukket, "Country: Norway");
  assert.equal(en.overskrift, "Choose country");
  assert.equal(existsSync(new URL("../middleware.ts", import.meta.url)), false);
});
