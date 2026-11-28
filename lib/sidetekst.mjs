/** Sidetekster for bølge 1. Tysk bruker «du». Lengde: title ≤ 60, description ≤ 155. */
import { kutt } from "./slug-tabell.mjs";

const TEKST = {
  "sv-SE": {
    landH1: "Veckokurser och läger för barn, lov för lov",
    landInn: "Sportlov, påsklov, sommarlov och höstlov. Välj län för att se när lovet är och vilka veckokurser och läger som är inlagda där ni bor.",
    regionH1: "Veckokurser och läger för barn i {region}",
    regionInn: "Här samlar vi veckokurser och läger för barn i {region}, sorterade efter ort och lov.",
    byH1: "Veckokurser och läger för barn i {by}",
    byInn: "Här ser du veckokurser och läger för barn i {by} med omnejd, vecka för vecka. Jämför ålder, tider och pris, och anmäl hos arrangören.",
    katH1: "{kategori} i {by}: veckokurser och läger",
    ferieH1: "{ferie} {år} i {by}: veckokurser och läger",
    ukeH1: "Vecka {nr} i {by}",
    tynn: "Vi har inte lagt in så mycket i {sted} ännu.",
    landTitle: "Lovaktiviteter och läger för barn i Sverige | WeekSlot",
    byTitle: "Läger och lovaktiviteter i {by} | WeekSlot",
    desc: "Veckokurser och läger för barn i {sted}, vecka för vecka. Jämför ålder och tider, och anmäl hos arrangören.",
  },
  "de-DE": {
    landH1: "Feriencamps für Kinder, Woche für Woche",
    landInn: "Osterferien, Sommerferien, Herbstferien: Jedes Bundesland hat eigene Termine. Wähle dein Bundesland, sieh die Ferienwochen und finde Feriencamps und Ferienbetreuung in deiner Stadt.",
    regionH1: "Feriencamps und Kurse in {region}",
    regionInn: "Feriencamps und Ferienbetreuung für Kinder in {region}, sortiert nach Stadt und Ferienwoche. Melde dich direkt beim Veranstalter an.",
    byH1: "Feriencamps und Kurse für Kinder in {by}",
    byInn: "Feriencamps und Ferienbetreuung für Kinder in {by}, sortiert nach Ferienwoche. Alter, Zeiten und Preise vergleichen, direkt beim Veranstalter anmelden.",
    katH1: "{kategori} in {by}",
    ferieH1: "{ferie} {år} in {by}: Camps und Kurse",
    ukeH1: "KW {nr} in {by}",
    tynn: "In {sted} ist noch nicht viel eingetragen. Kennst du einen Veranstalter? Schreib uns.",
    landTitle: "Feriencamps und Ferienbetreuung in Deutschland | WeekSlot",
    byTitle: "Feriencamps für Kinder in {by} | WeekSlot",
    desc: "Feriencamps und Ferienbetreuung für Kinder in {sted}, sortiert nach Ferienwoche. Alter, Zeiten und Preise vergleichen, direkt beim Veranstalter anmelden.",
  },
  "de-AT": {
    landH1: "Feriencamps für Kinder, Woche für Woche",
    landInn: "Semesterferien, Osterferien, Sommerferien, Herbstferien. Wähle dein Bundesland, sieh die Ferientermine und finde Feriencamps und Sommerbetreuung in deiner Nähe.",
    regionH1: "Feriencamps und Kurse in {region}",
    regionInn: "Feriencamps und Sommerbetreuung für Kinder in {region}. Sieh die Ferientermine und melde dein Kind direkt beim Veranstalter an.",
    byH1: "Feriencamps und Kurse für Kinder in {by}",
    byInn: "Feriencamps und Sommerbetreuung für Kinder in {by}, sortiert nach Ferienwoche. Alter und Zeiten vergleichen, direkt beim Veranstalter anmelden.",
    katH1: "{kategori} in {by}",
    ferieH1: "{ferie} {år} in {by}: Camps und Kurse",
    ukeH1: "KW {nr} in {by}",
    tynn: "In {sted} ist noch nicht viel eingetragen. Kennst du einen Veranstalter? Schreib uns.",
    landTitle: "Feriencamps und Ferienbetreuung in Österreich | WeekSlot",
    byTitle: "Feriencamp und Sommercamp in {by} | WeekSlot",
    desc: "Feriencamps und Sommerbetreuung für Kinder in {sted}, sortiert nach Ferienwoche. Alter und Zeiten vergleichen, direkt beim Veranstalter anmelden.",
  },
  "en-GB": {
    landH1: "Holiday clubs and camps for kids, week by week",
    landInn: "Half term, Easter and the long summer break. Dates differ from council to council, so start with yours. Then see holiday clubs and camps listed in your town.",
    regionH1: "Holiday clubs and school holidays in {region}",
    regionInn: "In {region}, each council sets its own school holidays. Find yours, then see holiday clubs and camps listed nearby.",
    byH1: "Holiday clubs and camps for kids in {by}",
    byInn: "Holiday clubs and week-long camps for kids in and around {by}, week by week. Compare ages, times and prices, then book with the organiser.",
    katH1: "{kategori} in {by}",
    ferieH1: "{ferie} activities in {by}",
    ukeH1: "Week {nr} in {by}",
    tynn: "Not much listed in {sted} yet. Know an organiser? Send us a tip.",
    landTitle: "Holiday clubs and camps for kids in the UK | WeekSlot",
    byTitle: "Holiday clubs in {by}: camps for kids by week | WeekSlot",
    desc: "Holiday clubs and camps for kids in {sted}, sorted by school holiday. Check ages, times and prices, then book directly with the organiser.",
  },
  "en-IE": {
    landH1: "Summer camps and mid-term camps for kids, week by week",
    landInn: "Mid-term in October and February, Easter and the summer holidays. Pick your county to see camps listed near you, sorted by week.",
    regionH1: "Summer camps and mid-term camps in {region}",
    regionInn: "Week-long camps for kids in {region}, sorted by town and school holiday. Check the dates, then pick your town.",
    byH1: "Camps for kids in {by}",
    byInn: "See summer camps, mid-term camps and Easter camps listed in and around {by}, then book directly with the organiser.",
    katH1: "{kategori} in {by}",
    ferieH1: "{ferie} camps in {by}",
    ukeH1: "Week {nr} in {by}",
    tynn: "Not much listed in {sted} yet. Know an organiser? Send us a tip.",
    landTitle: "Summer camps and mid-term camps in Ireland | WeekSlot",
    byTitle: "Summer camps in {by} | WeekSlot",
    desc: "Summer camps and mid-term camps for kids in {sted}, sorted by week. Check ages and times, then book directly with the organiser.",
  },
};

