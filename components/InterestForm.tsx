"use client";

import { useActionState, useState } from "react";
import type { InterestRole } from "@prisma/client";
import { submitInterestAction } from "@/lib/actions/interest";
import { CITY_SUGGESTIONS, questionsFor, type InterestQuestion } from "@/lib/interest";
import { ErrorText, PrimaryButton, inputClass } from "./ui";

function Question({ q }: { q: InterestQuestion }) {
  return (
    <fieldset className="ticket p-4">
      <legend className="px-1 font-medium">{q.label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {q.options.map((opt) => (
          <label className="flex items-start gap-2 text-sm" key={opt}>
            <input
              className="mt-1"
              name={`q_${q.id}`}
              type={q.multi ? "checkbox" : "radio"}
              value={opt}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {q.multi ? (
        <p className="mt-2 text-xs text-muted">Velg gjerne flere.</p>
      ) : null}
    </fieldset>
  );
}

export function InterestForm({
  source,
  defaultCity,
}: {
  source: string | null;
  defaultCity: string;
}) {
  const [role, setRole] = useState<InterestRole>("CUSTOMER");
  const [state, action, pending] = useActionState(submitInterestAction, null);

  return (
    <form action={action} className="mt-8 space-y-5">
      <ErrorText error={state?.error} />
      <input name="source" type="hidden" value={source ?? ""} />
      {/* Honeypot – hidden from people, filled by bots. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Nettside
          <input autoComplete="off" name="website" tabIndex={-1} type="text" />
        </label>
      </div>

      <fieldset className="ticket p-4">
        <legend className="px-1 font-medium">Jeg er …</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {(
            [
              ["CUSTOMER", "Privatperson / boligeier"],
              ["BUSINESS", "Håndverksbedrift"],
            ] as const
          ).map(([value, label]) => (
            <label
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                role === value
                  ? "border-pine bg-pine text-white"
                  : "border-line bg-card hover:border-pine"
              }`}
              key={value}
            >
              <input
                checked={role === value}
                className="sr-only"
                name="role"
                onChange={() => setRole(value)}
                type="radio"
                value={value}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="ticket p-4">
        <legend className="px-1 font-medium">Hvor vil du ha WeekSlot?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_140px]">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">By eller sted i Norge</span>
            <input
              autoComplete="address-level2"
              className={inputClass}
              defaultValue={defaultCity}
              list="interest-cities"
              maxLength={40}
              name="city"
              placeholder="F.eks. Trondheim"
              required
              type="text"
            />
            <datalist id="interest-cities">
              {CITY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Postnummer</span>
            <input
              className={inputClass}
              inputMode="numeric"
              maxLength={4}
              name="postcode"
              placeholder="7540"
              type="text"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">Vi åpner der flest sier de vil ha det.</p>
      </fieldset>

      {questionsFor(role).map((q) => (
        <Question key={`${role}-${q.id}`} q={q} />
      ))}

      <div className="ticket p-4">
        <p className="font-medium">
          {role === "BUSINESS"
            ? "Vil dere være blant de første bedriftene når vi åpner der dere er?"
            : "Vil du ha beskjed når WeekSlot åpner der du bor?"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Valgfritt. Vi sender én e-post ved lansering, ingenting annet.
        </p>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-muted">E-post</span>
          <input
            autoComplete="email"
            className={inputClass}
            inputMode="email"
            name="email"
            placeholder="navn@eksempel.no"
            type="email"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <PrimaryButton pending={pending}>Send svar</PrimaryButton>
        <p className="text-xs text-muted">Tar under to minutter. Ingen forpliktelse.</p>
      </div>
    </form>
  );
}
