import assert from "node:assert/strict";
import { test } from "node:test";
import { feeAmount, feePercentForPriorCount } from "../lib/fees";

test("first two bookings are 0% launch fee", () => {
  assert.equal(feePercentForPriorCount(0), 0);
  assert.equal(feePercentForPriorCount(1), 0);
});

test("third booking and later are 5%", () => {
  assert.equal(feePercentForPriorCount(2), 5);
  assert.equal(feePercentForPriorCount(10), 5);
});

test("fee amount rounds to whole currency units", () => {
  assert.equal(feeAmount(6400, 0), 0);
  assert.equal(feeAmount(2100, 5), 105);
  assert.equal(feeAmount(18500, 5), 925);
});
