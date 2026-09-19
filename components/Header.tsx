import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b border-line/80 bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-serif text-2xl tracking-tight text-pine">
          GapBook
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
          <Link href="/sok" className="text-ink hover:text-clay">
            Se ledig tid
          </Link>
          <Link href="/vilkaar" className="hidden text-muted sm:inline hover:text-ink">
            Vilkår
          </Link>
          {session?.role === "BUSINESS" && (
            <Link href="/bedrift" className="text-ink hover:text-clay">
              Bedrift
            </Link>
          )}
          {session?.role === "CUSTOMER" && (
            <Link href="/konto" className="text-ink hover:text-clay">
              Mine bookinger
            </Link>
          )}
          {session?.role === "ADMIN" && (
            <Link href="/admin" className="text-ink hover:text-clay">
              Admin
            </Link>
          )}
          {session ? (
            <form action={logoutAction}>
              <button className="text-muted hover:text-ink" type="submit">
                Logg ut
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="text-ink hover:text-clay">
                Logg inn
              </Link>
              <Link
                href="/registrer?type=bedrift"
                className="rounded-full bg-pine px-3 py-1.5 text-white hover:bg-pine-mid"
              >
                Selg ledig tid
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
