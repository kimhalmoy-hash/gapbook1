import { fremhevetFaq } from "@/lib/fremhevet";
import { mailto, site } from "@/lib/katalog";
import { fyll, type Copy } from "@/lib/i18n";

export function FremhevetSide({ tekst }: { tekst: Copy }) {
  const pris = site.fremhevetPrisKr;
  const faq = fremhevetFaq(pris);
  const emne = "Fremhevet på WeekSlot";
  return (
    <>
      <h1 className="max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">Bli sett av foreldre som planlegger ferieuka</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        WeekSlot viser ukekurs og leirer for barn, sortert etter uke og kommune. Det er gratis å bli lagt inn. Vil du ha mer synlighet, kan du velge Fremhevet.
      </p>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">Grunnoppføring – gratis</h2>
        <ul className="mt-4 grid max-w-2xl gap-2 text-sm">
          <li>Tilbudet ditt vises på sidene for riktig uke, kommune og type aktivitet.</li>
          <li>Foreldre ser alder, tider, pris og lenke til påmeldingen din.</li>
          <li>Påmelding og betaling skjer hos deg, som før.</li>
        </ul>
      </section>
      <section className="ticket mt-8 p-6">
        <h2 className="font-serif text-3xl">{fyll(tekst.featuredPrice, { pris }).replace(/\.$/, "")}</h2>
        <ul className="mt-4 grid max-w-2xl gap-2 text-sm">
          <li>Tilbudet ditt vises øverst på siden for kommunen og uka du velger.</li>
          <li>Det merkes tydelig «Fremhevet» eller «Annonse», så foreldre vet at plasseringen er betalt.</li>
          <li>Du velger selv hvilke kommuner og uker du vil være fremhevet i.</li>
        </ul>
        <p className="mt-4 text-sm">
          Eksempel: Fremhevet i én kommune i vinterferieuka koster {pris} kr. To kommuner samme uke koster {pris * 2} kr.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">Slik kommer du i gang</h2>
        <ol className="mt-4 grid max-w-2xl gap-2 text-sm">
          <li>1. Send oss tilbudet ditt på {site.kontaktEpost}.</li>
          <li>2. Skriv hvilke kommuner og uker du vil være fremhevet i, hvis du ønsker det.</li>
          <li>3. Vi legger det inn og gir beskjed når det er synlig.</li>
        </ol>
        <a href={mailto(emne)} className="mt-5 inline-block rounded-full bg-pine px-6 py-3 text-white hover:bg-pine-mid">
          {tekst.providerCta}
        </a>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">Spørsmål og svar</h2>
        <div className="mt-4 grid max-w-2xl gap-4">
          {faq.map((rad) => (
            <details key={rad.q} className="ticket p-4" open>
              <summary className="cursor-pointer font-medium">{rad.q}</summary>
              <p className="mt-2 text-sm text-muted">{rad.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
