/**
 * Én ærlig User-Agent, robots.txt, lav fart.
 * Utfordringsside eller 403/429/451/5xx blir usikker. Ingen nye forsøk og ingen omgåelse.
 */
import { stiTillatt } from "./robots.mjs";

const UTF_TITTEL =
  /^(one moment,? please|just a moment|attention required|checking your browser|please wait|ddos-guard|verify(ing)? (that )?you are (a )?human|are you a robot)/i;
const UTF_MERKE = /_cf_chl_opt|id="challenge-form"|cf-browser-verification|cf-challenge-running/i;

export function erUtfordring(html) {
  const tittel = ((String(html).match(/<title[^>]*>([^<]*)/i) || [])[1] || "")
    .replace(/&nbsp;|\s+/g, " ")
    .trim();
  return (
    UTF_TITTEL.test(tittel) ||
    UTF_MERKE.test(html) ||
    (html.length < 15000 &&
      /g-recaptcha|h-captcha|hcaptcha|cf-turnstile/i.test(html) &&
      /captcha|robot|human|verif|security check/i.test(tittel))
  );
}

async function lesStart(response, maks = 65536) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const dekoder = new TextDecoder();
  let tekst = "";
  try {
    while (tekst.length < maks) {
      const { done, value } = await reader.read();
      if (done) break;
      tekst += dekoder.decode(value, { stream: true });
    }
  } catch {
    /* avbrutt lesing er nok */
  }
  reader.cancel().catch(() => {});
  return tekst;
}

export function lagHenter(config) {
  const ua = config.userAgent;
  const ventetid = Number(config.rateLimitMs) || 1500;
  const cache = new Map();
  let sist = 0;

  async function vent() {
    const igjen = sist + ventetid - Date.now();
    if (igjen > 0) await new Promise((r) => setTimeout(r, igjen));
    sist = Date.now();
  }

  async function hentRobots(origin) {
    if (cache.has(origin)) return cache.get(origin);
    await vent();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(`${origin}/robots.txt`, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": ua, accept: "text/plain,*/*" },
      });
      if (res.status === 404) {
        const verdi = { status: "ingen" };
        cache.set(origin, verdi);
        return verdi;
      }
      const body = await lesStart(res);
      if (res.status === 403 || res.status === 429 || res.status === 451 || res.status >= 500 || erUtfordring(body)) {
        const verdi = { status: "usikker", info: res.status };
        cache.set(origin, verdi);
        return verdi;
      }
      if (res.status >= 400) {
        const verdi = { status: "usikker", info: res.status };
        cache.set(origin, verdi);
        return verdi;
      }
      const verdi = { status: "ok", text: body };
      cache.set(origin, verdi);
      return verdi;
    } catch (err) {
      const info = err?.name === "AbortError" ? "tidsavbrudd" : err?.cause?.code || err?.message;
      const verdi = { status: "usikker", info };
      cache.set(origin, verdi);
      return verdi;
    } finally {
      clearTimeout(timer);
    }
  }

  async function hent(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return { usikker: true, info: "ugyldig-url" };
    }
    const robots = await hentRobots(parsed.origin);
    if (robots.status === "usikker") return { usikker: true, info: `robots:${robots.info}` };
    if (robots.status === "ok") {
      const sti = `${parsed.pathname}${parsed.search}`;
      if (!stiTillatt(robots.text, sti, ua)) return { hoppet: true, info: "robots.txt" };
    }
    await vent();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "user-agent": ua,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "nb-NO,nb;q=0.9,en;q=0.5",
        },
      });
      const body = res.status < 400 || res.status === 403 ? await lesStart(res) : "";
      if (res.status < 400 && erUtfordring(body)) return { usikker: true, info: "utfordring" };
      if (res.status < 400) return { ok: true, status: res.status, body, robots: robots.text || "" };
      if (res.status === 404 || res.status === 410) return { dod: true, info: res.status };
      if (res.status === 403 || res.status === 429 || res.status === 451 || res.status >= 500) {
        return { usikker: true, info: res.status };
      }
      return { usikker: true, info: res.status };
    } catch (err) {
      const kode = err?.name === "AbortError" ? "tidsavbrudd" : err?.cause?.code || err?.message || "feil";
      if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(String(kode))) return { dod: true, info: kode };
      return { usikker: true, info: kode };
    } finally {
      clearTimeout(timer);
    }
  }

  return { hent, hentRobots };
}
