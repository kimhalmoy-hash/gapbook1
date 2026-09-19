import assert from "node:assert/strict";
import { test } from "node:test";
import { Trade } from "@prisma/client";
import {
  DEFAULT_LOCALE,
  LOCALES,
  PRODUCT_TAGLINES,
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
    assert.ok(copy.badge);
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

test("landing one-liners sell leftover capacity, not a generic booking tool", () => {
  assert.equal(landingCopy("nb").title, "Ledig håndverkertid er ferskvare");
  assert.equal(
    landingCopy("nb").badge,
    "Ledige timer & uker — ofte under ordinær pris",
  );
  assert.equal(landingCopy("nb").subtitle, PRODUCT_TAGLINES.nb);
  assert.equal(
    PRODUCT_TAGLINES.nb,
    "WeekSlot selger kalenderhull hos maler, elektriker, rørlegger og flere — 3 timer til 1 uke, til synlig pris, ofte under ordinær. Ikke anbud.",
  );

  assert.equal(landingCopy("sv").title, "Ledig hantverkartid är färskvara");
  assert.equal(
    landingCopy("sv").badge,
    "Lediga timmar & veckor — ofta under ordinarie pris",
  );
  assert.equal(landingCopy("sv").subtitle, PRODUCT_TAGLINES.sv);

  assert.equal(landingCopy("en").title, "Fill empty trade slots for less");
  assert.equal(
    landingCopy("en").badge,
    "Spare hours & weeks — often below the usual rate",
  );
  assert.equal(landingCopy("en").subtitle, PRODUCT_TAGLINES.en);

  for (const locale of LOCALES) {
    const copy = landingCopy(locale);
    const hero = [copy.badge, copy.title, copy.subtitle, ...copy.chips].join(
      " ",
    );
    assert.match(copy.subtitle, /WeekSlot/);
    assert.doesNotMatch(hero, /GapBook/);
    assert.doesNotMatch(hero, /\d+\s?%/);
  }

  const nb = [
    landingCopy("nb").badge,
    landingCopy("nb").title,
    landingCopy("nb").subtitle,
    ...landingCopy("nb").chips,
    ...landingCopy("nb").steps.map((step) => `${step.t} ${step.d}`),
    landingCopy("nb").businessBody,
  ].join(" ");
  assert.match(nb, /kalenderhull/i);
  assert.match(nb, /ferskvare/i);
  assert.match(nb, /under ordinær/i);

  const sv = [
    landingCopy("sv").badge,
    landingCopy("sv").title,
    landingCopy("sv").subtitle,
    ...landingCopy("sv").chips,
    ...landingCopy("sv").steps.map((step) => `${step.t} ${step.d}`),
    landingCopy("sv").businessBody,
  ].join(" ");
  assert.match(sv, /kalenderluckor/i);
  assert.match(sv, /färskvara/i);
  assert.match(sv, /under ordinarie/i);

  const en = [
    landingCopy("en").badge,
    landingCopy("en").title,
    landingCopy("en").subtitle,
    ...landingCopy("en").chips,
    ...landingCopy("en").steps.map((step) => `${step.t} ${step.d}`),
    landingCopy("en").businessBody,
  ].join(" ");
  assert.match(en, /leftover|empty (trade )?slots/i);
  assert.match(en, /below the usual rate/i);
  assert.doesNotMatch(en, /GapBook/);
});
