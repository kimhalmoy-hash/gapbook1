/** Lager data/sjekk-plan.json fra data/kilder/sjekk-plan.md. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseSjekkPlan } from "./lib/sjekk-plan.mjs";

const rot = path.resolve(import.meta.dirname, "..");
const md = readFileSync(path.join(rot, "data", "kilder", "sjekk-plan.md"), "utf8");
const rader = parseSjekkPlan(md);
if (!rader.length) {
  console.error("sjekk-plan: ingen rader");
  process.exit(1);
}
for (const rad of rader) {
  if (!/^https?:\/\//.test(rad.kildeUrl) || !/^\d{4}-\d{2}-\d{2}$/.test(rad.sjekkDato)) {
    console.error("sjekk-plan: mangler URL eller dato", rad.tilbyder, rad.kommune);
    process.exit(1);
  }
}
writeFileSync(path.join(rot, "data", "sjekk-plan.json"), `${JSON.stringify(rader, null, 2)}\n`);
console.log(`sjekk-plan: ${rader.length} rader`);
