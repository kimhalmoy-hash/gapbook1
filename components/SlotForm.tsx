"use client";

import { SlotUnit, Trade } from "@prisma/client";
import { useActionState, useState } from "react";
import { createSlotAction, updateSlotAction } from "@/lib/actions/slots";
import { TRADES, UNITS } from "@/lib/constants";
import { ErrorText, Field, PrimaryButton, inputClass } from "./ui";

type Props = {
  slotId?: string;
  allowedTrades: Trade[];
  city: string;
  currency: string;
  defaults?: {
    trade: Trade;
    unit: SlotUnit;
    startDate: string;
    startTime: string;
    durationHours: number;
    days: number;
    priceAmount: number;
    suitableFor: string;
    cancellationFeeAmount: number | null;
  };
};

export function SlotForm({ slotId, allowedTrades, city, currency, defaults }: Props) {
  const action = slotId
    ? updateSlotAction.bind(null, slotId)
    : createSlotAction;
  const [state, formAction, pending] = useActionState(action, null);
  const [unit, setUnit] = useState<SlotUnit>(defaults?.unit ?? "HOURS");
  const trades = TRADES.filter((trade) => allowedTrades.includes(trade.value));

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <ErrorText error={state?.error} />
      <p className="text-sm text-muted">
        Publiseres i {city}. Selg rabattert ledig tid: minst 3 timer, maks én
        uke. Synlig pris i {currency}.
      </p>
      <Field label="Fag">
        <select className={inputClass} defaultValue={defaults?.trade} name="trade" required>
          {trades.map((trade) => (
            <option key={trade.value} value={trade.value}>
              {trade.labelNb}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Enhet">
        <select
          className={inputClass}
          name="unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value as SlotUnit)}
        >
          {UNITS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.labelNb}
            </option>
          ))}
        </select>
      </Field>
      <Field label={unit === "HOURS" ? "Dato" : "Startdato"}>
        <input
          className={inputClass}
          defaultValue={defaults?.startDate}
          name="startDate"
          required
          type="date"
        />
      </Field>
      {unit === "HOURS" && (
        <>
          <Field label="Startklokkeslett">
            <input
              className={inputClass}
              defaultValue={defaults?.startTime ?? "09:00"}
              name="startTime"
              required
              type="time"
            />
          </Field>
          <Field label="Antall timer (minst 3)">
            <input
              className={inputClass}
              defaultValue={defaults?.durationHours ?? 3}
              min={3}
              max={168}
              name="durationHours"
              required
              type="number"
            />
          </Field>
        </>
      )}
      {unit === "DAY" && (
        <Field label="Antall dager (1–7)">
          <input
            className={inputClass}
            defaultValue={defaults?.days ?? 1}
            min={1}
            max={7}
            name="days"
            required
            type="number"
          />
        </Field>
      )}
      <Field label={`Synlig pris (${currency})`}>
        <input
          className={inputClass}
          defaultValue={defaults?.priceAmount}
          min={1}
          name="priceAmount"
          required
          type="number"
        />
      </Field>
      <Field label="Passer til">
        <textarea
          className={inputClass}
          defaultValue={defaults?.suitableFor}
          name="suitableFor"
          required
          rows={3}
        />
      </Field>
      <Field label="Maks avbestillingsgebyr (valgfritt, synlig på slot)">
        <input
          className={inputClass}
          defaultValue={defaults?.cancellationFeeAmount ?? undefined}
          min={0}
          name="cancellationFeeAmount"
          type="number"
        />
      </Field>
      <PrimaryButton pending={pending}>
        {slotId ? "Lagre slot" : "Publiser slot"}
      </PrimaryButton>
    </form>
  );
}
