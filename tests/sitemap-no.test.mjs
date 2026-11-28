import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function lesListe(url) {
  return readFileSync(url, "utf8").trim().split("\n").filter(Boolean);
}

test("norske URL-er fra main finnes fortsatt", () => {
  const main = lesListe(new URL("./fixtures/sitemap-main.txt", import.meta.url));
  assert.ok(main.includes("/sommerleir/oslo/"));
  assert.ok(main.includes("/vinterferie/oslo/"));
  assert.ok(main.includes("/sv/sommerleir/oslo/"));
  assert.ok(main.includes("/en/sommerleir/oslo/"));
  assert.equal(main.some((sti) => sti.startsWith("/no/")), false);
  const ut = new URL("../out/sitemap.xml", import.meta.url);
  if (!existsSync(ut)) return;
  const xml = readFileSync(ut, "utf8");
  const naa = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((treff) => new URL(treff[1]).pathname));
  const borte = main.filter((sti) => !naa.has(sti));
  assert.deepEqual(borte, []);
  const ekstra = [...naa].filter((sti) => !main.includes(sti)).sort();
  assert.equal(ekstra.some((sti) => sti.startsWith("/ie/")), false);
  assert.equal(naa.has("/sommerleir/uke-24/"), false);
  assert.equal(naa.has("/sv/sommerleir/uke-24/"), false);
  assert.equal(naa.has("/en/sommerleir/uke-24/"), false);
  for (const sti of ["/sommerleir/uke-24/", "/sv/sommerleir/uke-24/", "/en/sommerleir/uke-24/"]) {
    const fil = new URL(`../out${sti}index.html`, import.meta.url);
    assert.equal(existsSync(fil), true, sti);
    assert.match(readFileSync(fil, "utf8"), /noindex,\s*follow/);
  }
  assert.ok(
    ekstra.every(
      (sti) => /^\/no\/[a-z0-9]+(?:-[a-z0-9]+)*\/school-holidays\/$/.test(sti) || sti === "/gb/england/",
    ),
  );
});
