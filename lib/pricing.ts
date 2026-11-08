/**
 * Slot money: `priceAmount` is the selling price (the discounted open-slot
 * price when a discount applies). `listPrice` is the optional ordinary price.
 * A discount is real only when the ordinary price is higher than the selling price.
 * Success fee is calculated on the selling price, not the ordinary price.
 */
export function discountListPrice(
  listPrice: number | null | undefined,
  priceAmount: number,
): number | null {
  if (listPrice == null || !Number.isFinite(listPrice) || !Number.isFinite(priceAmount)) {
    return null;
  }
  return listPrice > priceAmount ? listPrice : null;
}

export function validateSlotPrices(
  priceAmount: number | null,
  listPrice: number | null,
): string | null {
  if (!priceAmount || priceAmount <= 0) {
    return "Salgspris må være større enn 0.";
  }
  if (listPrice == null) return null;
  if (listPrice <= 0) return "Ordinær pris må være større enn 0.";
  if (listPrice <= priceAmount) {
    return "Ordinær pris må være høyere enn salgsprisen.";
  }
  return null;
}
