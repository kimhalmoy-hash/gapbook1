import { Fragment } from "react";
import { erIntern, tilpassLenker, type Inline } from "@/lib/guide.mjs";
import { guideFor } from "@/lib/guide-data";
import { finnRute, indekserbar, type Rute } from "@/lib/katalog";

function harSide(href: string): boolean {
  const rute = finnRute(href.split("/").filter(Boolean));
  return !!rute && indekserbar(rute);
}

function Linje({ deler }: { deler: Inline[] }) {
  return (
    <>
      {deler.map((d, i) =>
        d.t === "lenke" ? (
          <a key={i} className="text-pine hover:underline" href={d.href} {...(erIntern(d.href) ? {} : { rel: "noopener noreferrer" })}>
            {d.tekst}
          </a>
        ) : d.fet ? (
          <strong key={i}>{d.tekst}</strong>
        ) : (
          <Fragment key={i}>{d.tekst}</Fragment>
        ),
      )}
    </>
  );
}

/** Guidetekst under leirlisten på /vinterferie/ og /sommerleir/ (nb). Lenker uten indekserbar side vises som vanlig tekst. */
export function SesongGuide({ rute }: { rute: Rute }) {
  const guide = guideFor(rute);
  if (!guide) return null;
  const blokker = tilpassLenker(guide.blokker, harSide);
  return (
    <div id="guide" className="mt-16 max-w-4xl">
      {blokker.map((b, i) => {
        if (b.type === "h2") return <h2 key={i} className="mt-12 font-serif text-3xl">{b.tekst}</h2>;
        if (b.type === "h3") return <h3 key={i} className="mt-8 font-serif text-2xl">{b.tekst}</h3>;
        if (b.type === "p") return <p key={i} className="mt-3 text-lg"><Linje deler={b.deler} /></p>;
        if (b.type === "ul" || b.type === "ol") {
          const Liste = b.type === "ul" ? "ul" : "ol";
          return (
            <Liste key={i} className={`mt-3 grid gap-2 pl-6 text-lg ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
              {b.punkter.map((p, j) => (
                <li key={j}><Linje deler={p} /></li>
              ))}
            </Liste>
          );
        }
        return (
          <div key={i} className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {b.hode.map((c, j) => (
                    <th key={j} className={`px-3 py-2 font-medium ${b.justering[j] === "hoyre" ? "text-right" : ""}`}><Linje deler={c} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rader.map((rad, j) => (
                  <tr key={j} className="border-b border-line align-top">
                    {rad.map((c, k) => (
                      <td key={k} className={`px-3 py-2 ${c.map((d) => d.tekst).join("").length < 22 ? "whitespace-nowrap " : ""}${b.justering[k] === "hoyre" ? "text-right" : ""}`}><Linje deler={c} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
