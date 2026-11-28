import type { CampView } from "@/lib/katalog";
import type { Copy } from "@/lib/i18n";
import { prisVisning } from "@/lib/pure.mjs";

function kommentar(tekst: string) {
  return `<!-- ${tekst.replace(/--/g, "–")} -->`;
}

export function CampCard({ camp, tekst }: { camp: CampView; tekst: Copy; visNotat?: boolean }) {
  const pris = prisVisning(camp.prisLabel, camp.prisNotat, tekst.priceMissing);
  return (
    <article id={camp.id} className="ticket flex h-full min-w-0 flex-col p-5">
      <div className="flex flex-wrap gap-2">
        {camp.demo ? (
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">{tekst.example}</span>
        ) : null}
        {camp.ferieBadge ? (
          <span className="rounded-full bg-pine px-2.5 py-0.5 text-xs font-semibold text-white">{camp.ferieBadge}</span>
        ) : null}
        {camp.gratis ? (
          <span className="rounded-full bg-ok px-2.5 py-0.5 text-xs font-semibold text-white">{tekst.gratis}</span>
        ) : null}
        {camp.statusLabel ? (
          <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-semibold text-ink">{camp.statusLabel}</span>
        ) : null}
      </div>
      <h2 className="mt-3 font-serif text-2xl leading-tight">
        <a href={camp.href} className="hover:text-clay">
          {camp.tittel}
        </a>
      </h2>
      <p className="mt-1 text-sm text-muted">
        {camp.tilbyderUrl && camp.tilbyderUrl !== camp.url ? (
          <a className="text-pine hover:underline" href={camp.tilbyderUrl} rel="noopener noreferrer">{camp.tilbyder}</a>
        ) : (
          camp.tilbyder
        )}
      </p>
      <dl className="mt-4 grid gap-1 text-sm">
        <div>
          <dt className="sr-only">Uke</dt>
          <dd>{camp.ukeLabel}{camp.datoLabel ? ` · ${camp.datoLabel}` : ""}</dd>
        </div>
        <div>
          <dt className="sr-only">Sted</dt>
          <dd>{camp.sted}</dd>
        </div>
        <div>
          <dt className="sr-only">Type</dt>
          <dd>{camp.typeLabel}</dd>
        </div>
        <div>
          <dt className="sr-only">Alder</dt>
          <dd>{camp.alderLabel || tekst.ageMissing}</dd>
        </div>
        <div>
          <dt className="sr-only">Pris</dt>
          <dd>
            {pris.linje}
            {pris.notat ? <span className="mt-0.5 block text-muted">{pris.notat}</span> : null}
          </dd>
        </div>
      </dl>
      {camp.pameldingLabel ? <p className="mt-3 text-sm">{camp.pameldingLabel}</p> : null}
      {camp.apnerLabel ? <p className="text-sm">{camp.apnerLabel}</p> : null}
      {camp.sjekketLabel ? <p className="text-sm text-muted">{camp.sjekketLabel}</p> : null}
      {camp.kortLinje ? <p className="mt-3 text-sm text-muted">{camp.kortLinje}</p> : null}
      {camp.notat ? <span dangerouslySetInnerHTML={{ __html: kommentar(camp.notat) }} /> : null}
      <div className="mt-auto flex flex-wrap gap-3 pt-4 text-sm">
        <a href={camp.url} className="text-pine hover:underline" rel="noopener noreferrer">
          {tekst.sourceLink}
        </a>
        <a href={camp.url} className="font-semibold text-clay hover:underline" rel="noopener noreferrer">
          {camp.utenPamelding ? tekst.seeOrganiser : tekst.signup}
        </a>
      </div>
    </article>
  );
}

const RAD_HOYDE = 6; // to rader på bred skjerm

export function CampGrid({
  leirer,
  tekst,
  visNotat,
  midtISlot,
}: {
  leirer: CampView[];
  tekst: Copy;
  visNotat?: boolean;
  /** Fullbredde-innhold (annonse) mellom rad to og tre. Aldri inne i rutenettet. */
  midtISlot?: React.ReactNode;
}) {
  if (!leirer.length) return null;
  const grid = (liste: CampView[]) => (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {liste.map((camp) => (
        <CampCard key={camp.id} camp={camp} tekst={tekst} visNotat={visNotat} />
      ))}
    </div>
  );
  if (!midtISlot || leirer.length <= RAD_HOYDE) return grid(leirer);
  return (
    <>
      {grid(leirer.slice(0, RAD_HOYDE))}
      {midtISlot}
      {grid(leirer.slice(RAD_HOYDE))}
    </>
  );
}
