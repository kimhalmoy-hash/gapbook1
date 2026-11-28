import { readFileSync } from "node:fs";
import path from "node:path";
import { parseGuide } from "@/lib/guide.mjs";
import type { Guide } from "@/lib/guide.mjs";

/** Sesongguider (nb) som utvider hubbene /vinterferie/ og /sommerleir/. Bare serversiden. */
const FILER = { vinter: "vinterferie-nb.md", sommer: "sommerleir-nb.md" } as const;
const cache = new Map<string, Guide>();

export function guideFor(rute: { kind: string; locale: string; navn?: string; aar?: number }): Guide | null {
  if (rute.kind !== "sesong" || rute.locale !== "nb") return null;
  const fil = FILER[rute.navn as keyof typeof FILER];
  if (!fil) return null;
  let guide = cache.get(fil);
  if (!guide) {
    guide = parseGuide(readFileSync(path.join(process.cwd(), "data", "guide-2027", fil), "utf8"));
    cache.set(fil, guide);
  }
  // Guiden gjelder ett år. Når hubben bytter år, faller siden tilbake til vanlig tekst.
  return guide.meta.aar === rute.aar ? guide : null;
}
