"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function setBusinessApprovalAction(
  businessId: string,
  approved: boolean,
) {
  await requireAdmin();
  await prisma.business.update({
    where: { id: businessId },
    data: { approved },
  });
  revalidatePath("/admin");
  revalidatePath("/sok");
}
