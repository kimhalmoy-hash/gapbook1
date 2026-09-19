import { setBusinessApprovalAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { countryLabel, tradeLabel } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();
  const businesses = await prisma.business.findMany({
    include: { user: true, _count: { select: { slots: true, bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-4xl">Admin — godkjenning</h1>
      <p className="mt-2 text-muted">
        Bedrifter er ikke offentlige før manuell godkjenning.
      </p>
      <div className="mt-6 space-y-3">
        {businesses.map((business) => (
          <div className="ticket p-5" key={business.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{business.name}</p>
                <p className="text-sm text-muted">
                  {business.user.email} · org.nr {business.orgNr || "mangler"}
                </p>
                <p className="mt-1 text-sm">
                  {business.city}, {countryLabel(business.country)} ·{" "}
                  {business.trades.map(tradeLabel).join(", ") || "ingen fag"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {business._count.slots} slots · {business._count.bookings} bookinger
                </p>
              </div>
              <form action={setBusinessApprovalAction.bind(null, business.id, !business.approved)}>
                <button
                  className={`rounded-full px-4 py-2 text-sm text-white ${business.approved ? "bg-muted" : "bg-ok"}`}
                  type="submit"
                >
                  {business.approved ? "Fjern godkjenning" : "Godkjenn"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
