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

test("v7 landing copy leads with discount on leftover slots", () => {
  assert.equal(landingCopy("nb").title, "Rabattert ledig tid hos håndverkere");
  assert.equal(landingCopy("nb").badge, "Rabatterte ledige slots");
  assert.equal(
    landingCopy("nb").subtitle,
    "Ledige slots i kalenderen — solgt med rabatt før tiden mister verdien. Fra 3 timer til én uke.",
  );
  assert.equal(landingCopy("nb").ctaSee, "Se ledig tid");
  assert.equal(landingCopy("nb").ctaSell, "Selg ledig tid");
  assert.equal(
    PRODUCT_TAGLINES.nb,
    "WeekSlot — rabatterte ledige timer og uker hos håndverkere, før tiden mister verdien.",
  );

  assert.equal(landingCopy("sv").title, "Rabatterad ledig tid hos hantverkare");
  assert.equal(landingCopy("sv").badge, "Rabatterade lediga slots");
  assert.equal(
    landingCopy("sv").subtitle,
    "Lediga slots i kalendern — sålda med rabatt innan tiden tappar värde. Från 3 timmar till en vecka.",
  );

  assert.equal(landingCopy("en").title, "Discounted open time from trades");
  assert.equal(landingCopy("en").badge, "Discounted open slots");
  assert.equal(
    landingCopy("en").subtitle,
    "Empty calendar slots — sold at a discount before time loses value. From 3 hours to one week.",
  );
  assert.equal(landingCopy("en").ctaSee, "See open time");
  assert.equal(landingCopy("en").ctaSell, "List open time");
  assert.equal(
    PRODUCT_TAGLINES.en,
    "WeekSlot — discounted open hours and weeks from trades, before time loses its value.",
  );

  for (const locale of LOCALES) {
    const copy = landingCopy(locale);
    const hero = [copy.badge, copy.title, copy.subtitle, ...copy.chips].join(
      " ",
    );
    assert.match(PRODUCT_TAGLINES[locale], /WeekSlot/);
    assert.doesNotMatch(hero, /GapBook/);
    assert.doesNotMatch(hero, /\d+\s?%/);
  }

  const nbHero = [
    landingCopy("nb").kicker,
    landingCopy("nb").badge,
    landingCopy("nb").title,
    landingCopy("nb").subtitle,
  ].join(" ");
  assert.match(nbHero, /rabattert/i);
  assert.match(nbHero, /rabatt/i);

  const svHero = [
    landingCopy("sv").kicker,
    landingCopy("sv").badge,
    landingCopy("sv").title,
    landingCopy("sv").subtitle,
  ].join(" ");
  assert.match(svHero, /rabatterad/i);
  assert.match(svHero, /rabatterade/i);

  const enHero = [
    landingCopy("en").kicker,
    landingCopy("en").badge,
    landingCopy("en").title,
    landingCopy("en").subtitle,
  ].join(" ");
  assert.match(enHero, /discounted/i);
  assert.match(enHero, /discount/i);
});
