"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { ErrorText, Field, PrimaryButton, inputClass } from "./ui";

export function RegisterForm({ initialRole }: { initialRole: "CUSTOMER" | "BUSINESS" }) {
  const [role, setRole] = useState(initialRole);
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <ErrorText error={state?.error} />
      <fieldset className="grid grid-cols-2 gap-2">
        <label className={`ticket cursor-pointer p-3 text-center text-sm ${role === "CUSTOMER" ? "border-pine" : ""}`}>
          <input
            className="sr-only"
            type="radio"
            name="role"
            value="CUSTOMER"
            checked={role === "CUSTOMER"}
            onChange={() => setRole("CUSTOMER")}
          />
          Kunde
        </label>
        <label className={`ticket cursor-pointer p-3 text-center text-sm ${role === "BUSINESS" ? "border-pine" : ""}`}>
          <input
            className="sr-only"
            type="radio"
            name="role"
            value="BUSINESS"
            checked={role === "BUSINESS"}
            onChange={() => setRole("BUSINESS")}
          />
          Håndverkerbedrift
        </label>
      </fieldset>
      <Field label="Navn">
        <input className={inputClass} name="name" required />
      </Field>
      {role === "BUSINESS" && (
        <Field label="Bedriftsnavn">
          <input className={inputClass} name="companyName" required />
        </Field>
      )}
      <Field label="E-post">
        <input className={inputClass} name="email" type="email" required />
      </Field>
      <Field label="Passord (minst 8 tegn)">
        <input className={inputClass} name="password" type="password" minLength={8} required />
      </Field>
      <PrimaryButton pending={pending}>Opprett konto</PrimaryButton>
    </form>
  );
}
