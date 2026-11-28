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
};

// Googles Funding Choices-tag (samtykkemeldingen fra Privacy & messaging). Bare med AdSense-bryteren PÅ.
const fundingChoicesSkript = () =>
  `(function(){var s=document.createElement('script');s.async=true;s.src='https://fundingchoicesmessages.google.com/i/${UTGIVER_ID}?ers=1';document.head.appendChild(s);})();`;
const SIGNAL_GOOGLEFC_PRESENT = `(function(){function s(){if(!window.frames['googlefcPresent']){if(document.body){var i=document.createElement('iframe');i.style='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;';i.style.display='none';i.name='googlefcPresent';document.body.appendChild(i);}else{setTimeout(s,0);}}}s();})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const annonser = adsenseAktiv();
  return (
    <html lang="nb" className={`${display.variable} ${body.variable} h-full`}>
      <head>
        {/* Consent Mode v2: alt «denied» som standard, før noe annet skript. Står før alle tredjepartsskript (Next legger egne async-chunks av eget domene først; de rører ikke Google). */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
        {annonser ? (
          <>
            {/* Lastes fra eget inline-skript, rett etter consent-standarden, så den aldri havner foran den. */}
            <script dangerouslySetInnerHTML={{ __html: fundingChoicesSkript() + SIGNAL_GOOGLEFC_PRESENT }} />
          </>
        ) : null}
      </head>
      <body className="min-h-full antialiased">
        {children}
        <SamtykkeKlikk />
        {annonser ? <AnnonseStyring /> : null}
      </body>
    </html>
  );
}
