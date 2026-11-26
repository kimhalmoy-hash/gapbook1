# WeekSlot

WeekSlot er oversikten over ukekurs og leirer for barn i skoleferiene, sortert på uke og sted. Foreldre sammenligner og melder på hos arrangøren. Norge først, Norden senere.

Tagline: **Ferieuka, ordnet.**

Inntekten senere er at tilbydere betaler for å bli fremhevet. Prisen er ikke satt. Fremhevede kort merkes «Fremhevet».

## Slik flyter dataene

1. Kildene ligger i `data/kilder/`: `kurs-norge-v3.csv`, `tilbydere-norge-v3.csv`, `skolerute-2027.csv` og `README-supply-v3.md`. Katalogen som nettstedet viser, er `data/leirer.json` (v3, ett objekt per uke). `npm run importer` leser CSV-en og oppdaterer tilbydere og skolerute. Den skriver bare over `leirer.json` med `--leirer`.
2. Importen fyller ikke inn manglende felt. `pameldingStatus` og `pameldingApner` blir `null` til kilden sier noe annet. Personnavn, telefon og e-post tas ut. Åttetall som er en dato, som `01052026`, blir stående.
3. `npm run finn` leser `config/kilder.json` og legger kandidater i `data/kandidater.json` til manuell gjennomgang. Den skriver aldri til `leirer.json` og kopierer ikke lister fra samlesider.
4. `npm run sjekk` sjekker lenkene. 404, 410 eller DNS-feil gir `lenkestatus: "utløpt"` og `dod: true`. 403, 429, 451, 5xx, tidsavbrudd eller en bot-utfordring gir `usikker`. Datoen `kildeSjekket` oppdateres.
5. `npm run valider` sjekker skjema, datoer, uker, URL-er, unike id-er, Hoopit-sperren og at tekstfeltene ikke inneholder e-post eller telefon.
6. `npm run build` kjører validering og bygger et statisk nettsted. Bygget trenger ingen `DATABASE_URL` og ingen database.

Trenger Node 20 eller nyere.

```bash
npm install
npm run importer
npm run valider
npm run build
```

Forhåndsvis med `npx serve out` eller `python3 -m http.server --directory out`.

## Sider

Norsk bokmål er standardspråk, uten prefiks. Svensk og engelsk ligger under `/sv/` og `/en/`. Tekstene ligger i `lib/i18n.ts`.

| Side | Innhold |
| --- | --- |
| `/` | Forside med filter på uke, kommune, type og alder |
| `/vinterferie/2027/`, `/sommerleir/2027/`, `/hostferie/2027/`, `/paske/2027/` | Sesong. Tittelen tar ukene fra skoleruta |
| `/vinterferie/2027/bergen/` | Ferie og kommune sammen: gratis tilbud og betalte kurs, med datoene fra skoleruta |
| `/uke/2027-08/` | Kalenderuke. Tallet og året kommer fra dataene |
| `/by/bergen/` | Tilbud i kommunen og kommunens høstferie, vinterferie og påske, med kilde |
| `/type/idrettsleir/` | Én type |
| `/leir/<id>/` | Ett tilbud, med lenke til påmelding |

Hver side har egen tittel, beskrivelse, canonical og Open Graph. JSON-LD er bare `ItemList` og `BreadcrumbList`.

Lister med færre enn 3 synlige `verifisert`- eller `delvis`-rader får `noindex,follow` og er ute av sitemap. `forventet` vises med «Forventet – 2027-dato ikke publisert ennå» og fjorårsnotatet, men teller ikke med. `delvis` viser hva som mangler. Døde og utløpte rader skjules.

`forventet`-sider og tynne lister indekseres av seg selv når flere verifiserte tilbud kommer inn. Demo-rader (`demo: true`) vises aldri på indekserbare sider.

## Skolerute

