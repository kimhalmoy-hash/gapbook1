import { PRODUCT_NAME } from "@/lib/constants";

type BookingEmailInput = {
  to: string;
  bookingId: string;
  businessName: string;
  slotSummary: string;
  priceLabel: string;
};

export async function sendBookingConfirmationStub(input: BookingEmailInput) {
  const body = [
    `${PRODUCT_NAME} — bookingbekreftelse (e-poststub)`,
    `Til: ${input.to}`,
    `Booking: ${input.bookingId}`,
    `Bedrift: ${input.businessName}`,
    `Slot: ${input.slotSummary}`,
    `Synlig pris: ${input.priceLabel}`,
    `Jobbpenger betales direkte til bedriften. Ingen depositum via ${PRODUCT_NAME}.`,
  ].join("\n");

  console.info(body);
  return { stubbed: true as const, sentAt: new Date(), body };
}
