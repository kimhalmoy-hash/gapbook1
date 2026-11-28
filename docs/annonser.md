# Samtykke og annonser

Status: bygget, men AV. Standard er at nettstedet ikke laster noen annonsekode.

## Hva som alltid er med (bryter AV og PÅ)

- Personvern på tre språk: `/personvern/`, `/sv/integritet/`, `/en/privacy/`. Teksten ligger ordrett i `data/personvern/{nb,sv,en}.md` og vises av `lib/personvern.mjs`. Adressene er de samme som før.
- `public/ads.txt`: `google.com, pub-5902367729233688, DIRECT, f08c47fec0942fa0` (lagt til på main separat).

## Hva som bare er med når bryteren er PÅ

- Consent Mode v2 i `<head>`: `ad_storage`, `ad_user_data`, `ad_personalization` og `analytics_storage` er `denied` (`lib/samtykke.mjs`). Det ligger før alle tredjepartsskript.
- Lenken «Samtykkeinnstillinger» / «Samtyckesinställningar» / «Consent settings» i footeren (`id="samtykkeinnstillinger"`) og klikkhåndteringen som åpner samtykkevalget på nytt (også for lenken i personverntekstene).
- AdSense-taggen (som også leverer samtykkemeldingen), annonseplassene og utgiver-ID-en.

## Bryteren

Én konstant: `ADSENSE_AKTIV` i `lib/annonser.mjs`. Standard `false`.

| | AV (standard) | PÅ |
|---|---|---|
| Google-, samtykke- og gtag-kode, utgiver-ID, footerlenke for samtykke | ingen, verken i HTML eller JS | med |
| Annonseplasser i HTML | ingen (ingen ramme, ingen tom boks) | faste plasser, se under |
| AdSense-taggen `adsbygoogle.js?client=ca-pub-5902367729233688` (eneste lastepunkt, leverer også CMP-meldingen) | ikke på siden | settes inn fra et inline-skript i `<head>`, rett etter consent-standarden. Det finnes ingen egen Funding Choices-tag |
| `adsbygoogle.js` / `pagead2` | finnes ikke i HTML eller JS | taggen lastes på alle sider (meldingen må kunne vises overalt), men ingen forespørsel sendes før samtykke |
| Annonseforespørsel (`adsbygoogle.push`) | aldri | bare etter samtykke (`CONSENT_MODE_DATA_READY` med `ad_storage` gitt), bare i plasser med enhet-ID |

Bryteren er også en byggekonstant (`NEXT_PUBLIC_WEEKSLOT_ADSENSE`, satt i `next.config.ts`), så annonsekoden fjernes fra JS-bunten når den er AV.

### Slik slår du den PÅ

Status: kontoen er godkjent for samtykke, og CMP-meldingen er publisert i AdSense (Privacy & messaging, GDPR, nb/en/sv/de, personvern-URL `/personvern/`). Meldingen leveres av selve AdSense-taggen, så det trengs ingen egen snippet.

1. Opprett to annonseenheter i AdSense (en horisontal 728×90 / 320×100 og en rektangel 300×250) og skriv enhet-ID-ene inn i `ENHET_IDER` i `lib/annonser.mjs` (`H` og `R`). Tom ID betyr at plassen tegnes, men ikke sender forespørsel.
2. Sjekk at `UTGIVER_ID` i `lib/annonser.mjs` er den godkjente kontoens ID (`pub-5902367729233688`, samme som i `public/ads.txt`).
3. Sett `ADSENSE_AKTIV = true` i `lib/annonser.mjs` (egen PR, med forhåndsvisning).
4. Test i forhåndsvisningen med `?fc=alwaysshow&fctype=gdpr`. Meldingen skal da vises uansett region. Sjekk at:
   - «Ikke samtykk» er synlig i første lag;
   - meldingen vises bare én gang (taggen er eneste lastepunkt);
   - ingen annonseforespørsel og ingen annonsecookies kommer før valget (nettverksfanen: ingen kall til `/pagead/ads` før samtykke);
   - avslag gir tomme bokser med uendret høyde;
   - lenken «Samtykkeinnstillinger» i footeren åpner valget på nytt.
