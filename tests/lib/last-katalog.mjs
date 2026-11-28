import { register } from "node:module";

/** Laster lib/katalog.ts slik Next bygger den (alleRuter, indekserbar, modell, metadataFor, jsonLd). Krever Node 22.18 eller nyere. */
register(new URL("./ts-hooks.mjs", import.meta.url));
process.chdir(new URL("../../", import.meta.url).pathname);
export const katalog = await import("../../lib/katalog.ts");
export const guideData = await import("../../lib/guide-data.ts");
export const i18n = await import("../../lib/i18n.ts");
