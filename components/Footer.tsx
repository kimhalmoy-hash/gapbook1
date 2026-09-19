import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-pine text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">{PRODUCT_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-paper/80">
            WeekSlot selger ledig håndverkertid — timer, dager eller uker — til
            synlig pris, før tiden mister verdien. Ikke anbud.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Markeder</p>
          <p className="mt-2 text-paper/80">Oslo, Norge</p>
          <p className="text-paper/80">Stockholm, Sverige</p>
          <p className="mt-2 text-paper/60">Bergen og Göteborg kommer senere.</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">P0</p>
          <Link className="mt-2 block text-paper/80 hover:text-white" href="/vilkaar">
            Låste vilkår
          </Link>
          <Link className="block text-paper/80 hover:text-white" href="/sok">
            Søk ledig tid
          </Link>
          <Link className="block text-paper/80 hover:text-white" href="/registrer">
            Lag konto
          </Link>
        </div>
      </div>
    </footer>
  );
}
