"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";
import type { Copy } from "@/lib/i18n";

export function SetLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export type LandValg = {
  overskrift: string;
  lukket: string;
  land: { kode: string; navn: string; lenker: { label: string; href: string; aktiv: boolean }[] }[];
};

export function Landvelger({ valg, kompakt = false }: { valg: LandValg; kompakt?: boolean }) {
  const liste = (
    <ul className="grid gap-2 text-sm">
      {valg.land.map((land) => (
        <li key={land.kode}>
          <span className="text-muted">{land.navn}</span>
          <span className="mt-1 flex flex-wrap gap-2">
            {land.lenker.map((lenke) =>
              lenke.aktiv ? (
                <a key={lenke.href} href={lenke.href} aria-current="true" className="rounded-full bg-pine px-3 py-1 text-white">
                  {lenke.label}
                </a>
              ) : (
                <a key={lenke.href} href={lenke.href} className="rounded-full px-3 py-1 hover:bg-paper-2">
                  {lenke.label}
                </a>
              ),
            )}
          </span>
        </li>
      ))}
    </ul>
  );
  if (kompakt) {
    return (
      <details className="relative text-sm">
        <summary className="cursor-pointer list-none rounded-full border border-line px-3 py-1">{valg.lukket}</summary>
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-line bg-card p-3 shadow">{liste}</div>
      </details>
    );
  }
  return (
    <nav aria-label={valg.overskrift} className="mt-6">
      <h2 className="font-medium text-ink">{valg.overskrift}</h2>
      <div className="mt-3">{liste}</div>
    </nav>
  );
}

export function Header({
  tekst,
  home,
  sesongLenker,
  spraak,
  land,
}: {
  tekst: Copy;
  home: string;
  sesongLenker: { href: string; label: string }[];
  spraak: { locale: Locale; href: string; label: string; current: boolean }[];
  land: LandValg;
}) {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <a href={home} className="group">
          <span className="font-serif text-2xl text-pine">WeekSlot</span>
          <span className="ml-3 hidden text-sm text-muted sm:inline">{tekst.tagline}</span>
        </a>
        <div className="flex flex-wrap items-center gap-2">
          <Landvelger valg={land} kompakt />
        <nav aria-label={tekst.switcher} className="flex flex-wrap items-center gap-2 text-sm">
          {spraak.map((s) =>
            s.current ? (
              <span key={s.locale} className="rounded-full bg-pine px-3 py-1 text-white" aria-current="true">
                {s.label}
              </span>
            ) : (
              <a key={s.locale} href={s.href} hrefLang={s.locale} className="rounded-full px-3 py-1 hover:bg-paper-2">
                {s.label}
              </a>
            ),
          )}
        </nav>
        </div>
      </div>
      {sesongLenker.length ? (
        <div className="piller">
          <div className="mx-auto flex w-max gap-2 px-4 pb-3 text-sm">
            {sesongLenker.map((s) => (
              <a key={s.href} href={s.href} className="shrink-0 rounded-full border border-line bg-card px-3 py-1 hover:border-pine">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function Footer({ tekst, tipHref, privacyHref, land, samtykkeTekst }: { tekst: Copy; tipHref: string; privacyHref: string; land: LandValg; samtykkeTekst?: string }) {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <Landvelger valg={land} />
        <p className="mt-6">{tekst.trust}</p>
        <p className="mt-3 flex flex-wrap gap-4">
          <a className="text-pine hover:underline" href={privacyHref}>{tekst.privacyLink}</a>
          {samtykkeTekst ? (
            <a id="samtykkeinnstillinger" className="text-pine hover:underline" href="#samtykkeinnstillinger">{samtykkeTekst}</a>
          ) : null}
          <a className="text-pine hover:underline" href={tipHref}>{tekst.tipCta}</a>
        </p>
      </div>
    </footer>
  );
}
