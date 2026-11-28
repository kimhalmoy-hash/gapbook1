/**
 * Terskler og publiseringskø for bølge 1.
 * Search Console er ikke verifisert, så køen slipper bare ut kalendere og hubber.
 */
import { gruppeNokkel } from "./pure.mjs";

export const TEMA_MIN = 3;
export const UKES_KVOTE = 150;
export const GUL_KVOTE = 75;
export const SEARCH_CONSOLE_VERIFISERT = false;

const SLAG_PRIO = { kalender: 1, hub: 2, by: 3, ferie: 4, kategori: 5, uke: 6 };

export function tellGrupper(leirer) {
  const sett = new Set();
  for (const leir of leirer) {
    if (leir.demo === true || leir.synlig === false) continue;
    if (leir.status !== "verifisert" && leir.status !== "delvis") continue;
    sett.add(gruppeNokkel(leir));
  }
  return sett.size;
}

export function overTerskel(side) {
  if (side.slag === "kalender") return side.offisiell === true && (side.perioder ?? 0) >= 2;
  if (side.puljeHub === true) return true;
  if (side.slag === "hub" && side.niva === "land") return (side.kalendere ?? 0) >= 3 || ((side.kalendere ?? 0) >= 1 && (side.antall ?? 0) >= 10);
  if (side.slag === "hub") return ((side.antall ?? 0) >= 6 && (side.byer ?? 0) >= 2) || (side.kalenderIndeks === true && (side.antall ?? 0) >= 3);
  if (side.slag === "by") return (side.antall ?? 0) >= TEMA_MIN && side.kalenderIndeks === true;
  if (side.slag === "ferie" || side.slag === "kategori") return (side.antall ?? 0) >= TEMA_MIN;
  if (side.slag === "uke") return side.land !== "GB" && side.land !== "IE" && (side.antall ?? 0) >= 5;
  return false;
}

/**
 * Sider over terskel, i prioritert rekkefølge, begrenset av ukekvoten.
 * Uten Search Console slippes bare kalender og hub.
 * Uverifiserte kalendere (verifisert === false) hoppes over.
 */
export function slippKoe(sider, { gsc = SEARCH_CONSOLE_VERIFISERT, kvote = UKES_KVOTE } = {}) {
  const klare = sider.filter((side) => {
    if (side.verifisert === false) return false;
    if (!overTerskel(side)) return false;
    if (!gsc && side.slag !== "kalender" && side.slag !== "hub") return false;
    return true;
  });
  klare.sort(
    (a, b) =>
      (a.pulje ?? 1) - (b.pulje ?? 1) ||
      (SLAG_PRIO[a.slag] ?? 9) - (SLAG_PRIO[b.slag] ?? 9) ||
      (a.rang ?? 9999) - (b.rang ?? 9999) ||
      a.path.localeCompare(b.path),
  );
  return { ute: klare.slice(0, kvote), venter: klare.slice(kvote) };
}

export function gbUke1(puljer) {
  const hubber = [
    { slag: "hub", niva: "land", path: "/gb/", rang: 0, pulje: 1, puljeHub: true, verifisert: true },
    { slag: "hub", path: "/gb/england/", rang: 0, pulje: 1, puljeHub: true, verifisert: true },
    { slag: "hub", path: "/gb/scotland/", rang: 0, pulje: 1, puljeHub: true, verifisert: true },
    { slag: "hub", path: "/gb/wales/", rang: 0, pulje: 1, puljeHub: true, verifisert: true },
    { slag: "hub", path: "/gb/northern-ireland/", rang: 0, pulje: 1, puljeHub: true, verifisert: true },
  ];
  const ni = {
    slag: "kalender",
    path: puljer.nordIrland.path,
    rang: 0,
    offisiell: true,
    perioder: 2,
    verifisert: true,
    pulje: 1,
    land: "GB",
  };
  const councils = puljer.councils.map((rad) => ({
    slag: "kalender",
    path: rad.path,
    rang: rad.rang,
    offisiell: true,
    perioder: 2,
    verifisert: true,
    pulje: rad.rang <= 144 ? 1 : 2,
    land: "GB",
  }));
  return [...hubber, ni, ...councils];
}
