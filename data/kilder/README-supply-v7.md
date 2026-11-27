# WeekSlot – kurs og leirer for barn i Norge, v7 (26.11.2026)

v7 bygger på v6. Vinteren kom først, fordi vintersidene skal ut 14.–31.12.:
1. Alle 79 vinterrader med status `forventet` (71) eller `dato_ikke_publisert` (8) er sjekket på arrangørens egen side.
2. Det er søkt etter nye vinterferietilbud med publisert 2027-dato i Oslo, Bærum, Bergen, Trondheim, Stavanger og Ålesund.

## Filer
| Fil | Innhold |
|---|---|
| `kurs-norge-v7.csv` | 430 rader: 104 vinter, 15 påske og 311 sommer. Samme kolonner som v6 (`pamelding_status` og `pamelding_apner` til slutt, tomme når ukjent). |
| `tilbydere-norge-v7.csv` | 277 tilbydere. Samme kolonner som før. |
| `leirer.json` | 503 objekter etter `leirer-format.md` v1.1, ett per kurs per uke. Validert med node (nøkkelrekkefølge, unike id-er, tillatte verdier, heltall, ISO-datoer, boolske felt, `land`, `lenkestatus`, ingen tomme strenger) og jq: 0 feil. |
| `endringer-v7.md` | Alle rader som er endret, lagt til eller fjernet mot v6 (id, tilbyder, kommune, gammel og ny status, hva som er endret, kilde-URL). Radene som bare er sjekket (notat og kildeSjekket), står i en egen tabell. |
| `sjekk-plan.md` | Vinter (oppdatert med v7-sjekken), sommer og påske. |
| `skolerute-avvik.json` | Uendret. |
| `leirer-v6.json`, `README-v6.md` | v6 slik den var før overskriving. |
| `rows7.jsonl`, `h4_v7.py`, `build_v7.py`, `plan7.py` | Arbeidsdata og skript. Kjør v6-skriptene (`h1` → `h2` → `h3`) og så `h4_v7` → `build_v7` → `plan7`. |

**v1–v6 kan inneholde personopplysninger og skal ikke brukes til eksport.** Dette gjelder også `leirer-v2.json`–`leirer-v6.json`. Bruk bare v7-filene.

## Status
- **verifisert**: dato, uke og pris eller alder er lest på tilbyderens egen side for 2027.
- **delvis**: tilbudet finnes på tilbyderens side, men mangler noe for 2027. For TINE-radene i v6 betyr det at klubben har en egen side for TINE Fotballskole uten 2027-dato. Siden kan være fast, eller for 2023–2026. `notat` sier hva grunnlaget er («Delvis: …»).
- **forventet**: bare en tidligere utgave er publisert. `notat` har «Forventet basert på …», fjorårets datoer og kilden.
- **dato_ikke_publisert**: fast tilbud uten dato. I JSON blir dette `forventet`.

### Sesong × status (CSV-rader)
| Sesong | verifisert | delvis | forventet | dato_ikke_publisert | sum |
|---|---|---|---|---|---|
| vinter2027 | 12 | 13 | 71 | 8 | 104 |
| paske2027 | 0 | 0 | 15 | 0 | 15 |
| sommer2027 | 38 | 55 | 216 | 2 | 311 |
| **Sum** | 50 | 68 | 302 | 10 | 430 |

### Påmeldingsfelt
- JSON (503 objekter):
  - `pameldingStatus`: apen 38, ikke_apnet 8, full 1, null 456.
  - `pameldingApner`: 2027-01-01 ×4, 2026-11-19 ×2, null 497.
- CSV (430 rader):
  - `pamelding_status`: apen 30, ikke_apnet 8, full 1, tom 391.
  - `pamelding_apner`: 2027-01-01 ×4, 2026-11-19 ×2, tom 424.

JSON har flere verdier fordi rader som går over flere uker blir delt i ett objekt per uke. I v7 fikk to vinterrader `apen`: Skimore Oslo (bestilling i nettbutikken) og sjakkleiren på Skøyen skole (påmeldingsskjema med frist 21.02.2027).

