import { SlotUnit } from "@prisma/client";
import { MAX_DURATION_HOURS, MIN_DURATION_HOURS } from "./constants";

export function hoursBetween(startsAt: Date, endsAt: Date): number {
  return (endsAt.getTime() - startsAt.getTime()) / 3_600_000;
}

function isSaneDate(date: Date): boolean {
  if (Number.isNaN(date.getTime())) return false;
  const year = date.getFullYear();
  return year >= 2024 && year <= 2100;
}

export function validateSlotWindow(startsAt: Date, endsAt: Date): string | null {
  if (!isSaneDate(startsAt) || !isSaneDate(endsAt)) {
    return "Ugyldig start eller slutt.";
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return "Slutt må være etter start.";
  }
  const hours = hoursBetween(startsAt, endsAt);
  if (hours < MIN_DURATION_HOURS) {
    return `Booking-enhet er minst ${MIN_DURATION_HOURS} timer.`;
  }
  if (hours > MAX_DURATION_HOURS) {
    return "Booking-enhet er maks én uke.";
  }
  return null;
}

export function parseLocalDateTime(value: string): Date {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = (time ?? "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export function parseLocalDate(value: string, hour = 8, minute = 0): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function computeSlotRange(input: {
  unit: SlotUnit;
  start: string;
  durationHours?: number;
  days?: number;
}): { startsAt: Date; endsAt: Date; durationHours: number } {
  if (input.unit === "HOURS") {
    const startsAt = parseLocalDateTime(input.start);
    const durationHours = input.durationHours ?? MIN_DURATION_HOURS;
    const endsAt = addHours(startsAt, durationHours);
    return { startsAt, endsAt, durationHours };
  }

  if (input.unit === "WEEK") {
    const startsAt = parseLocalDate(input.start, 8, 0);
    const endsAt = addDays(startsAt, 7);
    return {
      startsAt,
      endsAt,
      durationHours: Math.round(hoursBetween(startsAt, endsAt)),
    };
  }

  const days = Math.min(7, Math.max(1, input.days ?? 1));
  const startsAt = parseLocalDate(input.start, 8, 0);
  const lastDayStart = addDays(startsAt, days - 1);
  const endsAt = new Date(lastDayStart);
  endsAt.setHours(16, 0, 0, 0);
  return {
    startsAt,
    endsAt,
    durationHours: Math.round(hoursBetween(startsAt, endsAt)),
  };
}

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateTimeInput(date: Date): string {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${toDateInput(date)}T${hour}:${minute}`;
}

export function defaultSlotStart(daysAhead = 3, hour = 9): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
}
