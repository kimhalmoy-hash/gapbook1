import { redirect } from "next/navigation";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Short link used in the first Trondheim test; the form now lives at /interesse. */
export default async function TrondheimRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = (one(params.s) ?? "").replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
  redirect(`/interesse?city=Trondheim${source ? `&s=${source}` : ""}`);
}
