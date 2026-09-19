import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { PageShell } from "@/components/ui";
import { LATE_CANCEL_HOURS, tradeLabel } from "@/lib/constants";
import { formatMoney, formatPlace, formatSlotWindow } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function SlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slot = await prisma.slot.findUnique({
    where: { id },
    include: { business: { include: { user: true } }, booking: true },
  });
  if (!slot || !slot.business.approved) notFound();

  const session = await getSession();
  const open = slot.status === "OPEN";
  const feeLabel = slot.cancellationFeeAmount
    ? formatMoney(slot.cancellationFeeAmount, slot.currency)
    : null;

  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        {tradeLabel(slot.trade)} · {slot.unit === "HOURS" ? "timer" : slot.unit === "DAY" ? "dag" : "uke"}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{slot.business.name}</h1>
      <p className="mt-2 text-muted">{formatPlace(slot.city, slot.country)}</p>
      <p className="mt-4 text-lg">
        {formatSlotWindow(slot.startsAt, slot.endsAt, slot.unit)}
      </p>
      <p className="mt-2 font-serif text-4xl text-clay">
        {formatMoney(slot.priceAmount, slot.currency)}
      </p>
      <div className="ticket mt-6 p-5">
        <h2 className="font-serif text-2xl">Passer til</h2>
        <p className="mt-2 text-muted">{slot.suitableFor}</p>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-muted">
        <li>Jobbpenger betales direkte til bedriften.</li>
        <li>Ingen kunde-depositum og ingen Stripe-betaling via WeekSlot.</li>
        <li>
          Sen avbestilling (under {LATE_CANCEL_HOURS} t) kan utløse avbestillingsgebyr
          {feeLabel ? ` (maks ${feeLabel})` : ""}.
        </li>
      </ul>

      {!open && (
        <p className="mt-6 rounded-md bg-paper-2 px-3 py-2 text-sm">
          Denne sloten er {slot.status === "BOOKED" ? "allerede booket" : "trukket"}.
        </p>
      )}

      {open && !session && (
        <p className="mt-6">
          <Link className="rounded-full bg-clay px-5 py-2.5 text-white" href={`/login?next=/slot/${slot.id}`}>
            Logg inn for å booke
          </Link>
        </p>
      )}

      {open && session?.role === "CUSTOMER" && (
        <BookingForm cancellationFeeLabel={feeLabel} slotId={slot.id} />
      )}

      {open && session && session.role !== "CUSTOMER" && (
        <p className="mt-6 text-sm text-muted">
          Bookinger gjøres med en kundekonto.
        </p>
      )}
    </PageShell>
  );
}
