"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { sendBookingConfirmationStub } from "@/lib/email";
import { feeAmount, feePercentForPriorCount } from "@/lib/fees";
import { formatMoney, formatSlotWindow } from "@/lib/format";
import { tradeLabel } from "@/lib/constants";
import type { ActionState } from "./auth";

export async function createBookingAction(
  slotId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "CUSTOMER") {
    return { error: "Kun kunder kan booke. Logg inn med en kundekonto." };
  }

  const agreed = String(formData.get("agreement") ?? "") === "on";
  if (!agreed) {
    return { error: "Du må godta den digitale bookingavtalen." };
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { business: true },
  });
  if (!slot || slot.status !== "OPEN" || !slot.business.approved) {
    return { error: "Sloten er ikke tilgjengelig." };
  }

  const priorCount = await prisma.booking.count({
    where: { businessId: slot.businessId, status: "CONFIRMED" },
  });
  const percent = feePercentForPriorCount(priorCount);
  const acceptedAt = new Date();

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const locked = await tx.slot.findUnique({ where: { id: slotId } });
      if (!locked || locked.status !== "OPEN") {
        throw new Error("TAKEN");
      }
      await tx.slot.update({
        where: { id: slotId },
        data: { status: "BOOKED" },
      });
      return tx.booking.create({
        data: {
          slotId,
          customerId: session.userId,
          businessId: slot.businessId,
          agreementAcceptedAt: acceptedAt,
          status: "CONFIRMED",
          customerEmail: session.email,
          feePercent: percent,
          feeAmount: feeAmount(slot.priceAmount, percent),
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TAKEN") {
      return { error: "Sloten ble nettopp booket av noen andre." };
    }
    throw error;
  }

  const stub = await sendBookingConfirmationStub({
    to: session.email,
    bookingId: booking.id,
    businessName: slot.business.name,
    slotSummary: `${tradeLabel(slot.trade)}, ${slot.city}, ${formatSlotWindow(slot.startsAt, slot.endsAt, slot.unit)}`,
    priceLabel: formatMoney(slot.priceAmount, slot.currency),
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { confirmationStubAt: stub.sentAt },
  });

  revalidatePath("/sok");
  revalidatePath("/konto");
  revalidatePath("/bedrift/bookinger");
  redirect(`/slot/${slotId}/bekreftelse`);
}
