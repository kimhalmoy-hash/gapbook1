import { CampGrid } from "@/components/CampCard";
import { FremhevetSide } from "@/components/FremhevetSide";
import { FilterBar } from "@/components/FilterBar";
import { Footer, Header } from "@/components/Chrome";
import { JsonLd } from "@/components/JsonLd";
import { fyll, type Locale } from "@/lib/i18n";
import { prisVisning } from "@/lib/pure.mjs";
import { jsonLd, mailto, modell, sammeSti, site, type Rute } from "@/lib/katalog";
import { SetLang } from "@/components/Chrome";

export function PageView({ rute }: { rute: Rute }) {
  const side = modell(rute);
  const tekst = side.tekst;
  const spraak = (["nb", "sv", "en"] as Locale[]).map((locale) => ({
    locale,
    href: sammeSti(rute, locale),
    label: tekst.localeName[locale],
    current: locale === rute.locale,
  }));

  return (
    <div lang={tekst.htmlLang}>
      <SetLang locale={tekst.htmlLang} />
      {jsonLd(rute, side).map((blokk, i) => (
        <JsonLd key={i} data={blokk} />
      ))}
      <Header
        tekst={tekst}
        home={side.crumbs[0]?.href || "/"}
        sesongLenker={side.sesongLenker}
        spraak={spraak}
      />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-10">
        {rute.kind === "hjem" ? <Hjem side={side} /> : rute.kind === "fremhevet" ? <FremhevetSide tekst={tekst} /> : <Innhold side={side} />}
      </main>
      <Footer tekst={tekst} tipHref={mailto(tekst.tipSubject)} />
    </div>
  );
}

