/** Node-hooks for testene: løser «@/…» og leser JSON uten importattributter, så lib/katalog.ts kan lastes direkte. */
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ROT = new URL("../../", import.meta.url).pathname;

export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    const base = `${ROT}${spec.slice(2)}`;
    for (const ending of ["", ".ts", ".tsx", ".mjs"]) {
      const fil = base + ending;
      if (/\.\w+$/.test(fil) && existsSync(fil)) return next(pathToFileURL(fil).href, ctx);
    }
  }
  return next(spec, ctx);
}

export async function load(url, ctx, next) {
  if (url.endsWith(".json")) return next(url, { ...ctx, importAttributes: { type: "json" } });
  return next(url, ctx);
}
