import type { Copy } from "@/lib/i18n";
import { ENHET_IDER, ETIKETTER, PLASS_FORMAT, adsenseAktiv } from "@/lib/annonser.mjs";

/**
 * Fast annonseplass. Tegnes bare når AdSense-bryteren er PÅ og siden har lov til plassen.
 * Bryter AV: returnerer null, så HTML-en har verken plass, ramme eller annonseinnhold.
 * Bryter PÅ: fast høyde (CSS .annonse-h / .annonse-r), merket med «Annonse». Selve annonsen hentes først
 * av AnnonseStyring etter samtykke. Boksen er tom til da (og ved avslag), og høyden endres aldri.
 */
export function AnnonsePlass({ navn, plasser, tekst }: { navn: string; plasser: string[]; tekst: Copy }) {
  if (!adsenseAktiv() || !plasser.includes(navn)) return null;
  const format = PLASS_FORMAT[navn];
  if (!format) return null;
  const etikett = ETIKETTER[tekst.htmlLang as keyof typeof ETIKETTER]?.annonse ?? ETIKETTER.nb.annonse;
  return (
    <aside
      className={`annonse ${format === "H" ? "annonse-h" : "annonse-r"}`}
      aria-label={etikett}
      data-annonse-plass={navn}
      data-annonse-format={format}
      data-annonse-enhet={ENHET_IDER[format]}
      data-nosnippet
    >
      <p className="annonse-merke">{etikett}</p>
      <div className="annonse-flate" />
    </aside>
  );
}
