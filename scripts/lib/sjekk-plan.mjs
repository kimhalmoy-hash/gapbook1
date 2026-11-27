/** Leser sjekk-plan-tabellen. URL-er og sjekkDato beholdes ordrett. */

export function parseSjekkPlan(markdown) {
  const rader = [];
  for (const linje of String(markdown).split(/\r?\n/)) {
    if (!linje.startsWith("|")) continue;
    if (linje.includes("---")) continue;
    const celler = linje.split("|").slice(1, -1).map((c) => c.trim());
    if (celler.length < 8 || celler[0] === "tilbyder") continue;
    const uke = Number(celler[2]);
    rader.push({
      tilbyder: celler[0],
      kommune: celler[1],
      uke: Number.isInteger(uke) ? uke : null,
      status: celler[3],
      kildeUrl: celler[4],
      publiseres: celler[5],
      grunnlag: celler[6].replace(/\*\*/g, ""),
      sjekkDato: celler[7],
    });
  }
  return rader;
}

/** Rader som skal sjekkes på eller før dagen. Tom liste når ingen er forfalt. */
export function forfalte(rader, idag) {
  return rader.filter((rad) => rad.sjekkDato && rad.sjekkDato <= idag);
}
