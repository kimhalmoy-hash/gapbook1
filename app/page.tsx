import Link from "next/link";
import { SlotCard } from "@/components/SlotCard";
import { MARKETS, TRADES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const highlights = await prisma.slot.findMany({
    where: { status: "OPEN", business: { approved: true } },
    include: { business: true },
    orderBy: { startsAt: "asc" },
    take: 3,
  });

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14">
        <p className="text-xs uppercase tracking-[0.22em] text-clay">
          Oslo + Stockholm · synlig pris
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl">
          Se ledige timer, dager og uker nær deg
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Book fra 3 timer til én uke — til synlig pris. Ledig kapasitet hos flere
          fag, klar til å bookes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sok"
            className="rounded-full bg-clay px-6 py-3 text-white hover:bg-clay-dark"
          >
            Se ledig tid
          </Link>
          <Link
            href="/registrer?type=bedrift"
            className="rounded-full border border-pine px-6 py-3 text-pine hover:bg-pine hover:text-white"
          >
            Selg ledig tid
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          {["Ikke anbud", "Ingen depositum", "Jobbpenger direkte til bedrift", "3 t – 1 uke"].map(
            (chip) => (
              <span key={chip} className="rounded-full bg-paper-2 px-3 py-1">
                {chip}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-serif text-3xl">Fag live fra start</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.map((trade) => (
            <Link
              key={trade.value}
              href={`/sok?trade=${trade.value}`}
              className="ticket p-5 hover:border-pine"
            >
              <p className="font-serif text-2xl">{trade.labelNb}</p>
              <p className="mt-1 text-sm text-muted">Se åpne slots</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">Ledig nå</h2>
          <Link className="text-sm text-clay hover:underline" href="/sok">
            Alle slots
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {highlights.length === 0 && (
            <p className="text-muted">Ingen åpne slots ennå. Kjør seed for demodata.</p>
          )}
          {highlights.map((slot) => (
            <SlotCard
              key={slot.id}
              {...slot}
              businessName={slot.business.name}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-serif text-3xl">Slik fungerer det</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Søk",
              d: "Velg sted, periode og fag. Du ser bare godkjente bedrifter med synlig pris.",
            },
            {
              n: "02",
              t: "Book",
              d: "Godta digital avtale (checkbox + tidspunkt). Ingen Stripe, ingen depositum.",
            },
            {
              n: "03",
              t: "Gjør jobben opp",
              d: "Jobbpenger går direkte bedrift ↔ kunde. GapBook tar success fee av bedriften etterpå.",
            },
          ].map((step) => (
            <div key={step.n} className="ticket p-5">
              <p className="text-xs tracking-[0.2em] text-clay">{step.n}</p>
              <h3 className="mt-2 font-serif text-2xl">{step.t}</h3>
              <p className="mt-2 text-sm text-muted">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="ticket p-6 sm:p-8">
          <h2 className="font-serif text-3xl">For bedrifter</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Selg ledig kapasitet før den mister verdien. Publiser timer, dager eller
            én uke i {MARKETS.map((m) => m.city).join(" og ")}. Launch: 0 % success
            fee på de to første bookingene, deretter 5 % — fakturert månedlig.
          </p>
          <Link
            href="/registrer?type=bedrift"
            className="mt-6 inline-block rounded-full bg-pine px-5 py-2.5 text-white hover:bg-pine-mid"
          >
            Selg ledig tid
          </Link>
        </div>
      </section>
    </div>
  );
}
