"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { ErrorText, Field, PrimaryButton, inputClass } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <ErrorText error={state?.error} />
      {next?.startsWith("/") && !next.startsWith("//") ? (
        <input name="next" type="hidden" value={next} />
      ) : null}
      <Field label="E-post">
        <input className={inputClass} name="email" type="email" required />
      </Field>
      <Field label="Passord">
        <input className={inputClass} name="password" type="password" required />
      </Field>
      <PrimaryButton pending={pending}>Logg inn</PrimaryButton>
    </form>
  );
}
