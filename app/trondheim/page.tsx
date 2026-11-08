import type { Metadata } from "next";
import Link from "next/link";
import { InterestForm } from "@/components/InterestForm";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} kommer til Trondheim — si hva du trenger`,
  description:
    "WeekSlot selger håndverkernes ledige timer og dager til lavere pris. Vi vurderer Trondheim som neste by – svar på seks spørsmål og få beskjed når vi åpner.",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrondheimPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = (one(params.s) ?? "").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-14">
      <p className="text-xs uppercase tracking-[0.22em] text-clay">
        Trondheim · ikke åpnet ennå
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
        Ledige håndverkertimer til lavere pris. Vil du ha det i Trondheim?
      </h1>
      <p className="mt-5 text-lg text-muted">
        {PRODUCT_NAME} selger håndverkernes kalenderhull – en avlyst dag, en ledig
        formiddag, en rolig uke i januar – til synlig pris, ofte under ordinær pris.
        Du booker tiden direkte, uten anbud og uten depositum. Håndverkeren får betalt
        for timer som ellers hadde stått tomme.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["For deg som bor her", "Se ledige timer og dager nær deg, med prisen på forhånd."],
          ["For håndverkere", "Legg ut hull i kalenderen. 0 % på de to første bookingene, deretter 5 %."],
          ["Hvorfor vi spør", "Vi åpner Trondheim når nok folk og bedrifter sier at de vil ha det."],
        ].map(([title, body]) => (
          <div className="ticket p-4" key={title}>
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-line bg-paper-2 p-4 text-sm text-muted">
        <p>
          <span className="font-medium text-ink">Åpent om hva dette er:</span> {PRODUCT_NAME}{" "}
          er i drift i Oslo og Stockholm og vurderer Trondheim som neste by. Svarene brukes
          til å ta den beslutningen, og i anonymisert form i et studentprosjekt i
          innovasjon og entreprenørskap ved Høgskolen i Innlandet. Du bestiller ingenting
          ved å svare. E-post lagres bare hvis du oppgir den, og brukes kun til én
          lanseringsmelding.
        </p>
      </div>

      <h2 className="mt-10 font-serif text-3xl">Seks spørsmål – to minutter</h2>
      <InterestForm source={source} />

      <p className="mt-10 text-sm text-muted">
        Nysgjerrig på hvordan det ser ut der vi allerede er i gang?{" "}
        <Link className="underline hover:text-ink" href="/sok">
          Se ledige timer i Oslo
        </Link>
        {" · "}
        <Link className="underline hover:text-ink" href="/vilkaar">
          Vilkår
        </Link>
      </p>
    </div>
  );
}
