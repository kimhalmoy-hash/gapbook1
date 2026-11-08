import type { InterestRole } from "@prisma/client";

/**
 * Pre-launch interest test for a new market (first: Trondheim).
 * The questions are the data model: the form renders them, the server action
 * validates against them, and the admin page aggregates on them.
 */

export const INTEREST_CITY = "Trondheim";

export type InterestQuestion = {
  id: string;
  label: string;
  options: readonly string[];
  multi?: boolean;
};

export const CUSTOMER_QUESTIONS: readonly InterestQuestion[] = [
  {
    id: "need",
    label: "Hva trenger du oftest hjelp til?",
    multi: true,
    options: [
      "Maling/tapet",
      "Elektriker",
      "Rørlegger",
      "Tømrer/snekker",
      "Flis/mur",
      "Tak",
      "Småfiks og montering",
    ],
  },
  {
    id: "wait",
    label: "Sist du trengte håndverker: hvor lang tid tok det å få noen?",
    options: [
      "Under en uke",
      "1–2 uker",
      "3–4 uker",
      "Over en måned",
      "Fikk ikke tak i noen",
    ],
  },
  {
    id: "flexible",
    label:
      "Ville du bestilt en ledig dag hos en godkjent håndverker til lavere pris, hvis du var fleksibel på tidspunkt?",
    options: [
      "Ja, absolutt",
      "Ja, hvis prisen er minst 15–30 % lavere",
      "Kanskje",
      "Nei",
    ],
  },
  {
    id: "urgent",
    label: "Hvis det haster (i dag/i morgen): hvor mye ekstra ville du betalt?",
    options: ["Ingenting", "10–20 %", "20–50 %", "Mer enn 50 %"],
  },
  {
    id: "important",
    label: "Hva er viktigst for deg?",
    options: [
      "At de kommer når avtalt",
      "Godkjent og seriøst firma",
      "Fast pris på forhånd",
      "Lavest mulig pris",
    ],
  },
  {
    id: "channel",
    label: "Hvordan finner du håndverker i dag?",
    multi: true,
    options: [
      "Spør bekjente",
      "Mittanbud",
      "Facebook",
      "Google",
      "Luado / Finn småjobber",
      "Ringer firma jeg kjenner",
    ],
  },
];

export const BUSINESS_QUESTIONS: readonly InterestQuestion[] = [
  {
    id: "trades",
    label: "Hvilke fag driver dere med?",
    multi: true,
    options: [
      "Maling/tapet",
      "Elektriker",
      "Rørlegger",
      "Tømrer/snekker",
      "Flis/mur",
      "Tak",
      "Annet håndverk",
    ],
  },
  {
    id: "idle",
    label: "Hvor mange dager i måneden står dere uten betalt arbeid, i snitt?",
    options: ["0", "1–2 dager", "3–5 dager", "Mer enn 5 dager"],
  },
  {
    id: "list",
    label: "Ville dere lagt ut ledige timer eller dager til lavere pris for å fylle hull?",
    options: [
      "Ja",
      "Ja, hvis rabatten er under 20 %",
      "Kanskje",
      "Nei",
    ],
  },
  {
    id: "fee",
    label: "Hvor høy suksessavgift per booking er akseptabel?",
    options: ["0–5 %", "5–10 %", "10–15 %", "Over 15 %"],
  },
  {
    id: "important",
    label: "Hva er viktigst for at dere skal bruke en slik tjeneste?",
    options: [
      "Avbestillingsgebyr som beskytter oss",
      "Kunder i nærheten",
      "Sikker betaling",
      "Enkel å bruke",
    ],
  },
  {
    id: "channel",
    label: "Hvordan får dere småjobber i dag?",
    multi: true,
    options: [
      "Bekjente og anbefalinger",
      "Faste kunder",
      "Mittanbud",
      "Luado / Finn",
      "Facebook",
    ],
  },
];

export function questionsFor(role: InterestRole): readonly InterestQuestion[] {
  return role === "BUSINESS" ? BUSINESS_QUESTIONS : CUSTOMER_QUESTIONS;
}

export type InterestAnswers = Record<string, string | string[]>;

/** Keep only answers that match a known question and option. */
export function sanitizeAnswers(
  role: InterestRole,
  raw: Record<string, string[]>,
): InterestAnswers {
  const out: InterestAnswers = {};
  for (const q of questionsFor(role)) {
    const values = (raw[q.id] ?? []).filter((v) => q.options.includes(v));
    if (values.length === 0) continue;
    out[q.id] = q.multi ? values : values[0];
  }
  return out;
}
