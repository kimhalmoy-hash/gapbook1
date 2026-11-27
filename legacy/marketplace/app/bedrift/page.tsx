import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feePercentForPriorCount } from "@/lib/fees";

export default async function BusinessHomePage() {
  const session = await requireRole(["BUSINESS", "ADMIN"]);
  const business = await prisma.business.findUnique({
    where: { userId: session.userId },
    include: {
      _count: { select: { slots: true, bookings: true } },
    },
  });

  if (!business) {
    return (
      <div>
        <h1 className="font-serif text-4xl">Fullfør profilen</h1>
        <p className="mt-2 text-muted">Land, by, fag og org.nr må fylles inn før godkjenning.</p>
        <Link className="mt-4 inline-block text-clay underline" href="/bedrift/profil">
          Gå til profil
        </Link>
      </div>
    );
  }

  const nextFee = feePercentForPriorCount(business._count.bookings);
  const remainingFree = Math.max(0, 2 - business._count.bookings);

  return (
    <div>
      <h1 className="font-serif text-4xl">Oversikt</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="ticket p-4">
          <p className="text-sm text-muted">Slots</p>
          <p className="font-serif text-3xl">{business._count.slots}</p>
        </div>
        <div className="ticket p-4">
          <p className="text-sm text-muted">Bookinger</p>
          <p className="font-serif text-3xl">{business._count.bookings}</p>
        </div>
        <div className="ticket p-4">
          <p className="text-sm text-muted">Neste success fee</p>
          <p className="font-serif text-3xl">{nextFee} %</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">
        Launch: 0 % på de to første bookingene, deretter 5 %.{" "}
        {remainingFree > 0
          ? `${remainingFree} gratis booking${remainingFree === 1 ? "" : "er"} igjen.`
          : "Videre bookinger belastes 5 %."}{" "}
        Faktura-UI er stub — se Bookinger & gebyr.
      </p>
      {business.approved ? (
        <Link
          className="mt-6 inline-block rounded-full bg-clay px-5 py-2.5 text-white"
          href="/bedrift/slot/ny"
        >
          Publiser slot
        </Link>
      ) : (
        <p className="mt-6 rounded-md bg-paper-2 px-3 py-2 text-sm">
          Admin må godkjenne profilen før slots blir offentlige.
        </p>
      )}
    </div>
  );
}
