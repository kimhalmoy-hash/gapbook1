/** 301 fra gamle uke-id-er til den ene tilbudssiden. Kjør etter at leirer.json er byttet. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { grupperLeirer, medSlug, synlig } from "../lib/pure.mjs";

const rot = path.resolve(import.meta.dirname, "..");
const iDag = new Date().toISOString().slice(0, 10);
const leirer = JSON.parse(readFileSync(path.join(rot, "data", "leirer.json"), "utf8"));
const vercelPath = path.join(rot, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const grupper = medSlug(grupperLeirer(leirer));
const leir = [];
for (const g of grupper) {
  if (!g.medlemmer.some((e) => synlig(e, iDag))) continue;
  for (const e of g.medlemmer) {
    if (e.id === g.slug) continue;
    for (const prefix of ["", "/sv", "/en"]) {
      leir.push({
        source: `${prefix}/leir/${e.id}`,
        destination: `${prefix}/leir/${g.slug}`,
        permanent: true,
      });
    }
  }
}
const andre = (vercel.redirects || []).filter((r) => !String(r.source).includes("/leir/"));
vercel.redirects = [...andre, ...leir];
writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`redirects: ${leir.length} leir-redirects, ${andre.length} andre`);
