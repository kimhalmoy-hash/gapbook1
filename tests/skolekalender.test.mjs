import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { kanoniskNorsk, hreflangMellom } from "../lib/globale-ruter.mjs";
import {
  lesSkolekalender,
  norskeKalenderSider,
  raderForSide,
  regionInnhold,
  slåSammenHelligdager,
  validerSkolekalender,
} from "../lib/skolekalender.mjs";

const geo = JSON.parse(readFileSync(new URL("../data/geografi.json", import.meta.url), "utf8"));
const rader = lesSkolekalender();

test("skolekalenderen følger skjema v2", () => {
  assert.equal(rader.length, 1927);
  assert.deepEqual(validerSkolekalender(rader), []);
  const uke = /^\d{4}-W\d{2}$/;
  assert.ok(rader.every((rad) => !rad.iso_uke_fra || uke.test(rad.iso_uke_fra)));
  assert.ok(rader.every((rad) => !rad.iso_uke_til || uke.test(rad.iso_uke_til)));
  assert.ok(rader.filter((rad) => rad.status === "verifisert").every((rad) => uke.test(rad.iso_uke_fra) && uke.test(rad.iso_uke_til)));
  assert.ok(rader.some((rad) => rad.kilde_url_2.startsWith("http")));
});

test("sider bruker status, ikke merknad", () => {
  const medMerknad = rader.filter((rad) => rad.status !== "verifisert" && /verifisert|avklart|AVVIK/i.test(rad.merknad));
  assert.ok(medMerknad.length > 0);
  const vist = raderForSide(rader);
  assert.equal(vist.some((rad) => rad.status !== "verifisert"), false);
  assert.equal(vist.some((rad) => rad.region === "Bergen" && rad.ferie_type === "sommer"), false);
  const oslo = vist.find((rad) => rad.region === "Oslo" && rad.ferie_type === "sommer");
  assert.equal(oslo.status, "verifisert");
  const stavanger = vist.find((rad) => rad.region === "Stavanger" && rad.ferie_type === "sommer");
  assert.ok(stavanger.kilde_url_2.startsWith("http"));
});

test("17. mai og 2. pinsedag 2027 telles som én dag", () => {
  const samme = rader.filter((rad) => rad.fra === "2027-05-17" && rad.ferie_type === "helligdag");
  assert.equal(samme.length, 2);
  assert.equal(samme.reduce((sum, rad) => sum + Number(rad.fridager), 0), 2);
  const dag = slåSammenHelligdager(rader).find((rad) => rad.dato === "2027-05-17");
  assert.equal(dag.fridager, 1);
  assert.deepEqual(dag.navn.sort(), ["17. mai (Grunnlovsdagen)", "2. pinsedag"]);
  assert.equal(dag.uke, "2027-W20");
});

test("regionkalender genereres bare der det finnes verifiserte data", () => {
  const sider = norskeKalenderSider(geo, rader);
  const stier = sider.map((side) => side.path).sort();
  assert.equal(stier.length, 15);
  assert.ok(stier.includes("/no/oslo/school-holidays/"));
  assert.ok(stier.includes("/no/vestland/school-holidays/"));
  assert.ok(sider.every((side) => side.offisiell === true && side.locale === "nb"));
  assert.equal(sider.some((side) => side.path.includes("/oslo/oslo/")), false);
  assert.equal(kanoniskNorsk("/no/oslo/school-holidays/"), null);
  assert.deepEqual(kanoniskNorsk("/no/oslo/oslo/fotball/"), {
    generer: false,
    grunn: "Norge bruker eksisterende URL uten landprefiks. Canonical forblir den norske stien.",
  });
  const vestland = regionInnhold(rader, "vestland");
  const bergen = vestland.kommuner.find((kommune) => kommune.navn === "Bergen");
  assert.ok(bergen.rader.some((rad) => rad.type === "vinter" && rad.uke === "2027-W09"));
  assert.equal(bergen.rader.some((rad) => rad.type === "sommer"), false);
  const oslo = regionInnhold(rader, "oslo").kommuner.find((kommune) => kommune.navn === "Oslo");
  assert.ok(oslo.rader.some((rad) => rad.type === "sommer" && rad.uke === "2027-W24–2027-W32"));
  const spraak = hreflangMellom(sider);
  assert.ok(spraak.every((side) => side.alternates.length === 1 && side.alternates[0].locale === "nb"));
  assert.ok(spraak.every((side) => side.xDefault === side.path));
});
