import Link from "next/link";
import { PageShell } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatMoney, formatSlotWindow } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await requireRole(["CUSTOMER", "ADMIN"]);
  const bookings = await prisma.booking.findMany({
    where: { customerId: session.userId },
    include: { slot: true, business: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell>
      <h1 className="font-serif text-4xl">Mine bookinger</h1>
      <p className="mt-2 text-muted">{session.name} · {session.email}</p>
      <div className="mt-6 space-y-4">
        {bookings.length === 0 && (
          <p>
            Ingen bookinger ennå.{" "}
            <Link className="text-clay underline" href="/sok">
              Se ledig tid
            </Link>
          </p>
        )}
        {bookings.map((booking) => (
          <div key={booking.id} className="ticket p-5">
            <p className="font-serif text-2xl">{booking.business.name}</p>
            <p className="mt-1 text-sm">
              {formatSlotWindow(booking.slot.startsAt, booking.slot.endsAt, booking.slot.unit)}
            </p>
            <p className="mt-2">{formatMoney(booking.slot.priceAmount, booking.slot.currency)}</p>
            <p className="mt-2 text-sm text-muted">
              Avtale godkjent {formatDateTime(booking.agreementAcceptedAt)}
            </p>
            <Link className="mt-3 inline-block text-sm text-clay" href={`/slot/${booking.slotId}`}>
              Åpne slot
            </Link>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
