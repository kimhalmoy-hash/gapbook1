/**
 * Sesongguide (nb) for /vinterferie/ og /sommerleir/.
 * Teksten ligger i data/guide-2027/*.md (Markdown-delmengde). Ren logikk her, uten Next-avhengigheter, så den kan testes.
 */

export const FAQ_OVERSKRIFT = "Ofte stilte spørsmål";

/** Deler en linje i tekst, fet tekst og lenker. */
export function inline(tekst) {
  const deler = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let sist = 0;
  let m;
  while ((m = re.exec(tekst))) {
    if (m.index > sist) deler.push({ t: "tekst", tekst: tekst.slice(sist, m.index) });
    if (m[1] !== undefined) deler.push({ t: "tekst", tekst: m[1], fet: true });
    else deler.push({ t: "lenke", tekst: m[2], href: m[3] });
    sist = m.index + m[0].length;
  }
  if (sist < tekst.length) deler.push({ t: "tekst", tekst: tekst.slice(sist) });
  return deler;
}

/** Ren tekst slik den står synlig på siden. Lenker blir bare lenketeksten. */
export function inlineTekst(deler) {
  return deler.map((d) => d.tekst).join("");
}

function celler(linje) {
  return linje
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error("Guiden mangler frontmatter");
  const meta = {};
  for (const linje of m[1].split("\n")) {
    const i = linje.indexOf(":");
    if (i < 1) throw new Error(`Ugyldig frontmatter-linje: ${linje}`);
    meta[linje.slice(0, i).trim()] = linje.slice(i + 1).trim();
  }
  for (const nokkel of ["aar", "h1", "tittel", "beskrivelse"]) {
    if (!meta[nokkel]) throw new Error(`Frontmatter mangler ${nokkel}`);
  }
  return { meta: { ...meta, aar: Number(meta.aar) }, rest: md.slice(m[0].length) };
}

export function parseGuide(md) {
  const { meta, rest } = frontmatter(md.replace(/\r\n/g, "\n"));
  const linjer = rest.split("\n");
  const blokker = [];
  let i = 0;
  while (i < linjer.length) {
    const linje = linjer[i];
    if (!linje.trim()) {
      i++;
      continue;
    }
    const h = linje.match(/^(##|###) (.+)$/);
    if (h) {
      blokker.push({ type: h[1] === "##" ? "h2" : "h3", tekst: h[2].trim() });
      i++;
      continue;
    }
    if (linje.startsWith("|")) {
      const rader = [];
      while (i < linjer.length && linjer[i].startsWith("|")) rader.push(linjer[i++]);
      const [hode, skille, ...kropp] = rader;
      const justering = celler(skille).map((c) => (c.endsWith(":") ? "hoyre" : "venstre"));
      blokker.push({
        type: "tabell",
        hode: celler(hode).map(inline),
        justering,
        rader: kropp.map((r) => celler(r).map(inline)),
      });
      continue;
    }
    if (/^- /.test(linje)) {
      const punkter = [];
      while (i < linjer.length && /^- /.test(linjer[i])) punkter.push(inline(linjer[i++].slice(2).trim()));
      blokker.push({ type: "ul", punkter });
      continue;
    }
    if (/^\d+\. /.test(linje)) {
      const punkter = [];
      while (i < linjer.length && /^\d+\. /.test(linjer[i])) punkter.push(inline(linjer[i++].replace(/^\d+\. /, "").trim()));
      blokker.push({ type: "ol", punkter });
      continue;
    }
    const avsnitt = [];
    while (i < linjer.length && linjer[i].trim() && !/^(##|###) |^\||^- |^\d+\. /.test(linjer[i])) avsnitt.push(linjer[i++].trim());
    blokker.push({ type: "p", deler: inline(avsnitt.join(" ")) });
  }
  return { meta, blokker, faq: faqFra(blokker) };
}

/** FAQ = h3-spørsmål med ett avsnitt som svar, under overskriften «Ofte stilte spørsmål». */
export function faqFra(blokker) {
  const start = blokker.findIndex((b) => b.type === "h2" && b.tekst === FAQ_OVERSKRIFT);
  if (start < 0) return [];
  const faq = [];
  let i = start + 1;
  while (i < blokker.length && blokker[i].type !== "h2") {
    const q = blokker[i];
    if (q.type !== "h3") throw new Error(`FAQ: forventet spørsmål (###), fant ${q.type}`);
    const svar = [];
    i++;
    while (i < blokker.length && blokker[i].type !== "h3" && blokker[i].type !== "h2") svar.push(blokker[i++]);
    if (svar.length !== 1 || svar[0].type !== "p") throw new Error(`FAQ: «${q.tekst}» må ha nøyaktig ett avsnitt som svar`);
    faq.push({ q: q.tekst, a: inlineTekst(svar[0].deler) });
  }
  return faq;
}

function alleInline(blokker) {
  const ut = [];
  for (const b of blokker) {
    if (b.type === "p") ut.push(b.deler);
    else if (b.type === "ul" || b.type === "ol") ut.push(...b.punkter);
    else if (b.type === "tabell") ut.push(...b.hode, ...b.rader.flat());
  }
  return ut;
}

/** Alle lenker i guiden. Interne starter med «/». */
export function guideLenker(blokker) {
  return alleInline(blokker)
    .flat()
    .filter((d) => d.t === "lenke")
    .map((d) => d.href);
}

export function erIntern(href) {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Fjerner interne lenker uten indekserbar side. Lenketeksten blir stående som vanlig tekst,
 * men et listepunkt som bare er en slik lenke, og overskrifter uten innhold, tas bort.
 */
export function tilpassLenker(blokker, harSide) {
  const fiks = (deler) => deler.map((d) => (d.t === "lenke" && erIntern(d.href) && !harSide(d.href) ? { t: "tekst", tekst: d.tekst } : d));
  const rensPunkter = (punkter) =>
    punkter
      .map((deler) => ({ deler, ny: fiks(deler) }))
      .filter(({ deler, ny }) => !(deler.length === 1 && deler[0].t === "lenke" && ny[0].t !== "lenke"))
      .map(({ ny }) => ny);
  const ut = [];
  for (const b of blokker) {
    if (b.type === "p") ut.push({ ...b, deler: fiks(b.deler) });
    else if (b.type === "ul" || b.type === "ol") {
      const punkter = rensPunkter(b.punkter);
      if (punkter.length) ut.push({ ...b, punkter });
    } else if (b.type === "tabell") {
      ut.push({ ...b, hode: b.hode.map(fiks), rader: b.rader.map((r) => r.map(fiks)) });
    } else ut.push(b);
  }
  // Overskrift uten innhold før neste overskrift på samme eller høyere nivå fjernes.
  const nivaa = (b) => (b.type === "h2" ? 2 : b.type === "h3" ? 3 : 9);
  return ut.filter((b, i) => {
    if (nivaa(b) === 9) return true;
    for (let j = i + 1; j < ut.length; j++) {
      if (nivaa(ut[j]) <= nivaa(b)) return false;
      if (nivaa(ut[j]) === 9) return true;
    }
    return false;
  });
}
