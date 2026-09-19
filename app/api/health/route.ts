import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DB_TIMEOUT_MS = 4000;

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("db_timeout")), DB_TIMEOUT_MS);
      }),
    ]);
    return NextResponse.json({ ok: true, db: "up" }, { headers });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503, headers });
  }
}
