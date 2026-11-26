import Link from "next/link";
import { Country, SlotStatus, SlotUnit, Trade } from "@prisma/client";
import { formatMoney, formatPlace, formatSlotWindow, formatTradeUnit } from "@/lib/format";

type SlotCardProps = {
  id: string;
  trade: Trade;
  city: string;
  country: Country;
  startsAt: Date;
  endsAt: Date;
  unit: SlotUnit;
  priceAmount: number;
  currency: string;
  suitableFor: string;
  status: SlotStatus;
  businessName: string;
  href?: string;
};

export function SlotCard(slot: SlotCardProps) {
  const href = slot.href ?? `/slot/${slot.id}`;
  return (
    <Link
      href={href}
      className="ticket block p-5 transition hover:-translate-y-0.5 hover:border-pine"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {formatTradeUnit(slot.trade, slot.unit)}
        </p>
        {slot.status !== "OPEN" && (
          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs">
            {slot.status === "BOOKED" ? "Booket" : "Trukket"}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-serif text-2xl">{formatPlace(slot.city, slot.country)}</h3>
      <p className="mt-1 text-sm text-muted">{slot.businessName}</p>
      <p className="mt-3 text-sm">{formatSlotWindow(slot.startsAt, slot.endsAt, slot.unit)}</p>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{slot.suitableFor}</p>
      <p className="mt-4 font-serif text-2xl text-clay">
        {formatMoney(slot.priceAmount, slot.currency)}
      </p>
    </Link>
  );
}
