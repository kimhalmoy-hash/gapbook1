import { Flash } from "@/components/Flash";
import { BusinessProfileForm } from "@/components/BusinessProfileForm";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BusinessProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const session = await requireRole(["BUSINESS", "ADMIN"]);
  const { m } = await searchParams;
  const business = await prisma.business.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Bedriftsprofil</h1>
      <p className="mt-2 text-muted">
        Land og by, fag og org.nr. Profilen er ikke offentlig før admin godkjenner.
      </p>
      <Flash message={m} />
      <BusinessProfileForm
        city={business?.city ?? "Oslo"}
        name={business?.name ?? ""}
        orgNr={business?.orgNr ?? ""}
        trades={business?.trades ?? []}
      />
    </div>
  );
}
