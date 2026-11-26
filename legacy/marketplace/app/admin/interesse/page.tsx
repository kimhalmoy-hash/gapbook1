import Link from "next/link";
import type { InterestRole } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  normalizeCity,
  questionsFor,
  type InterestAnswers,
  type InterestQuestion,
} from "@/lib/interest";
import { prisma } from "@/lib/prisma";

type Row = {
  id: string;
  role: InterestRole;
  city: string;
  answers: InterestAnswers;
  email: string | null;
  postcode: string | null;
  source: string | null;
  createdAt: Date;
};

function tally(rows: Row[], q: InterestQuestion) {
  const counts = new Map<string, number>(q.options.map((o) => [o, 0]));
  let answered = 0;
  for (const row of rows) {
    const value = row.answers[q.id];
    if (value === undefined) continue;
    answered += 1;
    for (const v of Array.isArray(value) ? value : [value]) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return { answered, counts };
}

function RoleBlock({ title, rows, role }: { title: string; rows: Row[]; role: InterestRole }) {
  const withEmail = rows.filter((r) => r.email).length;
  return (
    <section className="mt-10">
      <h2 className="font-serif text-3xl">
        {title} <span className="text-muted">· {rows.length} svar</span>
      </h2>
      <p className="mt-1 text-sm text-muted">
        {withEmail} oppga e-post ({rows.length ? Math.round((withEmail / rows.length) * 100) : 0} %).
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {questionsFor(role).map((q) => {
          const { answered, counts } = tally(rows, q);
          return (
            <div className="ticket p-4" key={q.id}>
              <p className="font-medium">{q.label}</p>
              <p className="text-xs text-muted">
                {answered} svarte{q.multi ? " · flere valg mulig" : ""}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {q.options.map((opt) => {
                  const n = counts.get(opt) ?? 0;
                  const pct = answered ? Math.round((n / answered) * 100) : 0;
                  return (
                    <li key={opt}>
                      <div className="flex justify-between gap-3">
                        <span>{opt}</span>
                        <span className="tabular-nums text-muted">
                          {n} · {pct} %
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded bg-paper-2">
                        <div className="h-1.5 rounded bg-pine" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InterestAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const cityFilter = normalizeCity(one(params.city) ?? "");
  const all = (await prisma.interest.findMany({
    orderBy: { createdAt: "desc" },
  })) as unknown as Row[];
  const rows = cityFilter ? all.filter((r) => r.city === cityFilter) : all;

  const customers = rows.filter((r) => r.role === "CUSTOMER");
  const businesses = rows.filter((r) => r.role === "BUSINESS");
  const bySource = new Map<string, number>();
  for (const r of rows) {
    const key = r.source || "(ukjent)";
    bySource.set(key, (bySource.get(key) ?? 0) + 1);
  }
  const byCity = new Map<string, { total: number; customers: number; businesses: number; emails: number }>();
  for (const r of all) {
    const c = byCity.get(r.city) ?? { total: 0, customers: 0, businesses: 0, emails: 0 };
    c.total += 1;
    if (r.role === "BUSINESS") c.businesses += 1;
    else c.customers += 1;
    if (r.email) c.emails += 1;
    byCity.set(r.city, c);
  }
  const cityRows = [...byCity.entries()].sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-clay">Admin</p>
      <h1 className="mt-2 font-serif text-4xl">
        Interesse{cityFilter ? ` – ${cityFilter}` : " – alle steder"}
      </h1>
      <p className="mt-2 text-muted">
        Svar fra <code>/interesse</code>. {rows.length} {cityFilter ? "her" : "totalt"} ·{" "}
        {customers.length} privatpersoner · {businesses.length} bedrifter.{" "}
        {cityFilter ? (
          <Link className="underline" href="/admin/interesse">
            Vis alle steder
          </Link>
        ) : null}{" "}
        <Link className="underline" href="/admin">
          Tilbake til godkjenning
        </Link>
      </p>
      {bySource.size > 0 ? (
        <p className="mt-2 text-sm text-muted">
          Kilde (?s=): {[...bySource.entries()].map(([k, v]) => `${k} ${v}`).join(" · ")}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Per sted</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2 pr-3">Svar</th>
                <th className="py-2 pr-3">Privat</th>
                <th className="py-2 pr-3">Bedrifter</th>
                <th className="py-2 pr-3">E-post</th>
              </tr>
            </thead>
            <tbody>
              {cityRows.map(([city, c]) => (
                <tr className="border-t border-line" key={city}>
                  <td className="py-2 pr-3">
                    <Link className="underline" href={`/admin/interesse?city=${encodeURIComponent(city)}`}>
                      {city}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{c.total}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.customers}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.businesses}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.emails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RoleBlock role="CUSTOMER" rows={customers} title="Privatpersoner" />
      <RoleBlock role="BUSINESS" rows={businesses} title="Håndverksbedrifter" />

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Alle svar</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-3">Tid</th>
                <th className="py-2 pr-3">Rolle</th>
                <th className="py-2 pr-3">Sted</th>
                <th className="py-2 pr-3">Postnr</th>
                <th className="py-2 pr-3">E-post</th>
                <th className="py-2 pr-3">Kilde</th>
                <th className="py-2 pr-3">Svar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-t border-line align-top" key={r.id}>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {r.createdAt.toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="py-2 pr-3">{r.role === "BUSINESS" ? "Bedrift" : "Privat"}</td>
                  <td className="py-2 pr-3">{r.city}</td>
                  <td className="py-2 pr-3">{r.postcode ?? ""}</td>
                  <td className="py-2 pr-3">{r.email ?? ""}</td>
                  <td className="py-2 pr-3">{r.source ?? ""}</td>
                  <td className="py-2 pr-3 text-muted">
                    {Object.entries(r.answers)
                      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
