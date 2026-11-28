import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AnnonseStyring, SamtykkeKlikk } from "@/components/Samtykke";
import { UTGIVER_ID, adsenseAktiv } from "@/lib/annonser.mjs";
import { site } from "@/lib/katalog";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/samtykke.mjs";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { absolute: `${site.name} — ${site.tagline}` },
  description: "WeekSlot samler ukekurs og leirer for barn i hver skoleferie, sortert etter uke og by.",
  // Google Search Console-eierskap. Ikke sporing, og ligger ikke bak annonsebryteren.
  verification: { google: "0CfmAsDHRiYgWd0tkUvANmORacYnevcxLqZ5sQW47Uo" },
};

// AdSense-taggen er eneste lastepunkt. Den leverer også samtykkemeldingen (Privacy & messaging), så det finnes
// ingen egen Funding Choices-tag. Settes inn fra et inline-skript rett etter consent-standarden, så den aldri
// havner foran den. Selve annonseforespørslene (push) skjer først etter samtykke, se components/Samtykke.tsx.
const adsenseTagSkript = () =>
  `(function(){var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${UTGIVER_ID}';document.head.appendChild(s);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const annonser = adsenseAktiv();
  return (
    <html lang="nb" className={`${display.variable} ${body.variable} h-full`}>
      <head>
        {annonser ? (
          <>
            {/* Consent Mode v2: alt «denied» som standard, før noe annet skript. Står før alle tredjepartsskript (Next legger egne async-chunks av eget domene først; de rører ikke Google). Hele samtykkeoppsettet ligger bak bryteren. */}
            <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
            <script dangerouslySetInnerHTML={{ __html: adsenseTagSkript() }} />
          </>
        ) : null}
      </head>
      <body className="min-h-full antialiased">
        {children}
        {annonser ? (
          <>
            <SamtykkeKlikk />
            <AnnonseStyring />
          </>
        ) : null}
      </body>
    </html>
  );
}
