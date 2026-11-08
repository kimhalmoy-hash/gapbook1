"use server";

import { redirect } from "next/navigation";
import type { InterestRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeCity, questionsFor, sanitizeAnswers } from "@/lib/interest";

export type InterestFormState = { error?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitInterestAction(
  _prev: InterestFormState,
  formData: FormData,
): Promise<InterestFormState> {
  // Honeypot: real browsers leave this empty.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect("/interesse/takk");
  }

  const roleRaw = String(formData.get("role") ?? "");
  const role: InterestRole | null =
    roleRaw === "CUSTOMER" || roleRaw === "BUSINESS" ? roleRaw : null;
  if (!role) {
    return { error: "Velg om du er privatperson eller håndverksbedrift." };
  }

  const city = normalizeCity(String(formData.get("city") ?? ""));
  if (city.length < 2) {
    return { error: "Skriv inn byen eller stedet du vil ha WeekSlot i." };
  }

  const raw: Record<string, string[]> = {};
  for (const q of questionsFor(role)) {
    raw[q.id] = formData
      .getAll(`q_${q.id}`)
      .map((v) => String(v))
      .filter(Boolean);
  }
  const answers = sanitizeAnswers(role, raw);
  if (Object.keys(answers).length === 0) {
    return { error: "Svar på minst ett spørsmål før du sender inn." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && !EMAIL_RE.test(email)) {
    return { error: "E-postadressen ser ikke riktig ut." };
  }
  const postcode = String(formData.get("postcode") ?? "")
    .replace(/\D/g, "")
    .slice(0, 4);
  const source = String(formData.get("source") ?? "")
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 40);

  await prisma.interest.create({
    data: {
      role,
      city,
      answers,
      email: email || null,
      postcode: postcode || null,
      source: source || null,
    },
  });

  redirect(`/interesse/takk?city=${encodeURIComponent(city)}`);
}
