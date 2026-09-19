import { requireBusiness } from "@/lib/auth";
import { LAUNCH_FREE_BOOKINGS, SUCCESS_FEE_PERCENT } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function BusinessBookingsPage() {
  const { business } = await requireBusiness();
  const bookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    include: { slot: true, customer: true },
    orderBy: { createdAt: "asc" },
  });
  const feeTotal = bookings.reduce((sum, booking) => sum + booking.feeAmount, 0);

  return (
    <div>
      <h1 className="font-serif text-4xl">Bookinger & gebyr</h1>
      <p className="mt-2 text-muted">
        Success fee: {LAUNCH_FREE_BOOKINGS} første bookinger 0 %, deretter{" "}
        {SUCCESS_FEE_PERCENT} %. Månedlig faktura er stub i P0.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2">#</th>
              <th>Kunde</th>
              <th>Avtale</th>
              <th>Pris</th>
              <th>Fee %</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr className="border-b border-line/70" key={booking.id}>
                <td className="py-2">{index + 1}</td>
                <td>{booking.customer.name}</td>
                <td>{formatDateTime(booking.agreementAcceptedAt)}</td>
                <td>{formatMoney(booking.slot.priceAmount, booking.slot.currency)}</td>
                <td>{booking.feePercent} %</td>
                <td>{formatMoney(booking.feeAmount, booking.slot.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ticket mt-6 p-5">
        <p className="text-sm text-muted">Grunnlag for faktura (stub)</p>
        <p className="mt-1 font-serif text-3xl">{formatMoney(feeTotal, business.country === "SE" ? "SEK" : "NOK")}</p>
        <p className="mt-2 text-sm text-muted">
          Faktura genereres månedlig — kommer. WeekSlot er ikke mellommann for
          jobbpengene.
        </p>
      </div>
    </div>
  );
}
