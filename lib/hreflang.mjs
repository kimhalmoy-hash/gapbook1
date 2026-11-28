/** hreflang-klynger. Bare indekserbare sider, og bare ekte oversettelser av samme side. */

export function klynge(medlemmer) {
  const inne = medlemmer.filter((medlem) => medlem.indeks);
  const nb = inne.find((medlem) => medlem.locale === "nb") || inne[0];
  const ut = new Map();
  for (const medlem of medlemmer) {
    if (!medlem.indeks || !inne.length) {
      ut.set(medlem.locale, {});
      continue;
    }
    const languages = {};
    for (const annen of inne) languages[annen.kode] = annen.url;
    if (nb) languages["x-default"] = nb.url;
    ut.set(medlem.locale, languages);
  }
  return ut;
}

export function gjensidig(klynger) {
  const feil = [];
  for (const [fra, languages] of klynger) {
    for (const [kode, url] of Object.entries(languages)) {
      if (kode === "x-default") continue;
      const maal = [...klynger.values()].find((sett) => Object.values(sett).includes(url) && sett[kode] === url);
      if (!maal) {
        feil.push(`${fra} peker på ${url} uten gjensidig ${kode}`);
        continue;
      }
      if (maal[fra] && maal[fra] !== languages[fra]) {
        feil.push(`${url} peker ikke tilbake på ${fra}`);
      }
    }
  }
  return feil;
}
