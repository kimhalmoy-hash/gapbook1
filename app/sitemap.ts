import type { MetadataRoute } from "next";
import { absolut, alleRuter, indekserbar, sammeSti, sistEndret } from "@/lib/katalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return alleRuter()
    .filter((rute) => indekserbar(rute))
    .map((rute) => ({
      url: absolut(sammeSti(rute, rute.locale)),
      lastModified: sistEndret(rute),
    }));
}
