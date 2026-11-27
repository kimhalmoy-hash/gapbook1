import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui";
import { formatDateTime, formatMoney, formatSlotWindow } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["CUSTOMER"]);
  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { slotId: id, customerId: session.userId },
    include: { slot: true, business: true },
  });
  if (!booking) notFound();

  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.18em] text-ok">Booket</p>
      <h1 className="mt-2 font-serif text-4xl">Avtalen er inngått</h1>
      <p className="mt-3 text-muted">
        Digital avtale godkjent {formatDateTime(booking.agreementAcceptedAt)}.
        Bekreftelse er sendt som e-poststub til {booking.customerEmail}.
      </p>
      <div className="ticket mt-6 space-y-2 p-5">
        <p className="font-serif text-2xl">{booking.business.name}</p>
        <p>{formatSlotWindow(booking.slot.startsAt, booking.slot.endsAt, booking.slot.unit)}</p>
        <p className="text-clay">
          {formatMoney(booking.slot.priceAmount, booking.slot.currency)}
        </p>
        <p className="text-sm text-muted">
          Betal bedriften direkte. WeekSlot tar ikke jobbpengene.
        </p>
      </div>
      <Link className="mt-6 inline-block text-clay underline" href="/konto">
        Mine bookinger
      </Link>
    </PageShell>
  );
}
