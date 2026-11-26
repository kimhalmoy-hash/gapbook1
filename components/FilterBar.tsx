"use client";

import { useMemo, useState } from "react";
import { CampCard } from "@/components/CampCard";
import type { CampView } from "@/lib/katalog";
import type { Copy } from "@/lib/i18n";

export function FilterBar({ leirer, tekst }: { leirer: CampView[]; tekst: Copy }) {
  const [uke, setUke] = useState("");
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

  const kommuner = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) sett.set(camp.kommuneSlug, camp.kommune);
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, tekst.htmlLang]);

  const typer = useMemo(() => {
    const sett = new Map<string, string>();
    for (const camp of leirer) sett.set(camp.typeSlug, camp.typeLabel);
    return [...sett.entries()].sort((a, b) => a[1].localeCompare(b[1], tekst.htmlLang));
  }, [leirer, tekst.htmlLang]);

  const vist = leirer.filter((camp) => {
    if (uke && !camp.uker.includes(uke)) return false;
    if (kommune && camp.kommuneSlug !== kommune) return false;
    if (type && camp.typeSlug !== type) return false;
    if (alder) {
      const a = Number(alder);
      if (camp.alderFra == null && camp.alderTil == null) return false;
      if (camp.alderFra != null && a < camp.alderFra) return false;
      if (camp.alderTil != null && a > camp.alderTil) return false;
    }
    return true;
  });

  return (
    <div id="sok">
      <form className="grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.week}</span>
          <select className="rounded-lg border border-line bg-white px-3 py-2" value={uke} onChange={(e) => setUke(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {uker.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.place}</span>
          <select className="rounded-lg border border-line bg-white px-3 py-2" value={kommune} onChange={(e) => setKommune(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {kommuner.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.type}</span>
          <select className="rounded-lg border border-line bg-white px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {typer.map(([nokkel, label]) => (
              <option key={nokkel} value={nokkel}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tekst.filters.age}</span>
          <select className="rounded-lg border border-line bg-white px-3 py-2" value={alder} onChange={(e) => setAlder(e.target.value)}>
            <option value="">{tekst.filters.all}</option>
            {Array.from({ length: 15 }, (_, i) => i + 5).map((aar) => (
              <option key={aar} value={aar}>{aar}</option>
            ))}
          </select>
        </label>
      </form>
      <p className="mt-4 text-sm text-muted">{tekst.filters.count.replace("{n}", String(vist.length))}</p>
      {vist.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vist.map((camp) => (
            <CampCard key={camp.id} camp={camp} tekst={tekst} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-lg">{tekst.empty}</p>
      )}
    </div>
  );
}
