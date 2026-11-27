import { fyll, type Copy } from "@/lib/i18n";

export function fremhevetFaq(tekst: Copy, epost: string) {
  return tekst.featuredFaq.map((rad) => ({
    q: rad.q,
    a: fyll(rad.a, { epost }),
  }));
}
