import assert from "node:assert/strict";
import { test } from "node:test";
import { Trade } from "@prisma/client";
import {
  DEFAULT_LOCALE,
  LOCALES,
  landingCopy,
  parseLocale,
} from "../lib/i18n";

test("Norwegian is the default locale", () => {
  assert.equal(DEFAULT_LOCALE, "nb");
  assert.equal(parseLocale(undefined), "nb");
  assert.equal(parseLocale("fr"), "nb");
});

test("parseLocale accepts nb, sv and en", () => {
  for (const locale of LOCALES) {
    assert.equal(parseLocale(locale), locale);
  }
});

test("landing copy exists for every locale with the same keys and trades", () => {
  const trades = Object.values(Trade);
  const expectedKeys = Object.keys(landingCopy("nb")).sort();

  for (const locale of LOCALES) {
    const copy = landingCopy(locale);
    assert.deepEqual(Object.keys(copy).sort(), expectedKeys);
    assert.equal(copy.lang, locale);
    assert.equal(copy.chips.length, 4);
    assert.equal(copy.steps.length, 3);
    for (const trade of trades) {
      assert.ok(copy.trades[trade], `${locale} missing trade ${trade}`);
    }
  }
});

test("landing copy keeps locked commercial terms", () => {
  for (const locale of LOCALES) {
    const text = [
      landingCopy(locale).subtitle,
      ...landingCopy(locale).chips,
      ...landingCopy(locale).steps.map((step) => `${step.t} ${step.d}`),
      landingCopy(locale).businessBody,
    ].join(" ");
    assert.match(text, /3/);
    assert.match(text, /5\s?%/);
    assert.match(text.toLowerCase(), /stripe/);
    assert.match(text.toLowerCase(), /deposit|deposition|depositum/);
  }
});

test("landing one-liners use WeekSlot and keep the hero titles", () => {
  assert.equal(
    landingCopy("nb").title,
    "Se ledige timer, dager og uker nær deg",
  );
  assert.equal(
    landingCopy("nb").subtitle,
    "WeekSlot selger ledig håndverkertid — timer, dager eller uker — til synlig pris, før tiden mister verdien.",
  );
  assert.equal(
    landingCopy("en").subtitle,
    "WeekSlot sells open trade time — hours, days or weeks — at a clear price, before time loses its value.",
  );
  for (const locale of LOCALES) {
    const copy = landingCopy(locale);
    assert.match(copy.subtitle, /WeekSlot/);
    const branded = [copy.subtitle, ...copy.steps.map((step) => step.d)].join(
      " ",
    );
    assert.doesNotMatch(branded, /GapBook/);
  }
});
