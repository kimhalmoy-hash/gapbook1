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

test("landing copy matches locked v6 WeekSlot strings", () => {
  assert.equal(landingCopy("nb").title, "Se ledige timer og uker nær deg");
  assert.equal(
    landingCopy("nb").subtitle,
    "Kalenderhull hos håndverkere — solgt før de mister verdien, ofte under ordinær pris. Fra 3 timer til én uke.",
  );
  assert.equal(landingCopy("nb").ctaSee, "Se ledig tid");
  assert.equal(landingCopy("nb").ctaSell, "Selg ledig tid");
  assert.equal(
    landingCopy("nb").badge,
    "Ledige timer & uker — ofte under ordinær pris",
  );
  assert.equal(
    PRODUCT_TAGLINES.nb,
    "WeekSlot selger kalenderhull hos håndverkere — ledig tid til bedre pris, før den mister verdien.",
  );

  assert.equal(landingCopy("sv").title, "Se lediga timmar och veckor nära dig");
  assert.equal(
    landingCopy("sv").subtitle,
    "Kalenderluckor hos hantverkare — sålda innan de förlorar värdet, ofta under ordinarie pris. Från 3 timmar till en vecka.",
  );
  assert.equal(landingCopy("sv").ctaSee, "Se ledig tid");
  assert.equal(landingCopy("sv").ctaSell, "Sälj ledig tid");
  assert.equal(
    landingCopy("sv").badge,
    "Lediga timmar & veckor — ofta under ordinarie pris",
  );
  assert.equal(
    PRODUCT_TAGLINES.sv,
    "WeekSlot säljer kalenderluckor hos hantverkare — ledig tid till bättre pris, innan den förlorar värdet.",
  );

  assert.equal(landingCopy("en").title, "See open hours and weeks near you");
  assert.equal(
    landingCopy("en").subtitle,
    "Calendar gaps from trades — sold before they lose value, often below usual rates. From 3 hours to one week.",
  );
  assert.equal(landingCopy("en").ctaSee, "See open time");
  assert.equal(landingCopy("en").ctaSell, "List open time");
  assert.equal(
    landingCopy("en").badge,
    "Open hours & weeks — often under standard rates",
  );
  assert.equal(
    PRODUCT_TAGLINES.en,
    "WeekSlot sells trades’ calendar gaps — open time at a better price, before it loses value.",
  );

  for (const locale of LOCALES) {
    const copy = landingCopy(locale);
    assert.equal(copy.subtitle !== PRODUCT_TAGLINES[locale], true);
    assert.match(PRODUCT_TAGLINES[locale], /WeekSlot/);
    assert.doesNotMatch(
      [copy.badge, copy.title, copy.subtitle, PRODUCT_TAGLINES[locale]].join(
        " ",
      ),
      /GapBook/,
    );
  }
});
