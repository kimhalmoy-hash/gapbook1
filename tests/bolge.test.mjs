import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { sesongDeler, sommerSideUker, sommerPeriode } from "../lib/pure.mjs";
import { slugKollisjoner, tilbudSider } from "../lib/bolge-ruter.mjs";
import { SEARCH_CONSOLE_VERIFISERT, UKES_KVOTE, gbUke1, slippKoe, tellGrupper } from "../lib/terskel.mjs";
import { tyskErDu as du } from "../lib/sidetekst.mjs";
import { stedSlug as sted } from "../lib/slug-tabell.mjs";

const leirer = JSON.parse(readFileSync(new URL("../data/leirer-global.json", import.meta.url), "utf8"));
const puljer = JSON.parse(readFileSync(new URL("../data/gb-puljer.json", import.meta.url), "utf8"));
const skolerute = JSON.parse(readFileSync(new URL("../data/skolerute.json", import.meta.url), "utf8"));

test("halvterm2027 er en gyldig sesong", () => {
  assert.deepEqual(sesongDeler("halvterm2027"), { navn: "halvterm", aar: 2027 });
  assert.equal(sesongDeler("vinter2027").navn, "vinter");
  assert.equal(leirer.filter((rad) => rad.sesong === "halvterm2027").length, 3);
});

test("bølge 1-ruter har data, og Irland er under terskelen", () => {
  const sider = tilbudSider(leirer);
  assert.equal(slugKollisjoner(sider).length, 0);
  assert.ok(sider.some((side) => side.path === "/ie/dublin/"));
  assert.ok(sider.some((side) => side.path === "/ie/dublin/dublin-city/"));
  assert.ok(sider.some((side) => side.path === "/ie/dublin/blackrock/"));
  assert.ok(sider.some((side) => side.path === "/de/berlin/berlin/sport/"));
  assert.ok(sider.some((side) => side.path === "/gb/england/sutton/may-half-term/"));
  assert.equal(sider.some((side) => side.path.includes("/school-holidays/")), false);
  assert.equal(sider.some((side) => side.land === "IE" && side.indeks), false);
  assert.ok(tellGrupper(leirer.filter((rad) => rad.land === "IE")) < 10);
  const berlin = sider.find((side) => side.path === "/de/berlin/berlin/sport/");
  assert.ok(berlin.antall >= 3);
  assert.equal(berlin.indeks, false);
  assert.equal(SEARCH_CONSOLE_VERIFISERT, false);
  assert.deepEqual(
    sider.filter((side) => side.indeks).map((side) => side.path),
    ["/gb/england/"],
  );
});

test("dublin-city er byen, ikke et postdistrikt", () => {
  assert.equal(sted({ land: "IE", region: "IE-D", by: "Dublin", kommune: "Dublin" }), "dublin-city");
  assert.equal(sted({ land: "IE", region: "IE-D", by: "Blackrock", kommune: "Dún Laoghaire-Rathdown" }), "blackrock");
});

test("GB-køen slipper 150 i pulje 1 og hopper over uverifiserte", () => {
  const plan = gbUke1(puljer);
  const slipp = slippKoe(plan);
  assert.equal(slipp.ute.length, UKES_KVOTE);
  assert.equal(slipp.ute.filter((side) => side.slag === "kalender" || side.slag === "hub").length, UKES_KVOTE);
  assert.equal(slipp.venter[0].path, "/gb/england/thurrock/school-holidays/");
  const utenGsc = slippKoe([
    { slag: "kategori", path: "/de/berlin/berlin/sport/", antall: 9, verifisert: true, land: "DE" },
    { slag: "kalender", path: "/de/bayern/schulferien/", offisiell: true, perioder: 2, verifisert: true, land: "DE" },
  ]);
  assert.deepEqual(utenGsc.ute.map((side) => side.path), ["/de/bayern/schulferien/"]);
});

test("tyske tekster bruker du", () => {
  assert.equal(du(), true);
});

test("sommeruke 24 får side, men ukelisten for teksten er uendret", () => {
  const oslo = skolerute.find((rad) => rad.kommune === "Oslo");
  assert.deepEqual(sommerPeriode(oslo).uker, [25, 26, 27, 28, 29, 30, 31, 32]);
  assert.equal(sommerSideUker(oslo).includes(24), true);
  assert.ok(sommerSideUker(oslo).includes(25));
});
