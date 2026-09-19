"use client";

import { Trade } from "@prisma/client";
import { useActionState } from "react";
import { saveBusinessProfileAction } from "@/lib/actions/business";
import { MARKETS, TRADES } from "@/lib/constants";
import { ErrorText, Field, PrimaryButton, inputClass } from "./ui";

type Props = {
  name: string;
  orgNr: string;
  city: string;
  trades: Trade[];
};

export function BusinessProfileForm(props: Props) {
  const [state, action, pending] = useActionState(saveBusinessProfileAction, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <ErrorText error={state?.error} />
      <Field label="Bedriftsnavn">
        <input className={inputClass} defaultValue={props.name} name="name" required />
      </Field>
      <Field label="Org.nr">
        <input className={inputClass} defaultValue={props.orgNr} name="orgNr" required />
      </Field>
      <Field label="By / marked">
        <select className={inputClass} defaultValue={props.city} name="city">
          {MARKETS.map((market) => (
            <option key={market.city} value={market.city}>
              {market.city} ({market.country === "NO" ? "Norge" : "Sverige"})
            </option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Fag</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRADES.map((trade) => (
            <label key={trade.value} className="flex items-center gap-2 text-sm">
              <input
                defaultChecked={props.trades.includes(trade.value)}
                name="trades"
                type="checkbox"
                value={trade.value}
              />
              {trade.labelNb}
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton pending={pending}>Lagre profil</PrimaryButton>
    </form>
  );
}
