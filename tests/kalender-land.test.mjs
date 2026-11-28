import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { byggKalendere, kalenderTall, kildeErFersk } from "../lib/kalender-land.mjs";
import { parseSkolekalender, validerSkolekalender } from "../lib/skolekalender.mjs";
import { SEARCH_CONSOLE_VERIFISERT } from "../lib/terskel.mjs";

const puljer = JSON.parse(readFileSync(new URL("../data/gb-puljer.json", import.meta.url), "utf8"));
const { sider, innhold } = byggKalendere("2026-11-28", puljer);

test("kilder eldre enn 90 dager er ikke ferske", () => {
  assert.equal(kildeErFersk("2026-11-28", "2026-11-28"), true);
  assert.equal(kildeErFersk("2026-08-01", "2026-11-28"), false);
  assert.equal(SEARCH_CONSOLE_VERIFISERT, false);
});

test("kalendere bygges fra verifiserte rader og køen holder 150", () => {
  const tall = kalenderTall(sider);
  assert.equal(tall.SE.bygget, 21);
  assert.equal(tall.SE.indeks, 21);
  assert.equal(tall.SE.koe, 0);
  assert.equal(tall.DE.bygget, 16);
  assert.equal(tall.DE.indeks, 16);
  assert.equal(tall.AT.indeks, 9);
  assert.equal(tall.IE.bygget, 1);
  assert.equal(tall.IE.indeks, 1);
  assert.ok(tall.GB.bygget > 150);
  assert.equal(tall.GB.indeks, 145);
  assert.equal(tall.GB.indeks + tall.GB.koe, tall.GB.bygget);
  assert.equal(sider.some((side) => side.path === "/ie/school-holidays/" && side.indeks), true);
  const sachsen = innhold.get("/de/sachsen/schulferien/");
  assert.ok(sachsen.perioder.length > 0);
  assert.ok(sachsen.delomrade.length > 0);
  assert.equal(sachsen.perioder.some((rad) => /Fronleichnam/i.test(rad.navn) && /Gemeinden/.test(rad.navn)), false);
  assert.ok(sachsen.delomrade.some((rad) => rad.omrade.includes("Fronleichnam") || rad.navn.includes("Fronleichnam")));
  assert.equal(sider.some((side) => /^\/(us|ca|au|fr)\//.test(side.path)), false);
});

test("skjema v3 godtar var, thanksgiving, distrikt og tom ferie_type", () => {
  const csv = [
    "land,region_niva,region_kode,region,overordnet_region,skolear,ferie_type,navn_lokalt,fra,til,iso_uke_fra,iso_uke_til,fridager,kilde_url,kilde_type,kilde_hentet,status,merknad,kilde_url_2",
    "US,stat,US-CA,California,,2026/27,var,Spring break,2027-04-05,2027-04-09,2027-W14,2027-W14,5,https://example.test/ca,myndighet-side,2026-11-28,verifisert,,",
    "US,distrikt,US-NY-NYCDOE,New York City,New York,2026/27,thanksgiving,Thanksgiving break,2026-11-26,2026-11-27,2026-W48,2026-W48,2,https://example.test/nyc,myndighet-side,2026-11-28,verifisert,,",
    "CA,distrikt,CA-ON-TDSB,Toronto District,Ontario,2026/27,var,March break,2027-03-15,2027-03-19,2027-W11,2027-W11,5,https://example.test/tdsb,myndighet-side,2026-11-28,verifisert,,",
    "FR,academie,FR-PAR,Paris,,2026/27,,Vacances,,,,,,,ikke funnet,2026-11-28,ikke funnet,Kalenderen er ikke lest,",
    "AU,stat,AU-NSW,New South Wales,,2026/27,,School holidays,,,,,,,ikke publisert,2026-11-28,ikke publisert,Ikke publisert,",
  ].join("\n");
  const { rader, feil } = parseSkolekalender(csv);
  assert.deepEqual(feil, []);
  assert.deepEqual(validerSkolekalender(rader), []);
  const avvist = validerSkolekalender([{ ...rader[0], ferie_type: "", status: "verifisert" }]);
  assert.ok(avvist.some((linje) => linje.includes("ferie_type")));
  const utenProvins = validerSkolekalender([{ ...rader[1], overordnet_region: "" }]);
  assert.ok(utenProvins.some((linje) => linje.includes("overordnet_region")));
  const snudd = validerSkolekalender([{ ...rader[0], fra: "2027-04-09", til: "2027-04-05", status: "uavklart" }]);
  assert.equal(snudd.some((linje) => linje.includes("fra etter til")), false);
  const snuddVerifisert = validerSkolekalender([{ ...rader[0], fra: "2027-04-09", til: "2027-04-05" }]);
  assert.ok(snuddVerifisert.some((linje) => linje.includes("fra etter til")));
});
