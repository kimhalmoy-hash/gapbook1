import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-serif text-4xl">Ikke funnet</h1>
      <p className="mt-3 text-muted">Siden eller sloten finnes ikke.</p>
      <Link className="mt-6 inline-block text-clay underline" href="/">
        Til forsiden
      </Link>
    </div>
  );
}
