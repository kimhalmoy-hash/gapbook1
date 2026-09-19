type BookingEmailInput = {
  to: string;
  bookingId: string;
  businessName: string;
  slotSummary: string;
  priceLabel: string;
};

export async function sendBookingConfirmationStub(input: BookingEmailInput) {
  const body = [
    "GapBook — bookingbekreftelse (e-poststub)",
    `Til: ${input.to}`,
    `Booking: ${input.bookingId}`,
    `Bedrift: ${input.businessName}`,
    `Slot: ${input.slotSummary}`,
    `Synlig pris: ${input.priceLabel}`,
    "Jobbpenger betales direkte til bedriften. Ingen depositum via GapBook.",
  ].join("\n");

  console.info(body);
  return { stubbed: true as const, sentAt: new Date(), body };
}