## Nytt i v7
### 1) Gjennomgang av vinterradene
- Alle 79 rader (Oslo 6, Bergen 1, Stavanger 7, Ålesund 1 og 64 i andre kommuner; Bærum og Trondheim hadde ingen slike rader) er sjekket på arrangørens egen side 26.11.2026. Der det fantes, ble også sitemap og forside sjekket, og 2026-adresser ble prøvd med 2027.
- **Ingen av dem hadde publisert 2027-dato.** Ingen rad er oppgradert til `verifisert` eller `delvis`. Statusen er uendret, notatet sier at raden er sjekket i v7, og `kildeSjekket` er 2026-11-26.
- **Skimore Oslo Skiskole** (dato_ikke_publisert): ny URL til siden for vinterferiekurs. Pris 1950 kr (alpint 4–10 år, 3 dager), alder 4–10 og påmelding `apen` (kan bestilles i nettbutikken). Status er uendret fordi siden ikke oppgir dato eller år.
- Fladmark Gård (LetsReg) svarte 403 og ble ikke omgått.

### 2) Nye vinterferietilbud med 2027-dato
- **Oslo:** Sjakkleir i vinterferien på Skøyen skole, 22.–26.02.2027 (uke 8), 1.–7. klasse, 2150 kr (490 kr per dag), påmeldingsfrist 21.02.2027. `verifisert`. Kilde: sjakkevent.no/event/1013. Siden navngir ikke arrangørklubben tydelig, så tilbyder er satt til «SjakkEvent (sjakkleir på Skøyen skole)».
- **Bærum, Bergen, Trondheim, Stavanger, Ålesund:** Ingen nye tilbud med publisert 2027-dato som ikke allerede var med. Søkene dekket kulturskole, svømmekurs, ski- og skøyteskole og klatring. Allerede med fra før: BSK, Utleira, Korsvoll, AKKS m.fl.
- **Vurdert, men ikke tatt med:**
  - OI Svømming, intensivkurs i vinterferien: siden gjelder 2026.
  - Trondheim kortbaneklubbs skøyteskole: har pause i vinterferien (uke 8). Dette er et kurs, ikke et ferietilbud.
  - RushCamp (Rush Bergen) og vinterprogrammet på Akvariet: fant ingen side med 2027-dato hos arrangørene.
  - Barça Academy: bare sommercamper for 2027.

## Fra v6
### 1) Kvalitetssjekk av TINE-radene
Gjelder Oslo, Bærum, Bergen, Ålesund, Trondheim og Stavanger: 50 klubber og 72 rader, sjekket på klubbenes egne sider 26.11.2026. Hoopit er ikke lest. Spond-baserte klubbsider (spond.club) er bare brukt for fakta og lenke.

| Kommune | Klubber delvis / forventet | Rader delvis | Rader forventet | Verifisert | Fjernet |
|---|---|---|---|---|---|
| Oslo | 10 / 0 | 16 | 0 | 0 | 0 |
| Bærum | 5 / 3 | 8 | 6 | 0 | 0 |
| Bergen | 4 / 6 | 5 | 8 | 0 | 0 |
| Ålesund | 6 / 4 | 7 | 5 | 0 | 0 |
| Trondheim | 3 / 3 | 3 | 4 | 0 | 0 |
| Stavanger | 4 / 2 | 8 | 2 | 0 | 0 |
| **Sum** | 32 / 18 | 47 | 25 | 0 | 0 |

