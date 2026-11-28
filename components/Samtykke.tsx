"use client";

import { useEffect } from "react";

// Kompileres inn ved bygging (next.config.ts). AV: grenen under fjernes, og ingen annonsekode ligger i JS-en.
const ANNONSER_PA = process.env.NEXT_PUBLIC_WEEKSLOT_ADSENSE === "on";
const UTGIVER_ID = process.env.NEXT_PUBLIC_WEEKSLOT_UTGIVER || "";

type Googlefc = {
  callbackQueue?: unknown[];
  showRevocationMessage?: () => void;
  getGoogleConsentModeValues?: () => Record<string, number>;
  ConsentModePurposeStatusEnum?: Record<string, number>;
};
type AdsWindow = Window & { googlefc?: Googlefc; adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number } };

function kø(w: AdsWindow) {
  w.googlefc = w.googlefc || {};
  w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
  return w.googlefc.callbackQueue;
}

/**
 * Lenken «Samtykkeinnstillinger» (footeren og teksten på personvernsiden) åpner samtykkevalget på nytt.
 * Før Googles CMP finnes, skjer det ingenting; klikket står i kø til CMP-en er klar.
 */
export function SamtykkeKlikk() {
  useEffect(() => {
    if (!ANNONSER_PA) return;
    const w = window as AdsWindow;
    function klikk(e: MouseEvent) {
      const lenke = (e.target as Element | null)?.closest?.('a[href="#samtykkeinnstillinger"]');
      if (!lenke) return;
      e.preventDefault();
      if (typeof w.googlefc?.showRevocationMessage === "function") {
        w.googlefc.showRevocationMessage();
        return;
      }
      kø(w).push({ CONSENT_API_READY: () => w.googlefc?.showRevocationMessage?.() });
    }
    document.addEventListener("click", klikk);
    return () => document.removeEventListener("click", klikk);
  }, []);
  return null;
}

/**
 * Annonsestyring, bare med bryteren PÅ. Ingen annonseforespørsel før samtykke:
 *  1. venter på CONSENT_MODE_DATA_READY fra Googles CMP (grunnleggende modus)
 *  2. fyller plassene (annonseforespørsel) først når ad_storage er gitt (eller ikke gjelder)
 *  3. uten samtykke: ingen forespørsel, og de reserverte boksene blir stående tomme
 * AdSense-taggen selv (som også leverer samtykkemeldingen) settes inn i <head> av layout, rett etter consent-standarden.
 */
export function AnnonseStyring() {
  useEffect(() => {
    if (!ANNONSER_PA) return;
    const w = window as AdsWindow;
    let startet = false;

    function start(personlig: boolean) {
      if (startet) return;
      startet = true;
      const annonser = (w.adsbygoogle = w.adsbygoogle || []);
      annonser.requestNonPersonalizedAds = personlig ? 0 : 1;
      document.querySelectorAll<HTMLElement>("[data-annonse-plass]").forEach((plass) => {
        const enhet = plass.dataset.annonseEnhet;
        const flate = plass.querySelector(".annonse-flate");
        if (!enhet || !flate) return; // ingen enhet-ID ennå: ingen forespørsel
        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.setAttribute("data-ad-client", `ca-${UTGIVER_ID}`);
        ins.setAttribute("data-ad-slot", enhet);
        flate.appendChild(ins);
        annonser.push({});
      });
    }

    kø(w).push({
      CONSENT_MODE_DATA_READY: () => {
        const fc = w.googlefc;
        const verdier = fc?.getGoogleConsentModeValues?.();
        const E = fc?.ConsentModePurposeStatusEnum;
        if (!verdier || !E) return;
        const gitt = (v: number | undefined) =>
          v === E.CONSENT_MODE_PURPOSE_STATUS_GRANTED || v === E.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE;
        if (!gitt(verdier.adStoragePurposeConsentStatus)) return;
        start(gitt(verdier.adUserDataPurposeConsentStatus) && gitt(verdier.adPersonalizationPurposeConsentStatus));
      },
    });
  }, []);
  return null;
}