function Hjem({ side }: { side: ReturnType<typeof modell> }) {
  const tekst = side.tekst;
  const prefix = side.rute.locale === "nb" ? "" : `/${side.rute.locale}`;
  const kommuner = [...new Map(side.leirer.map((c) => [c.kommuneSlug, c.kommune])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1], tekst.htmlLang),
  );
  const typer = [...new Map(side.leirer.map((c) => [c.typeSlug, c.typeLabel])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1], tekst.htmlLang),
  );
  return (
    <>
      <p className="text-xs uppercase tracking-[0.22em] text-clay">{tekst.tagline}</p>
      <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl">{tekst.heroTitle}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">{tekst.heroSub}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#sok" className="rounded-full bg-clay px-6 py-3 text-white hover:bg-clay-dark">{tekst.ctaFind}</a>
        <a href={mailto(tekst.providerSubject)} className="rounded-full border border-pine px-6 py-3 text-pine hover:bg-pine hover:text-white">{tekst.ctaProviderNav}</a>
      </div>
      <section className="mt-12">
        <FilterBar leirer={side.leirer} tekst={tekst} sesonger={side.sesongLenker} />
      </section>
      <section className="mt-16">
        <h2 className="font-serif text-3xl">{tekst.howTitle}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {tekst.steps.map((steg, i) => (
            <li key={steg.t} className="ticket p-5">
              <p className="text-sm text-clay">0{i + 1}</p>
              <p className="mt-2 font-serif text-2xl">{steg.t}</p>
              <p className="mt-2 text-sm text-muted">{steg.d}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-16">
        <h2 className="font-serif text-3xl">{tekst.explore}</h2>
        <h3 className="mt-6 font-serif text-2xl">{tekst.seasonsTitle}</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {side.sesongLenker.map((s) => (
            <a key={s.href} href={s.href} className="ticket p-5 hover:border-pine">
              <p className="font-serif text-2xl">{s.label}</p>
              <p className="mt-2 text-sm text-muted">{s.blurb}</p>
            </a>
          ))}
        </div>
        <h3 className="mt-8 font-serif text-2xl">{tekst.filters.place}</h3>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {kommuner.map(([slug, navn]) => (
            <li key={slug}>
              <a className="rounded-full border border-line bg-card px-3 py-1 hover:border-pine" href={`${prefix}/skoleruta/${slug}/`}>
                {navn}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-serif text-2xl">{tekst.filters.type}</h3>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {typer.map(([slug, navn]) => (
            <li key={slug}>
              <a className="rounded-full border border-line bg-card px-3 py-1 hover:border-pine" href={`${prefix}/${slug === "fotballskole" || slug === "rideleir" || slug === "seilleir" || slug === "idrettsleir" ? slug : `type/${slug}`}/`}>
                {navn}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <Arrangor tekst={tekst} />
      <Tips tekst={tekst} />
    </>
  );
}

function Innhold({ side }: { side: ReturnType<typeof modell> }) {
  const tekst = side.tekst;
  const erDetalj = side.rute.kind === "leir";
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        {side.crumbs.map((c, i) => (
          <span key={`${c.href}-${i}`}>
            {i > 0 ? <span className="mx-2">/</span> : null}
            {i === side.crumbs.length - 1 ? <span>{c.name}</span> : <a className="hover:underline" href={c.href}>{c.name}</a>}
          </span>
        ))}
      </nav>
      <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">{side.h1}</h1>
      {side.kalenderUke || side.skoleruteKort ? (
        <p className="mt-4 max-w-3xl text-lg">
          {side.kalenderUke
            ? side.kalenderUke
            : side.skoleruteKort?.ferier
                .map((f) => `${f.label}: ${f.dato}${f.uke != null ? ` (${fyll(tekst.week, { nr: f.uke })})` : ""}`)
                .join(" · ")}{" "}
          {side.skoleruteKort ? (
            <a className="text-pine hover:underline" href={side.skoleruteKort.kildeUrl} rel="noopener noreferrer">
              {tekst.source}
            </a>
          ) : null}
        </p>
      ) : null}
      {side.ingress ? <p className="mt-4 max-w-2xl text-lg text-muted">{side.ingress}</p> : null}
      {side.skoleruteKort ? (
        <section className="ticket mt-8 p-5">
          <h2 className="font-serif text-2xl">{tekst.holidayHeading}</h2>
          <p className="mt-1 text-sm text-muted">{side.skoleruteKort.skolear}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {side.skoleruteKort.ferier.map((f) => (
              <li key={f.label}>
                <p className="font-medium">{f.href ? <a className="hover:underline" href={f.href}>{f.label}</a> : f.label}</p>
                <p className="text-sm">
                  {f.dato}
                  {f.uke != null ? ` (${fyll(tekst.week, { nr: f.uke })})` : ""}
                </p>
              </li>
            ))}
          </ul>
          {side.skoleruteKort.merknad ? (
            <>
              {/avvik avklart/i.test(side.skoleruteKort.merknad) ? (
                <p className="mt-4 text-sm">{tekst.datesResolved}</p>
              ) : /avvik/i.test(side.skoleruteKort.merknad) ? (
                <p className="mt-4 text-sm">{tekst.ownDates}</p>
              ) : null}
              <span dangerouslySetInnerHTML={{ __html: `<!-- ${side.skoleruteKort.merknad.replace(/--/g, "–")} -->` }} />
            </>
          ) : null}
          <p className="mt-3 text-sm">
            <a className="text-pine hover:underline" href={side.skoleruteKort.kildeUrl} rel="noopener noreferrer">{tekst.source}</a>
          </p>
        </section>
      ) : null}
      {side.ferieListe.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">{side.ferieOverskrift}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {side.ferieListe.map((f) => (
              <li key={`${f.href}-${f.label}`} className="rounded-xl border border-line bg-card px-4 py-3 text-sm">
                <a className="font-medium text-pine hover:underline" href={f.href}>{f.kommune}</a>
                <span className="text-muted">
                  {" "}· {f.label}: {f.dato}
                  {f.uke != null ? ` (${fyll(tekst.week, { nr: f.uke })})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-10">
        {side.leirer.length ? (
          <>
            <CampGrid leirer={side.leirer} tekst={tekst} visNotat={erDetalj} />
            {erDetalj && (side.leirer[0]?.ukerader.length || 0) > 1 ? (
              <div className="mt-8">
                <h2 className="font-serif text-2xl">{tekst.weeksHeading}</h2>
                <ul className="mt-4 grid gap-3">
                  {side.leirer[0].ukerader.map((uke) => (
                    <li key={uke.id} className="ticket min-w-0 p-4 text-sm">
                      <p className="font-medium">
                        {uke.ukeLabel}
                        {uke.datoLabel ? ` · ${uke.datoLabel}` : ""}
                      </p>
                      <p className="mt-1">
                        {(() => {
                          const pris = prisVisning(uke.prisLabel, uke.prisNotat, tekst.priceMissing);
                          return (
                            <>
                              {pris.linje}
                              {pris.notat ? <span className="mt-0.5 block text-muted">{pris.notat}</span> : null}
                            </>
                          );
                        })()}
                      </p>
                      <p className="mt-1">{uke.pameldingLabel}</p>
                      {uke.apnerLabel ? <p>{uke.apnerLabel}</p> : null}
                      {uke.sjekketLabel ? <p className="text-muted">{uke.sjekketLabel}</p> : null}
                      <a className="mt-2 inline-block text-pine hover:underline" href={uke.url} rel="noopener noreferrer">{tekst.sourceLink}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-lg">
            {tekst.empty}{" "}
            <a className="text-clay hover:underline" href={mailto(tekst.tipSubject)}>{tekst.tipCta}</a>
          </p>
        )}
      </section>
      {erDetalj ? null : (
        <>
          <Arrangor tekst={tekst} />
          <Tips tekst={tekst} />
        </>
      )}
    </>
  );
}

function Arrangor({ tekst }: { tekst: ReturnType<typeof modell>["tekst"] }) {
  return (
    <section id="arrangor" className="ticket mt-16 p-6 sm:p-8">
      <h2 className="font-serif text-3xl">{tekst.providerTitle}</h2>
      <p className="mt-3 max-w-2xl text-muted">{tekst.providerBody}</p>
      <p className="mt-3 text-sm">{fyll(tekst.featuredPrice, { pris: site.fremhevetPrisKr })}</p>
      <p className="mt-2 text-sm">
        <a className="text-pine hover:underline" href="/arrangor/fremhevet/">{tekst.featuredLink}</a>
      </p>
      <a href={mailto(tekst.providerSubject)} className="mt-5 inline-block rounded-full bg-pine px-6 py-3 text-white hover:bg-pine-mid">
        {tekst.providerCta}
      </a>
      <p className="mt-3 text-sm text-muted">{tekst.emailLabel}: {site.kontaktEpost}</p>
    </section>
  );
}

function Tips({ tekst }: { tekst: ReturnType<typeof modell>["tekst"] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-3xl">{tekst.tipTitle}</h2>
      <p className="mt-3 max-w-2xl text-muted">{tekst.tipBody}</p>
      <a href={mailto(tekst.tipSubject)} className="mt-4 inline-block text-clay hover:underline">{tekst.tipCta}</a>
    </section>
  );
}
