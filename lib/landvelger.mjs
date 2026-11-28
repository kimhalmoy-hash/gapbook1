/** Synlig landvelger. Lenker til forsider, ingen omdirigering og ingen sporingscookie. */

const ANDRE = [
  ["SE", "/se/"],
  ["DE", "/de/"],
  ["AT", "/at/"],
  ["GB", "/gb/"],
  ["IE", "/ie/"],
];

const NAVN = {
  nb: { NO: "Norge", SE: "Sverige", DE: "Tyskland", AT: "Østerrike", GB: "Storbritannia", IE: "Irland" },
  sv: { NO: "Norge", SE: "Sverige", DE: "Tyskland", AT: "Österrike", GB: "Storbritannien", IE: "Irland" },
  de: { NO: "Norwegen", SE: "Schweden", DE: "Deutschland", AT: "Österreich", GB: "Vereinigtes Königreich", IE: "Irland" },
  en: { NO: "Norway", SE: "Sweden", DE: "Germany", AT: "Austria", GB: "United Kingdom", IE: "Ireland" },
};

const OVERSKRIFT = { nb: "Velg land", sv: "Välj land", de: "Land wählen", en: "Choose country" };
const SPRAAK = [
  { kode: "nb", label: "Bokmål" },
  { kode: "sv", label: "Svenska" },
  { kode: "en", label: "English" },
];

export function uiSpraak(kode) {
  if (kode === "de-DE" || kode === "de-AT" || kode === "de") return "de";
  if (kode === "sv-SE" || kode === "sv") return "sv";
  if (kode === "en-GB" || kode === "en-IE" || kode === "en") return "en";
  return "nb";
}

export function landvelger(uiKode, aktivLand, aktivSpraak = "nb") {
  const ui = uiSpraak(uiKode);
  const navn = NAVN[ui];
  const lukketOrd = ui === "en" ? "Country" : "Land";
  const norge = {
    kode: "NO",
    navn: navn.NO,
    lenker: SPRAAK.map((spraak) => ({
      label: spraak.label,
      href: spraak.kode === "sv" ? "/sv/" : spraak.kode === "en" ? "/en/" : "/",
      aktiv: aktivLand === "NO" && aktivSpraak === spraak.kode,
    })),
  };
  const andre = ANDRE.map(([kode, href]) => ({
    kode,
    navn: navn[kode],
    lenker: [{ label: navn[kode], href, aktiv: aktivLand === kode }],
  }));
  const land = [norge, ...andre];
  return {
    overskrift: OVERSKRIFT[ui],
    lukket: `${lukketOrd}: ${navn[aktivLand] || navn.NO}`,
    land,
  };
}