Resultat av sjekken:
- **Verifisert:** Ingen klubb har publisert TINE Fotballskole 2027 ennå.
- **Fjernet:** Ingen klubbside sier at klubben har sluttet med fotballskole.
- **Delvis:** Raden lenker nå til klubbens egen side. Kartkilden står fortsatt i `notat`.
- **Avvik i uke:** Fossum IF har uke 32 på sin 2026-side, mens kartet har uke 33. Kartets uke er beholdt, og avviket står i `notat`.
- **Forventet:** Radene beholder kartlenken, og klubbsjekken står i `notat`. Årsakene er:
  - ingen side funnet for fotballskolen på klubbsiden;
  - siden svarte ikke (Alvøen, Byåsen, Stavanger IF);
  - siden er skriptbasert (Bærums Verk Hauger);
  - siden lenker bare til en ekstern påmeldingsside, som ikke er lest (Astor).

### 2) Påskeferien 2027 (`sesong` = `paske2027`)
- `leirer-format.md` har allerede `paske2027` som eksempelverdi for `sesong`, så formatet trenger ingen endring.
- I `skolerute-2027.csv` går påskeferien 22.03–29.03.2027 i Bergen, Trondheim, Stavanger, Bærum og Fredrikstad, og 22.03–30.03.2027 i Oslo, Kristiansand, Drammen, Asker og Lillestrøm.
- 2. påskedag er 29.03, så ferien er uke 12 pluss mandag (eventuelt tirsdag) i uke 13. Ideens «22.–30.3» stemmer for de fem kommunene med ferie til og med 30.03.
- Campene ligger i uke 12. De åpne museumstilbudene i Drammen og Fredrikstad er satt til uke 12–13.
- Alle 15 radene er `forventet` og bygger på påsken 2026 (uke 14). `notat` sier hvilke datoer skolen har påskeferie i 2027.

| Kommune | Rader | Tilbud |
|---|---|---|
| Oslo | 3 | Lyn påskecamp, Manglerud Star MS Camp, Skimore påskeferiekurs alpint |
| Bergen | 2 | Fana IL Påskeferiefotball, Gneist Påskefotball |
| Kristiansand | 2 | FK Vigør påskecamp (Spond), bypåske på Kristiansand museum |
| Drammen | 2 | Drammens Turnforening påsketurn, Drammens Museum påskeverksted |
| Trondheim | 1 | Påskeverksted på Trondheim kunstmuseum |
| Stavanger | 1 | Hinna Fotball PåskeCamp |
| Bærum | 1 | Fossum fotballcamp (Rubic) |
| Asker | 1 | KIWI påskecamp (Asker Fotball / Asker Skiklubb) |
| Lillestrøm | 1 | Skedsmo FK påskecamp |
| Fredrikstad | 1 | Påske på Fredrikstad museum |

### 3) KFUK-KFUM
- Gjennomgangen brukte sitemapet (669 URL-er, hvorav 584 aktivitetssider). Alle URL-ene er tillatt i robots.txt.
- Regionsidene for Bjørgvin, Rogaland, Trøndelag, Agder, Troms og Sandnes har ikke leirinformasjon.
- **Treff, lagt inn som `forventet` ut fra 2026:**
  - KFUK-KFUM Stavanger, Ynglingen, på Vier leirsted, med henting i Stavanger:
    - ungdomsleir uke 26;
    - barneleir uke 31 (9–12 år, 2900/2500 kr);
    - ungdomsleir uke 32 (13–17 år, 2500/2100 kr);
    - barneleir uke 33 (9–12 år, 2900/2500 kr).
  - Sommerleir Nord-Norge, Evenskjer i Tjeldsund, uke 32. Arrangører er KFUK-KFUM Nordland og Troms. Leiren er ikke i Tromsø.
  - Sommertreff Risøya, Tvedestrand, uke 30. Familieleir med aldersdelte barne- og ungdomsgrupper.
- **Ingen treff:** Ingen sommerleir for barn i Bergen/Bjørgvin, Trondheim/Trøndelag eller Kristiansand i 2025–2026. Solhøgda leirsted (Agder) hadde bare en lederhelg.