function fyll(mal, verdier) {
  return String(mal).replace(/\{(\w+)\}/g, (_, nokkel) => verdier[nokkel] ?? "");
}

export function tekstFor(maal, slag, verdier) {
  const mal = TEKST[maal] || TEKST["en-GB"];
  const sted = verdier.by || verdier.region || verdier.land || "";
  const felt = { ...verdier, sted };
  let h1 = mal.landH1;
  let ingress = mal.landInn;
  let title = mal.landTitle;
  if (slag === "hub" && verdier.niva !== "land") {
    h1 = fyll(mal.regionH1, felt);
    ingress = fyll(mal.regionInn, felt);
    title = fyll(mal.byTitle, { ...felt, by: verdier.region });
  } else if (slag === "by") {
    h1 = fyll(mal.byH1, felt);
    ingress = fyll(mal.byInn, felt);
    title = fyll(mal.byTitle, felt);
  } else if (slag === "kategori") {
    h1 = fyll(mal.katH1, felt);
    ingress = fyll(mal.byInn, felt);
    title = kutt(`${h1} | WeekSlot`, 60);
  } else if (slag === "ferie") {
    h1 = fyll(mal.ferieH1, felt);
    ingress = fyll(mal.byInn, felt);
    title = kutt(`${h1} | WeekSlot`, 60);
  } else if (slag === "uke") {
    h1 = fyll(mal.ukeH1, felt);
    ingress = fyll(mal.byInn, felt);
    title = kutt(`${h1} | WeekSlot`, 60);
  }
  if (!verdier.antall) ingress = fyll(mal.tynn, felt);
  else {
    const tall = {
      "sv-SE": `${verdier.antall} erbjudanden är inlagda.`,
      "de-DE": `${verdier.antall} Angebote sind eingetragen.`,
      "de-AT": `${verdier.antall} Angebote sind eingetragen.`,
      "en-GB": `${verdier.antall} listings are in.`,
      "en-IE": `${verdier.antall} listings are in.`,
    }[maal];
    if (tall) ingress = `${ingress} ${tall}`;
  }
  return {
    h1,
    ingress,
    title: kutt(title, 60),
    description: kutt(fyll(mal.desc, felt), 155),
  };
}

export function tyskErDu() {
  const de = `${TEKST["de-DE"].landInn} ${TEKST["de-AT"].landInn} ${TEKST["de-DE"].tynn}`;
  return !/\bSie\b|\bIhnen\b|\bIhr\b/.test(de) && /\bdu\b|\bdein/i.test(de);
}
