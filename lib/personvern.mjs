// Personvernsidene (nb/sv/en). Teksten ligger ordrett i data/personvern/<locale>.md og vises uendret.
// Parseren kan bare det filene bruker: overskrifter (#, ##, ###), avsnitt, harde linjeskift (to mellomrom),
// punktlister (- ), **fet** og [tekst](lenke). Resultatet er data, ikke HTML.
import { readFileSync } from "node:fs";
import path from "node:path";

export const PERSONVERN_LOKALER = ["nb", "sv", "en"];
export const SAMTYKKE_ANKER = "#samtykkeinnstillinger";

/** Den svenske teksten skriver ankeret med én k for lite. Alle varianter peker til samme anker. */
const ANKER_VARIANTER = new Set(["#samtykkeinnstillinger", "#samtyckeinnstillinger", "#samtyckesinstallningar"]);

export function lesPersonvernMd(locale, rot = process.cwd()) {
  if (!PERSONVERN_LOKALER.includes(locale)) throw new Error(`ukjent språk: ${locale}`);
  return readFileSync(path.join(rot, "data", "personvern", `${locale}.md`), "utf8");
}

export function parseInline(tekst) {
  const deler = tekst.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).filter((d) => d !== "");
  return deler.map((del) => {
    const fet = del.match(/^\*\*([^*]+)\*\*$/);
    if (fet) return { type: "strong", text: fet[1] };
    const lenke = del.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (lenke) {
      const href = ANKER_VARIANTER.has(lenke[2]) ? SAMTYKKE_ANKER : lenke[2];
      return { type: "a", text: lenke[1], href };
    }
    return { type: "text", text: del };
  });
}

export function parsePersonvern(md) {
  const blokker = [];
  const linjer = md.replace(/\r\n/g, "\n").split("\n");
  let avsnitt = null;
  let liste = null;
  const lukk = () => {
    if (avsnitt) {
      const inline = [];
      avsnitt.forEach((linje, i) => {
        inline.push(...parseInline(linje.trim()));
        if (i === avsnitt.length - 1) return;
        // Hardt linjeskift når linjen slutter på to mellomrom, ellers vanlig mellomrom.
        inline.push(/ {2,}$/.test(linje) ? { type: "br" } : { type: "text", text: " " });
      });
      blokker.push({ type: "p", inline });
    }
    if (liste) blokker.push({ type: "ul", items: liste.map(parseInline) });
    avsnitt = null;
    liste = null;
  };
  for (const raa of linjer) {
    if (raa.trim() === "") {
      lukk();
      continue;
    }
    const overskrift = raa.match(/^(#{1,3}) (.+)$/);
    if (overskrift) {
      lukk();
      blokker.push({ type: `h${overskrift[1].length}`, inline: parseInline(overskrift[2].trim()) });
      continue;
    }
    const punkt = raa.match(/^- (.+)$/);
    if (punkt) {
      if (avsnitt) lukk();
      (liste ||= []).push(punkt[1].trim());
      continue;
    }
    if (liste) lukk();
    (avsnitt ||= []).push(raa);
  }
  lukk();
  return blokker;
}

export function inlineTekst(inline) {
  return inline.map((d) => (d.type === "br" ? "\n" : d.text)).join("");
}

/** Ren tekst per blokk, brukt til tester og beskrivelse. */
export function blokkTekst(blokk) {
  if (blokk.type === "p") return inlineTekst(blokk.inline);
  if (blokk.type === "ul") return blokk.items.map(inlineTekst).join("\n");
  return inlineTekst(blokk.inline);
}

/** Første avsnitt, til meta description. */
export function personvernBeskrivelse(locale, rot = process.cwd()) {
  const blokker = parsePersonvern(lesPersonvernMd(locale, rot));
  const forste = blokker.find((b) => b.type === "p");
  return forste ? blokkTekst(forste) : "";
}
