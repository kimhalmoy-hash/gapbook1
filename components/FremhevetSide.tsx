import { mailto } from "@/lib/katalog";
import type { Copy } from "@/lib/i18n";

export function FremhevetSide({ tekst }: { tekst: Copy }) {
  return (
    <>
      <h1 className="max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">{tekst.featuredH1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{tekst.featuredIntro}</p>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredGetTitle}</h2>
        <ul className="mt-4 grid max-w-2xl gap-2 text-sm">
          {tekst.featuredGet.map((linje) => (
            <li key={linje}>{linje}</li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-3xl">{tekst.featuredStartTitle}</h2>
        <ol className="mt-4 grid max-w-2xl gap-2 text-sm">
          {tekst.featuredStart.map((linje, i) => (
            <li key={linje}>
              {i + 1}. {linje}
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
          {tekst.featuredFaq.map((rad) => (
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
