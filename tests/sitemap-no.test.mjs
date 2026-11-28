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
});
