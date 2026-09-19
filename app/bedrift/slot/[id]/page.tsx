import { notFound } from "next/navigation";
import { SlotForm } from "@/components/SlotForm";
import { requireBusiness } from "@/lib/auth";
import { cancelSlotAction } from "@/lib/actions/slots";
import { currencyForCity } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { toDateTimeInput } from "@/lib/slots";
import { Flash } from "@/components/Flash";

export default async function EditSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { business } = await requireBusiness();
  const { id } = await params;
  const { m } = await searchParams;
  const slot = await prisma.slot.findFirst({
    where: { id, businessId: business.id },
  });
  if (!slot) notFound();

  const msPerDay = 86_400_000;
  const days =
    Math.round(
      (new Date(slot.endsAt).setHours(0, 0, 0, 0) -
        new Date(slot.startsAt).setHours(0, 0, 0, 0)) /
        msPerDay,
    ) + 1;

  return (
    <div>
      <h1 className="font-serif text-4xl">Slot</h1>
      <Flash message={m} />
      {slot.status === "OPEN" ? (
        <>
          <SlotForm
            allowedTrades={business.trades}
            city={business.city}
            currency={currencyForCity(business.city)}
            slotId={slot.id}
            defaults={{
              trade: slot.trade,
              unit: slot.unit,
              start: toDateTimeInput(slot.startsAt),
              durationHours: slot.durationHours,
              days: Math.min(7, Math.max(1, days)),
              priceAmount: slot.priceAmount,
              suitableFor: slot.suitableFor,
              cancellationFeeAmount: slot.cancellationFeeAmount,
            }}
          />
          <form action={cancelSlotAction.bind(null, slot.id)} className="mt-6">
            <button className="text-sm text-muted underline" type="submit">
              Trekk slot fra markedet
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-muted">
          Sloten er {slot.status === "BOOKED" ? "booket og kan ikke redigeres" : "trukket"}.
        </p>
      )}
    </div>
  );
}
