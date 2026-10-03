import assert from "node:assert/strict";
import { test } from "node:test";
import { discountListPrice, validateSlotPrices } from "../lib/pricing";

test("discount requires ordinary price above the selling price", () => {
  assert.equal(discountListPrice(4200, 2800), 4200);
  assert.equal(discountListPrice(2800, 2800), null);
  assert.equal(discountListPrice(2000, 2800), null);
  assert.equal(discountListPrice(null, 2800), null);
  assert.equal(discountListPrice(undefined, 2800), null);
});

test("selling price is required and must be positive", () => {
  assert.equal(validateSlotPrices(null, null), "Salgspris må være større enn 0.");
  assert.equal(validateSlotPrices(0, null), "Salgspris må være større enn 0.");
  assert.equal(validateSlotPrices(-100, 500), "Salgspris må være større enn 0.");
});

test("ordinary price is optional", () => {
  assert.equal(validateSlotPrices(2800, null), null);
});

test("ordinary price must be a real discount when set", () => {
  assert.equal(validateSlotPrices(2800, 0), "Ordinær pris må være større enn 0.");
  assert.equal(
    validateSlotPrices(2800, 2800),
    "Ordinær pris må være høyere enn salgsprisen.",
  );
  assert.equal(
    validateSlotPrices(2800, 2000),
    "Ordinær pris må være høyere enn salgsprisen.",
  );
  assert.equal(validateSlotPrices(2800, 4200), null);
});
