"use client";

import { useActionState } from "react";
import { createBookingAction } from "@/lib/actions/bookings";
import { ErrorText, PrimaryButton } from "./ui";

export function BookingForm({
  slotId,
  cancellationFeeLabel,
}: {
  slotId: string;
  cancellationFeeLabel: string | null;
}) {
  const [state, action, pending] = useActionState(
    createBookingAction.bind(null, slotId),
    null,
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <ErrorText error={state?.error} />
      <div className="ticket p-4 text-sm leading-relaxed">
        <p className="font-medium">Digital bookingavtale</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Jeg møter / er klar i avtalt tidsrom.</li>
          <li>
            Sen avbestilling (under 48 timer) kan utløse bedriftens avbestillingsgebyr
            {cancellationFeeLabel ? ` (maks ${cancellationFeeLabel})` : ""}. Gebyret
            håndheves mellom partene.
          </li>
          <li>
            Jobben betales direkte til bedriften. WeekSlot tar ikke depositum og er
            ikke mellommann for jobbpengene.
          </li>
          <li>Bedriften holder avsatt tid og det som er oppgitt under «passer til».</li>
        </ul>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input className="mt-1" name="agreement" required type="checkbox" />
        <span>Jeg godtar den digitale bookingavtalen. Tidspunktet lagres.</span>
      </label>
      <PrimaryButton pending={pending}>Bekreft booking</PrimaryButton>
    </form>
  );
}
