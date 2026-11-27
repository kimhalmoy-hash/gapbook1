import { fremhevetFaq } from "@/lib/fremhevet";
import { mailto, site } from "@/lib/katalog";
import { fyll, type Copy } from "@/lib/i18n";

export function FremhevetSide({ tekst }: { tekst: Copy }) {
  const pris = site.fremhevetPrisKr;
  const topp = site.toppKategoriPrisKr;
  const pakke = site.sesongpakkePrisKr;
  const epost = site.kontaktEpost;
  const faq = fremhevetFaq(tekst, epost);
  return (
    <>
      <h1 className="max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">{tekst.featuredH1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{tekst.featuredIntro}</p>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredBasicTitle}</h2>
        <ul className="mt-4 grid max-w-2xl gap-2 text-sm">
          {tekst.featuredBasic.map((linje) => (
            <li key={linje}>{linje}</li>
          ))}
        </ul>
      </section>
      <section className="ticket mt-8 p-6">
        <h2 className="font-serif text-3xl">{fyll(tekst.featuredTierTitle, { pris })}</h2>
        <ul className="mt-4 grid max-w-2xl gap-2 text-sm">
          {tekst.featuredTier.map((linje) => (
            <li key={linje}>{linje}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm">{fyll(tekst.featuredExample, { pris, dobbel: pris * 2 })}</p>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredPacksTitle}</h2>
        <div className="mt-4 grid max-w-2xl gap-4">
          <article className="ticket p-6">
            <h3 className="font-serif text-2xl">{fyll(tekst.featuredTopTitle, { pris: topp })}</h3>
            <p className="mt-3 text-sm">{tekst.featuredTopBody}</p>
          </article>
          <article className="ticket p-6">
            <h3 className="font-serif text-2xl">{fyll(tekst.featuredSeasonTitle, { pris: pakke })}</h3>
            <p className="mt-3 text-sm">{tekst.featuredSeasonBody}</p>
          </article>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredStartTitle}</h2>
        <ol className="mt-4 grid max-w-2xl gap-2 text-sm">
          {tekst.featuredStart.map((linje, i) => (
            <li key={linje}>
              {i + 1}. {fyll(linje, { epost })}
            </li>
          ))}
        </ol>
        <a href={mailto(tekst.featuredSubject)} className="mt-5 inline-block rounded-full bg-pine px-6 py-3 text-white hover:bg-pine-mid">
          {tekst.featuredCta}
        </a>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredFaqTitle}</h2>
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
