import { SlotForm } from "@/components/SlotForm";
import { requireBusiness } from "@/lib/auth";
import { currencyForCity } from "@/lib/constants";
import { defaultSlotStart, toDateInput } from "@/lib/slots";

export default async function NewSlotPage() {
  const { business } = await requireBusiness();

  if (!business.approved) {
    return (
      <div>
        <h1 className="font-serif text-4xl">Publiser slot</h1>
        <p className="mt-2 text-muted">
          Bedriften må godkjennes før du kan legge ut timer, dager eller uker.
        </p>
      </div>
    );
  }

  const start = defaultSlotStart();

  return (
    <div>
      <h1 className="font-serif text-4xl">Publiser slot</h1>
      <SlotForm
        allowedTrades={business.trades}
        city={business.city}
        currency={currencyForCity(business.city)}
        defaults={{
          trade: business.trades[0] ?? "PAINTING",
          unit: "HOURS",
          startDate: toDateInput(start),
          startTime: "09:00",
          durationHours: 3,
          days: 1,
          priceAmount: 2500,
          suitableFor: "",
          cancellationFeeAmount: null,
        }}
      />
    </div>
  );
}
