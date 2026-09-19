import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { PageShell } from "@/components/ui";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "BUSINESS" ? "/bedrift" : "/konto");
  const { type } = await searchParams;
  const initialRole = type === "bedrift" ? "BUSINESS" : "CUSTOMER";

  return (
    <PageShell>
      <h1 className="font-serif text-4xl">Lag konto</h1>
      <p className="mt-2 text-muted">
        Kunder booker kalenderhull, ofte under ordinær pris. Bedrifter selger
        ledig kapasitet etter manuell godkjenning.
      </p>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-6 text-sm">
        Har du konto?{" "}
        <Link className="text-clay underline" href="/login">
          Logg inn
        </Link>
      </p>
    </PageShell>
  );
}
