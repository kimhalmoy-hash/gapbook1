import { PageShell } from "@/components/ui";
import { PRODUCT_TAGLINES } from "@/lib/i18n";

export default function TermsPage() {
  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.18em] text-clay">Låst P0 · 2026-09-19</p>
      <h1 className="mt-2 font-serif text-4xl">Vilkår</h1>
      <div className="mt-6 space-y-6 text-[17px] leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl">Posisjonering</h2>
          <p className="mt-2 text-muted">{PRODUCT_TAGLINES.nb}</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Fag</h2>
          <p className="mt-2 text-muted">
            Maling/tapetsering, elektriker, rørlegger, tømrer/snekker, flis/mur, tak.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Geografi</h2>
          <p className="mt-2 text-muted">
            NO+SE først: Oslo + Stockholm, deretter Bergen/Göteborg. DK(+FI) senere.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Booking-enhet</h2>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>Min: 3 timer</li>
            <li>Maks: 1 uke</li>
            <li>Enheter: timer (≥3), dag, uke — synlig pris</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Penger</h2>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>Ingen kunde-depositum</li>
            <li>Jobbpenger: direkte bedrift ↔ kunde</li>
            <li>WeekSlot: 5 % success fee til bedrift i etterkant (månedlig faktura)</li>
            <li>Launch: 0 % på første 2 bookinger per bedrift, deretter 5 %</li>
            <li>Ikke mellommann på hovedbeløpet</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Avtale</h2>
          <p className="mt-2 text-muted">
            Digital bookingavtale (checkbox + timestamp) ved book. Kunde møter/er
            klar; sen avbestilling (&lt;48 t) kan utløse bedriftens eget
            avbestillingsgebyr (maks synlig på slot; håndheves mellom partene).
            Bedrift holder avsatt tid / «passer til»; egen avlys → ombooking/klage +
            synlighetstrekk ved gjentakelse.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
