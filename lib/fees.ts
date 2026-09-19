import { LAUNCH_FREE_BOOKINGS, SUCCESS_FEE_PERCENT } from "./constants";

export function feePercentForPriorCount(priorConfirmedCount: number): number {
  return priorConfirmedCount < LAUNCH_FREE_BOOKINGS ? 0 : SUCCESS_FEE_PERCENT;
}

export function feeAmount(priceAmount: number, percent: number): number {
  return Math.round((priceAmount * percent) / 100);
}
