import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { PageShell } from "@/components/ui";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "BUSINESS" ? "/bedrift" : "/konto");
  const { next } = await searchParams;

  return (
    <PageShell>
      <h1 className="font-serif text-4xl">Logg inn</h1>
      <p className="mt-2 text-muted">Enkel e-post og passord. Demo-kontoer står i README.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-sm">
        Ny her?{" "}
        <Link className="text-clay underline" href="/registrer">
          Lag konto
        </Link>
      </p>
    </PageShell>
  );
}
