import { Trade } from "@prisma/client";
import { SlotCard } from "@/components/SlotCard";
import { PageShell, inputClass } from "@/components/ui";
import { MARKETS, TRADES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { parseLocalDate } from "@/lib/slots";

const TRADE_VALUES = new Set(TRADES.map((trade) => trade.value));

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const city = one(params.city) || "";
  const tradeRaw = one(params.trade) || "";
  const from = one(params.from) || "";
  const to = one(params.to) || "";
  const trade = TRADE_VALUES.has(tradeRaw as Trade) ? (tradeRaw as Trade) : undefined;

  const slots = await prisma.slot.findMany({
    where: {
      status: "OPEN",
      business: { approved: true },
      ...(city ? { city } : {}),
      ...(trade ? { trade } : {}),
      ...(from || to
        ? {
            AND: [
              from ? { endsAt: { gt: parseLocalDate(from, 0, 0) } } : {},
              to ? { startsAt: { lt: parseLocalDate(to, 23, 59) } } : {},
            ],
          }
        : {}),
    },
    include: { business: true },
    orderBy: { startsAt: "asc" },
  });

  return (
    <PageShell wide>
      <h1 className="font-serif text-4xl">Se ledig tid</h1>
      <p className="mt-2 text-muted">
        Finn kalenderhull hos håndverkere. Synlig pris, ofte under ordinær — det
        bys ikke.
      </p>
      <form className="mt-6 grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-4">
        <select className={inputClass} defaultValue={city} name="city">
          <option value="">Alle steder</option>
          {MARKETS.map((market) => (
            <option key={market.city} value={market.city}>
              {market.city}
            </option>
          ))}
        </select>
        <select className={inputClass} defaultValue={trade ?? ""} name="trade">
          <option value="">Alle fag</option>
          {TRADES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.labelNb}
            </option>
          ))}
        </select>
        <input className={inputClass} defaultValue={from} name="from" type="date" />
        <input className={inputClass} defaultValue={to} name="to" type="date" />
        <button className="rounded-full bg-pine px-4 py-2 text-white sm:col-span-4" type="submit">
          Søk
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">{slots.length} åpne slots</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <SlotCard key={slot.id} {...slot} businessName={slot.business.name} />
        ))}
      </div>
    </PageShell>
  );
}
