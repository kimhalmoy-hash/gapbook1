import Link from "next/link";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { SlotCard } from "@/components/SlotCard";
import { TRADES } from "@/lib/constants";
import { landingCopy } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const locale = await getLocale();
  const t = landingCopy(locale);
  const highlights = await prisma.slot.findMany({
    where: { status: "OPEN", business: { approved: true } },
    include: { business: true },
    orderBy: { startsAt: "asc" },
    take: 3,
  });

  return (
    <div lang={t.lang}>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">
            {t.kicker}
          </p>
          <LanguageSwitch locale={locale} label={t.switcherLabel} />
        </div>
        <p className="mt-5 inline-flex max-w-full items-center rounded-full bg-clay px-4 py-1.5 text-sm font-medium tracking-wide text-white sm:text-base">
          {t.badge}
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-6xl">
          {t.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{t.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sok"
            className="rounded-full bg-clay px-6 py-3 text-white hover:bg-clay-dark"
          >
            {t.ctaSee}
          </Link>
          <Link
            href="/registrer?type=bedrift"
            className="rounded-full border border-pine px-6 py-3 text-pine hover:bg-pine hover:text-white"
          >
            {t.ctaSell}
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          {t.chips.map((chip) => (
            <span key={chip} className="rounded-full bg-paper-2 px-3 py-1">
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-serif text-3xl">{t.tradesHeading}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.map((trade) => (
            <Link
              key={trade.value}
              href={`/sok?trade=${trade.value}`}
              className="ticket p-5 hover:border-pine"
            >
              <p className="font-serif text-2xl">{t.trades[trade.value]}</p>
              <p className="mt-1 text-sm text-muted">{t.tradesSeeOpen}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">{t.openNow}</h2>
          <Link className="text-sm text-clay hover:underline" href="/sok">
            {t.allSlots}
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {highlights.length === 0 && (
            <p className="text-muted">{t.noSlots}</p>
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
        <h2 className="font-serif text-3xl">{t.howHeading}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {t.steps.map((step) => (
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
          <h2 className="font-serif text-3xl">{t.businessHeading}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t.businessBody}</p>
          <Link
            href="/registrer?type=bedrift"
            className="mt-6 inline-block rounded-full bg-pine px-5 py-2.5 text-white hover:bg-pine-mid"
          >
            {t.businessCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
