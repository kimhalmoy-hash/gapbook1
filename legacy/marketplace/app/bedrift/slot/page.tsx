import Link from "next/link";
import { Flash } from "@/components/Flash";
import { requireBusiness } from "@/lib/auth";
import { formatMoney, formatSlotWindow } from "@/lib/format";
import { slotStatusLabel, tradeLabel } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function BusinessSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { business } = await requireBusiness();
  const { m } = await searchParams;
  const slots = await prisma.slot.findMany({
    where: { businessId: business.id },
    orderBy: { startsAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Slots</h1>
        {business.approved && (
          <Link className="rounded-full bg-clay px-4 py-2 text-white" href="/bedrift/slot/ny">
            Ny slot
          </Link>
        )}
      </div>
      <Flash message={m} />
      {!business.approved && (
        <p className="mt-4 text-sm text-muted">Godkjenning kreves før publisering.</p>
      )}
      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <Link
            className="ticket block p-4 hover:border-pine"
            href={`/bedrift/slot/${slot.id}`}
            key={slot.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {tradeLabel(slot.trade)} · {slot.city}
              </p>
              <span className="text-sm text-muted">{slotStatusLabel(slot.status)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatSlotWindow(slot.startsAt, slot.endsAt, slot.unit)}
            </p>
            <p className="mt-1">{formatMoney(slot.priceAmount, slot.currency)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
