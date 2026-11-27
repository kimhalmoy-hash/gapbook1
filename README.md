# WeekSlot

WeekSlot er oversikten over ukekurs og leirer for barn i skoleferiene, sortert på uke og sted. Foreldre sammenligner og melder på hos arrangøren. Norge først, Norden senere.

Tagline: **Ferieuka, ordnet.**

Inntekten er at tilbydere betaler for synlighet. Prisene ligger i `config/site.json`: `fremhevetPrisKr` 290 kr per kommune per uke, `toppKategoriPrisKr` 690 kr per ferie og `sesongpakkePrisKr` 990 kr per ferie, for vinter-, påske- og høstferien. Grunnoppføring er gratis. Fremhevede kort merkes «Fremhevet».

## Slik flyter dataene

1. Kildene ligger i `data/kilder/`: `tilbydere-norge-v8.csv`, `skolerute-2027-alle.csv`, `sjekk-plan.md`, `README-supply-v8.md` og `endringer-v8.md`. Katalogen som nettstedet viser, er `data/leirer.json` (Supply v8, 624 objekter, ett per uke). `kurs-norge-v8.csv` fulgte ikke med, så `npm run importer` skriver tilbydere og skolerute, og rører ikke `leirer.json`.

Sommeruker med status `forventet` har uketall fra året før. De vises som «Forventet sommeren 2027 · i 2026: uke 25», ikke som en bekreftet uke i 2027. Sommerhuben grupperer dem under «I 2026: uke 25». Verifiserte og delvis rader med 2027-dato vises med den datoen. Sommerferie finnes ikke i skoleruten og blir ikke funnet på.

Samme tilbyder, tittel og sted vises som ett kort. Hver uke blir liggende som egen rad i JSON. Terskelen på 3 teller tilbud etter grupperingen, og bruker den beste statusen i gruppen.
2. Importen fyller ikke inn manglende felt. `pameldingStatus` og `pameldingApner` blir `null` til kilden sier noe annet. Personnavn, telefon og e-post tas ut av vanlig tekst. URL-er blir ikke kuttet, og siffer inne i en lenke eller en heksadesimal id regnes ikke som telefon. Åttetall som er en dato, som `01052026`, blir stående.
3. `npm run finn` leser `config/kilder.json` og legger kandidater i `data/kandidater.json` til manuell gjennomgang. Den skriver aldri til `leirer.json` og kopierer ikke lister fra samlesider. `npm run sjekk-plan` lager `data/sjekk-plan.json` fra `data/kilder/sjekk-plan.md`. `npm run finn -- --forfalte` henter bare kildene der `sjekkDato` er i dag eller tidligere. En daglig jobb kan kjøre den modusen senere. Det er ikke satt opp noen cron, GitHub Action eller deploy for det nå.
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
| `/` | Forside. Fire utvalgte kort per ferie, med «Se alle» til huben, og filter på uke, kommune, type og alder |
| `/vinterferie/`, `/hostferie/`, `/paskeferie/`, `/sommerleir/` | Feriehub. Året står i tittelen og kommer fra neste sesong i skoleruta og tilbudene |
| `/vinterferie/oslo/` | Ferie og kommune. Uke og datoer fra skoleruta rett under H1, med kilde |
| `/vinterferie/uke-8/`, `/vinterferie/fylke/oslo/` | Uke og fylke der dataene har dem. Samme mønster for de andre feriene |
| `/skoleruta/bergen/` | Høstferie, vinterferie og påske med uke, datoer, kilde og lenke til tilbudene. Finnes for alle 30 kommuner |
| `/fotballskole/`, `/rideleir/` | Nasjonal hub bare når `type` mapper rent, med kommunesider under. `sommerskole` og `ferieklubb` får egen sti først når en type matcher. Andre typer ligger på `/type/<slug>/` |
| `/leir/<id>/` | Ett tilbud, med lenke til påmelding |

Året er aldri en del av stien. Slug er ASCII (`baerum`, `tromso`, `alesund`, `fardar`). Gamle stier fra denne PR-en (`/uke/…`, `/vinterferie/2027/…`, `/by/…`, `/type/fotballskole` og tilsvarende) har 301 i `vercel.json`.

Hver side har egen tittel, beskrivelse, canonical og Open Graph. JSON-LD er bare `ItemList` og `BreadcrumbList`. Der en rad i søkeordlisten treffer stien, brukes `foreslatt_tittel`.

Lister med færre enn 3 synlige `verifisert`- eller `delvis`-rader får `noindex,follow` og er ute av sitemap. Unntaket er `/skoleruta/<kommune>/`: den indekseres når datoene er verifisert, også med få tilbud. `forventet` vises med «Forventet – 2027-dato ikke publisert ennå» og fjorårsnotatet, men teller ikke med. `delvis` viser hva som mangler. Døde og utløpte rader skjules.

`forventet`-sider og tynne lister indekseres av seg selv når flere verifiserte tilbud kommer inn. Demo-rader (`demo: true`) vises aldri på indekserbare sider.

## Skolerute

`data/skolerute.json` er bygget fra `data/kilder/skolerute-2027-alle.csv` (357 kommuner, 305 med datoer). «Ikke funnet» blir utelatt og får ingen `/skoleruta/`-side. Datoene `fra`/`til` styrer uke-sidene. Der merknaden sier at avviket er avklart, vises at datoene følger det nyeste offisielle vedtaket. Bergen har vinterferie 1.–5. mars 2027. Alta har vinterferie onsdag–fredag.

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

## Kontakt og fremheving

`kontaktEpost` i `config/site.json` er `kontakt@weekslot.com`. «Bli synlig på WeekSlot», «Send oss tilbudet ditt» og tips-lenkene er `mailto:kontakt@weekslot.com`. Det er ikke bygget noe skjema.

Grunnoppføring er gratis. Fremhevet koster 290 kr per kommune per uke. Topp i kategori koster 690 kr per ferie, og sesongpakke koster 990 kr per ferie. Sommerpris er ikke satt.

## Det som er tatt ut

Den gamle markedsplassen for håndverkere (Prisma, Postgres, bookinger, innlogging, dashboard, success fee) ligger i `legacy/marketplace/` og bygges ikke. Git-historikken er beholdt. Ingen håndverker-CSV er importert. Bygget kjører uten `DATABASE_URL`.

Vercel-regionen i `vercel.json` er fortsatt `fra1`. Ingenting er deployet herfra, og DNS er ikke endret.

## Skript

| Kommando | Gjør |
| --- | --- |
| `npm run importer` | CSV → `tilbydere.json` og `skolerute.json`. `--leirer` skriver også `leirer.json` |
| `npm run sjekk-plan` | `sjekk-plan.md` → `data/sjekk-plan.json` |
| `npm run finn` | Kandidater fra `config/kilder.json` |
| `npm run finn -- --forfalte` | Bare kilder i sjekk-planen med `sjekkDato` i dag eller tidligere |
| `npm run sjekk` | Lenkesjekk med robots.txt |
| `npm run valider` | Skjema og personvern |
| `npm run build` | Valider, deretter statisk eksport til `out/` |
| `npm test` | Regler for uke, Hoopit, robots, Spond-utdrag og skolerute |
