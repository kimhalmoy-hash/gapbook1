import { copy } from "@/lib/i18n";

export default function NotFound() {
  const tekst = copy("nb");
  return (
    <main className="mx-auto max-w-3xl px-4 py-24">
      <p className="text-xs uppercase tracking-[0.22em] text-clay">{tekst.tagline}</p>
      <h1 className="mt-4 font-serif text-5xl">{tekst.notFoundTitle}</h1>
      <p className="mt-4 text-lg text-muted">{tekst.notFoundBody}</p>
      <a href="/" className="mt-8 inline-block rounded-full bg-clay px-6 py-3 text-white">
        WeekSlot
      </a>
    </main>
  );
}
