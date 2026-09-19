import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./session";

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect("/");
  return session;
}

export async function requireBusiness() {
  const session = await requireRole(["BUSINESS", "ADMIN"]);
  const business = await prisma.business.findUnique({
    where: { userId: session.userId },
  });
  if (!business) redirect("/bedrift/profil");
  return { session, business };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}
