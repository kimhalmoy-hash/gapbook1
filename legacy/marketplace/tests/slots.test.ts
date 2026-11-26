import assert from "node:assert/strict";
import { test } from "node:test";
import { addHours } from "../lib/slots";
import { validateSlotWindow } from "../lib/slots";

test("rejects slots shorter than 3 hours", () => {
  const start = new Date("2026-09-22T09:00:00");
  const end = addHours(start, 2);
  assert.equal(validateSlotWindow(start, end), "Booking-enhet er minst 3 timer.");
});

test("accepts a 3 hour slot", () => {
  const start = new Date("2026-09-22T09:00:00");
  const end = addHours(start, 3);
  assert.equal(validateSlotWindow(start, end), null);
});

test("accepts a 1 week slot", () => {
  const start = new Date("2026-09-22T08:00:00");
  const end = addHours(start, 168);
  assert.equal(validateSlotWindow(start, end), null);
});

test("rejects more than 1 week", () => {
  const start = new Date("2026-09-22T08:00:00");
  const end = addHours(start, 169);
  assert.equal(validateSlotWindow(start, end), "Booking-enhet er maks én uke.");
});

test("rejects inverted range", () => {
  const start = new Date("2026-09-22T09:00:00");
  const end = new Date("2026-09-22T08:00:00");
  assert.equal(validateSlotWindow(start, end), "Slutt må være etter start.");
});

test("rejects nonsense years from bad date input", () => {
  const start = new Date(202609, 8, 22, 9, 0);
  const end = addHours(start, 4);
  assert.equal(validateSlotWindow(start, end), "Ugyldig start eller slutt.");
});