## Kilderegler som er fulgt
- Bare enkle fakta med egne ord: tittel, arrangør, dato og uke, alder, pris, sted og kildelenke. Ingen beskrivelser, bilder, personnavn, e-post eller telefon.
- **Hoopit:** Ikke lest.
- **Spond:** Bare fakta og lenke (SK Vedavåg, IHK Sparta). Ingen nye Spond-rader i v7.
- **KFUK-KFUM:** Ikke brukt.
- **LetsReg og DNT:** Bare enkeltoppslag på `/register/`-sider. I v4 ett LetsReg-oppslag (Fladmark Gård). I v7 svarte samme side 403, og det er ikke omgått. Cloudflare er ikke omgått.
- Alle nye rader er sjekket med WebFetch/curl mot tilbyderens egen side eller kommunens egen oversikt. Lokalaviser og søkeresultater er bare brukt som spor. Priser som bare sto i søkeutdrag (f.eks. Sjusjøen skiskole) er ikke brukt.
- Ingen kontakt med noen. Ingen påmelding, konto, innlogging, betaling eller publisering. Gapbook-arkivet er ikke rørt.

- **Personvernsøk før levering:** regex over alle v7-filer (CSV, tilbydere, JSON, sjekk-plan, README, endringer-v7): 8 siffer, `+47` og e-post, og navnemønstre i notat/pris_notat/kursnavn: 0 treff på personopplysninger. Treff på to ord med stor forbokstav var bare steds-, anleggs- og arrangementsnavn.
- **KFUK-KFUM:** Bare URL-er fra sitemapet (`/aktiviteter/event-id-…`, tillatt i robots.txt) er brukt. Ingen KFUK-KFUM-endringer i v7.
- **DNT:** Bare `/register/`-sider (Newtoncamp). Sider på dnt.no er ikke brukt.


## Kjente hull
- **Vinter 2027 (v7):**
  - 79 av 104 vinterrader er fortsatt `forventet` eller `dato_ikke_publisert`, fordi arrangørene ikke har publisert 2027 per 26.11.2026. Bør sjekkes igjen før 14.12. Se `sjekk-plan.md`.
  - Bare én ny vinterrad i de seks kommunene. Kulturskolene (Oslo, Bærum, Bergen, Trondheim, Stavanger, Ålesund), svømmeklubbene og skiskolene har ikke lagt ut vinterferiekurs for 2027 ennå.
  - Ålesund og Bærum har fortsatt få vinterrader.

- **TINE:**
  - Ingen klubber har 2027-datoer ennå.
  - 18 av 50 klubber har ingen egen side vi fant, eller siden svarte ikke.
  - Utenfor de seks kommunene er TINE-radene fortsatt bare `forventet` fra kartet.
  - Fra v5: Skien har ingen rad fra kartet (Odd fantes fra før), og flere kommuner har færre enn 10 klubber.
- **Påske:**
  - Bare 1–3 tilbud per kommune, og ingen kulturskolekurs eller svømmekurs i påsken er funnet på åpne sider. Oslo kulturskole skriver at ferietilbudene legges ut nær ferien.
  - Vitensenteret i Trondheim svarte med 403 og er ikke brukt.
  - Sverresborgs påskeside gir 404, så det tilbudet er ikke tatt med.
  - Skimore-siden viser ikke år eller datoer.
  - Fredrikstad museum oppgir ikke år.
  - Gneist og Lyn oppgir ikke pris.
- **KFUK-KFUM:**
  - Ingen leir i Bergen, Trondheim eller Kristiansand.
  - Nord-Norge-leiren ligger i Tjeldsund, ikke i Tromsø.
  - Vier-leirenes kommune er ikke oppgitt. Radene står på Stavanger fordi hentestedet er der.
- **Tromsø og Trondheim (fra v5):** Kommunale sommerleirer mangler. Tromsø Ryttersportsklubb oppgir ikke år.
- **Ventende rader:** 312 av 430 rader er `forventet` eller `dato_ikke_publisert`. Se `sjekk-plan.md`, der de fleste sjekkene ligger i februar–mars 2027.
- **Vinter (fra v4):** Karmøy, Indre Østfold og Ringsaker har under 3 vinterrader. Sarpsborg-radene bygger på 2024.
