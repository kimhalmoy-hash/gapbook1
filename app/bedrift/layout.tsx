import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const links = [
  { href: "/bedrift", label: "Oversikt" },
  { href: "/bedrift/profil", label: "Profil" },
  { href: "/bedrift/slot", label: "Slots" },
  { href: "/bedrift/bookinger", label: "Bookinger & gebyr" },
];

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["BUSINESS", "ADMIN"]);
  const business = await prisma.business.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Bedrift</p>
        <p className="mt-1 font-serif text-2xl">{business?.name ?? "Ny bedrift"}</p>
        <p className="mt-1 text-sm text-muted">
          {business?.approved ? "Godkjent" : "Venter på godkjenning"}
        </p>
        <nav className="mt-6 grid gap-2 text-sm">
          {links.map((link) => (
            <Link className="hover:text-clay" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
