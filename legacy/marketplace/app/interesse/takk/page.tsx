import Link from "next/link";
import { PageShell } from "@/components/ui";
import { PRODUCT_NAME } from "@/lib/constants";
import { normalizeCity } from "@/lib/interest";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InterestThanksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const city = normalizeCity(one(params.city) ?? "");
  const where = city ? `i ${city}` : "der du bor";

  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.22em] text-clay">Takk</p>
      <h1 className="mt-2 font-serif text-4xl">Svaret er lagret</h1>
      <p className="mt-4 text-lg text-muted">
        Hvert svar teller når vi bestemmer hvor {PRODUCT_NAME} åpner først. Oppga du
        e-post, får du én melding når vi åpner {where}.
      </p>
      <div className="ticket mt-8 p-5">
        <p className="font-medium">Kjenner du en håndverker eller en boligeier {where}?</p>
        <p className="mt-1 text-sm text-muted">
          Del lenken <span className="font-medium text-ink">weekslot.com/interesse</span> – jo
          flere svar fra samme sted, jo raskere kan vi åpne der.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full border border-pine px-5 py-2.5 text-pine hover:bg-pine hover:text-white" href="/sok">
          Se hvordan det kommer til å fungere
        </Link>
        <Link className="rounded-full px-5 py-2.5 text-muted hover:text-ink" href="/">
          Til forsiden
        </Link>
      </div>
    </PageShell>
  );
}
