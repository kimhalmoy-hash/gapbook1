import Link from "next/link";
import { PageShell } from "@/components/ui";
import { PRODUCT_NAME } from "@/lib/constants";

export default function TrondheimThanksPage() {
  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.22em] text-clay">Trondheim</p>
      <h1 className="mt-2 font-serif text-4xl">Takk – svaret er lagret</h1>
      <p className="mt-4 text-lg text-muted">
        Hvert svar teller når vi bestemmer om {PRODUCT_NAME} åpner i Trondheim. Oppga du
        e-post, får du én melding når det skjer.
      </p>
      <div className="ticket mt-8 p-5">
        <p className="font-medium">Kjenner du en håndverker eller en boligeier i Trondheim?</p>
        <p className="mt-1 text-sm text-muted">
          Del lenken <span className="font-medium text-ink">weekslot.com/trondheim</span> – jo
          flere svar, jo raskere kan vi åpne.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full border border-pine px-5 py-2.5 text-pine hover:bg-pine hover:text-white" href="/sok">
          Se hvordan det fungerer i Oslo
        </Link>
        <Link className="rounded-full px-5 py-2.5 text-muted hover:text-ink" href="/">
          Til forsiden
        </Link>
      </div>
    </PageShell>
  );
}
