"use client";

import { useMemo, useState } from "react";
import { CampCard } from "@/components/CampCard";
import type { CampView } from "@/lib/katalog";
import type { Copy } from "@/lib/i18n";

export function FilterBar({
  leirer,
  tekst,
  sesonger,
}: {
  leirer: CampView[];
  tekst: Copy;
  sesonger: { href: string; label: string }[];
}) {
  const [uke, setUke] = useState("");
  const [land, setLand] = useState("");
  const [region, setRegion] = useState("");
  const [kommune, setKommune] = useState("");
  const [type, setType] = useState("");
  const [alder, setAlder] = useState("");

  const uker = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) {
      for (const nokkel of camp.uker) {
        const [aar, nr] = nokkel.split("-");
        sett.set(nokkel, `${tekst.week.replace("{nr}", String(Number(nr)))} ${aar}`);
      }
    }
    return [...sett.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [leirer, tekst.week]);

  const landListe = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) if (camp.land) sett.set(camp.land, camp.land);
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, tekst.htmlLang]);

  const regioner = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) {
      if (land && camp.land !== land) continue;
      if (camp.regionSlug) sett.set(camp.regionSlug, camp.regionNavn || camp.regionSlug);
    }
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, land, tekst.htmlLang]);

  const kommuner = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) {
      if (land && camp.land !== land) continue;
      if (region && camp.regionSlug !== region) continue;
      sett.set(camp.kommuneSlug, camp.kommune);
    }
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, land, region, tekst.htmlLang]);

  const typer = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) sett.set(camp.typeSlug, camp.typeLabel);
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, tekst.htmlLang]);

  const vist = leirer.filter((camp) => {
    if (uke && !camp.uker.includes(uke)) return false;
    if (land && camp.land !== land) return false;
    if (region && camp.regionSlug !== region) return false;
    if (kommune && camp.kommuneSlug !== kommune) return false;
    if (type && camp.typeSlug !== type) return false;
    if (alder) {
      const a = Number(alder);
      const treff = camp.aldre.some((rad) => {
        if (rad.fra == null && rad.til == null) return false;
        if (rad.fra != null && a < rad.fra) return false;
        if (rad.til != null && a > rad.til) return false;
        return true;
      });
      if (!treff) return false;
    }
    return true;
  });

  const filtrert = Boolean(uke || land || region || kommune || type || alder);

  return (
    <div id="sok">
      {!filtrert ? <SesongUtvalg leirer={leirer} tekst={tekst} sesonger={sesonger} /> : null}
      <form className={`grid min-w-0 gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 ${filtrert ? "" : "mt-12"}`} onSubmit={(e) => e.preventDefault()}>
        <label className="grid min-w-0 gap-1 text-sm">
          <span className="font-medium">{tekst.filters.week}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={uke} onChange={(e) => setUke(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {uker.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.country}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={land} onChange={(e) => { setLand(e.target.value); setRegion(""); setKommune(""); }}>
            <option value="">{tekst.filters.all}</option>
            {landListe.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.region}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={region} onChange={(e) => { setRegion(e.target.value); setKommune(""); }}>
            <option value="">{tekst.filters.all}</option>
            {regioner.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.place}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={kommune} onChange={(e) => setKommune(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {kommuner.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.type}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {typer.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.age}</span>
          <select className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2" value={alder} onChange={(e) => setAlder(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {Array.from({ length: 15 }, (_, i) => i + 5).map((aar) => (
              <option key={aar} value={aar}>{aar}</option>
            ))}
          </select>
        </label>
      </form>
      <p className="mt-4 text-sm text-muted">{tekst.filters.count.replace("{n}", String(vist.length))}</p>
      {filtrert ? (
        vist.length ? (
          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vist.slice(0, 12).map((camp) => (
              <CampCard key={camp.id} camp={camp} tekst={tekst} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-lg">{tekst.empty}</p>
        )
      ) : null}
    </div>
  );
}

function SesongUtvalg({
  leirer,
  tekst,
  sesonger,
}: {
  leirer: CampView[];
  tekst: Copy;
  sesonger: { href: string; label: string }[];
}) {
  return (
    <div className="grid gap-10">
      {sesonger.map((sesong) => {
        const nokkel = sesong.href.includes("vinterferie")
          ? "vinter"
          : sesong.href.includes("sommerleir")
            ? "sommer"
            : sesong.href.includes("hostferie")
              ? "host"
              : "paske";
        const valgt = leirer
          .filter((camp) => camp.sesonger.some((s) => s.startsWith(nokkel)))
          .sort((a, b) => (a.status === b.status ? 0 : a.status === "verifisert" ? -1 : b.status === "verifisert" ? 1 : a.status === "delvis" ? -1 : 1))
          .slice(0, 4);
        if (!valgt.length) return null;
        return (
          <section key={sesong.href}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-3xl">{sesong.label}</h2>
              <a className="text-sm font-semibold text-clay hover:underline" href={sesong.href}>{tekst.seeAll}</a>
            </div>
            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {valgt.map((camp) => (
                <CampCard key={camp.id} camp={camp} tekst={tekst} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
