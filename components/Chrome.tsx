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

export function Header({
  tekst,
  home,
  sesongLenker,
  spraak,
}: {
  tekst: Copy;
  home: string;
  sesongLenker: { href: string; label: string }[];
  spraak: { locale: Locale; href: string; label: string; current: boolean }[];
}) {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <a href={home} className="group">
          <span className="font-serif text-2xl text-pine">WeekSlot</span>
          <span className="ml-3 hidden text-sm text-muted sm:inline">{tekst.tagline}</span>
        </a>
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

export function Footer({ tekst, tipHref, privacyHref, samtykkeTekst }: { tekst: Copy; tipHref: string; privacyHref: string; samtykkeTekst?: string }) {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p>{tekst.trust}</p>
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