`data/skolerute.json` har `skolear` (`"2026-2027"`), feriedatoer, `merknad` og `kildeUrl`. Koden har ingen ferieuker per kommune. Bergen beholder merknaden om at kommunens datoer (01.–05.03.2027) brukes, ikke Lovdata-februar. Tromsø viser de tre høstferiedagene, ikke hele uken.

Kommuner uten rad viser ingen ferie. Sommerferie står ikke i skoleruta, så sommerhuben finner ikke på sommeruker.

Stavanger publiserer skoleruta som åpne data (CSV, JSON og ICS) på opencom.no. Det kan bli en automatisk kilde senere. Det er ikke bygget en henter for den nå.

## Kilder og plattformer

Reglene ligger i `config/kilder.json` og brukes av `finn-leirer.mjs` og `sjekk-lenker.mjs`.

- Hver vert: hent og cache `robots.txt`, hopp over stier som er sperret. User-Agent er `WeekSlotBot/0.1`. Minst 1,5 sekunder mellom forespørsler.
- Cloudflare og annen bot-beskyttelse omgås ikke. Utfordringsside eller 403 blir `usikker`. Ingen nye forsøk med andre triks.
- **Hoopit** hentes aldri. En Hoopit-adresse i `kilder` får valideringen til å feile.
- **Spond Discover** kan bare brukes via sitemap og JSON-LD på arrangementssider, og bare til fakta (dato, pris, sted, lenke). Beskrivelse og bilder lagres ikke.
- **KFUK-KFUM** bare for URL-er som sitemapet lister og robots.txt tillater.
- **Rubic** kan leses som HTML. Interne `/rest/`-kall brukes ikke.
- Andre plattformer er av til de legges inn i `plattformer` med `tillatt: true` og en merknad. LetsReg og DNT står der som av, fordi de ofte svarer med Cloudflare.
- Adresser som ikke er en kjent plattform, regnes som arrangørens egen side når du legger dem i `kilder`.

Slik legger du inn en kilde:

```json
{ "url": "https://eksempel.no/fotballskole", "tilbyder": "Eksempel IL", "kommune": "Oslo" }
```

Kjør `npm run finn`, les `data/kandidater.json`, og flytt det som holder mål inn i CSV-en eller `leirer.json` for hånd. Kjør importer eller valider etterpå.

På sidene vises bare fakta: tittel, tilbyder, dato eller uke, alder, pris og sted, pluss en kort merknad med våre egne ord der vi har en. Ingen kopierte beskrivelser eller bilder. Knappen går til arrangørens påmeldingsside.

## Før publisering

Kontakteposten er en plassholder. Den ligger ett sted:

```json
"kontaktEpost": "{kontakt-epost}"
```

i `config/site.json`. Bytt den til den ekte adressen før nettstedet publiseres. Inntil da peker «Send oss tilbudet ditt» på `mailto:{kontakt-epost}`, så det er synlig at adressen mangler. Det er ikke bygget noe skjema.

Ikke skriv at det er gratis å bli lagt inn. Pris for fremheving er ikke bestemt.

## Det som er tatt ut

Den gamle markedsplassen for håndverkere (Prisma, Postgres, bookinger, innlogging, dashboard, success fee) ligger i `legacy/marketplace/` og bygges ikke. Git-historikken er beholdt. Ingen håndverker-CSV er importert. Bygget kjører uten `DATABASE_URL`.

Vercel-regionen i `vercel.json` er fortsatt `fra1`. Ingenting er deployet herfra, og DNS er ikke endret.

## Skript

| Kommando | Gjør |
| --- | --- |
| `npm run importer` | CSV → `leirer.json`, `tilbydere.json`, `skolerute.json` |
| `npm run finn` | Kandidater fra `config/kilder.json` |
| `npm run sjekk` | Lenkesjekk med robots.txt |
| `npm run valider` | Skjema og personvern |
| `npm run build` | Valider, deretter statisk eksport til `out/` |
| `npm test` | Regler for uke, Hoopit, robots, Spond-utdrag og skolerute |