5. `npm run build` kjører `scripts/sjekk-eksport.mjs --streng` og feiler hvis plasser havner på feil sider, taggen står mer enn én gang eller før consent-standarden, eller en annonseforespørsel ligger i HTML-en.

Rekkefølgen i `<head>` er: (1) inline Consent Mode-standard (alt `denied`), (2) inline-skriptet som setter inn AdSense-taggen. Annonseforespørslene (`adsbygoogle.push`) styres av `components/Samtykke.tsx` og skjer først etter at Googles CMP melder at `ad_storage` er gitt (eller ikke gjelder).

Lokalt kan du bygge med `WEEKSLOT_ADSENSE=on npm run build` uten å endre fila (`off` tvinger AV).

## Annonseplasser (bryter PÅ)

Etter `plasseringskart.md`. Logikken ligger i `annonsePlasser()` i `lib/annonser.mjs`.

| Sidetype | Plasser |
|---|---|
| Forside `/` | H-1 (etter «Slik virker det»), R-2 (etter «Utforsk») |
| Kommune/skolerute, kommune + ferie, ukeside, fylke, temaside, feriehub | H-1 før listen, R-2 etter listen, H-3 mellom rad to og tre når det er minst ni kort |
| Leirdetalj `/leir/<id>/` | R-1 etter ukeradene, bare når siden har en ukeliste (mer enn én uke) |

Ingen plasser på: `/arrangor/` (nb/sv/en), personvernsidene, noindex-sider, 404 og sider med tom liste. Maks tre per side. Aldri over H1 eller i headeren, aldri inne i rutenettet eller rett under en lenke.

Høyde: H = 128 px (28 px merkelapp + 100 px flate), R = 278 px (28 + 250). Boksen har fast `height` og `overflow: hidden`, tegnes i den statiske HTML-en og endres aldri, så CLS er 0. Merkelapp: «Annonse», «Annons», «Advertisement».

### Hvorfor plassene ikke tegnes når bryteren er AV

Tre mulige løsninger ble vurdert for AV-tilstanden: (a) tom boks med reservert høyde, (b) boks skjult med CSS, (c) ingenting i HTML-en. Valgt er (c): det er det mest skjulte og stabile. Besøkende og søkemotorer ser ingen rare tomme rammer, og det finnes ingen merkelapp uten annonse. Siden plassene er med i den statiske HTML-en med fast høyde fra første byte når bryteren er PÅ, hopper ikke layouten når den slås på, og ikke når samtykke gis senere.

## Kontroller

- `npm test`: enhetstester (bryter, consent, plasser, ads.txt, personvern). Når `out/` finnes, kjører den også `sjekk-eksport` mot sitemap-baselinen.
- `npm run build`: `valider`, `next build`, og så `sjekk-eksport --streng`, som går gjennom all eksportert HTML:
  - med bryteren AV: ingen `adsbygoogle`, `pagead2`, `googlesyndication`, `fundingchoices`, `googlefc`, `gtag(`, `dataLayer`, Consent Mode-parametere, `ca-pub`/`pub-5902367729233688` eller annonsemerker i noen fil (unntatt `ads.txt`), ingen footerlenke for samtykke og ingen plasser;
  - med bryteren PÅ: plasser bare på tillatte sider, merket, maks tre, ingen `<ins>` i HTML-en og ingen `<script src>` til `adsbygoogle.js` (taggen settes inn fra inline-skriptet);
  - med bryteren PÅ: consent-standarden før AdSense-taggen i `<head>`, taggen nøyaktig én gang, ingen egen Funding Choices-tag, og footerlenken;
  - alltid: personvernsidene og `ads.txt`.
- `node scripts/sjekk-eksport.mjs --baseline tests/fixtures/sitemap-main-558c160.txt`: alle 656 URL-ene fra main (558c160) må fortsatt stå i `sitemap.xml`. Baselinen er fra denne PR-en; senere dataendringer kan legitimt endre sitemapen, så den brukes ikke i `npm run build`.

## Kjente begrensninger

- Annonser som allerede er lastet fjernes ikke hvis besøkende trekker samtykket tilbake i samme sidevisning. De er borte ved neste sidevisning.
- Taggen lastes på alle sider, også på `/arrangor/` og personvernsidene, fordi samtykkemeldingen må kunne vises og trekkes tilbake overalt. Det vises ingen annonser der.
