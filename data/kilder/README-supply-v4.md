# WeekSlot – kurs og leirer for barn i Norge, v4.1 (26.11.2026)

v4 bygger på v3. Nytt er vinterrader for sju kommuner som manglet, en gjennomgang av de eldre Sarpsborg-radene, utfylling av Fredrikstad-rader og en sjekk-plan for når vinterprogrammene bør sjekkes på nytt.

## Nytt i v4.1 (rettinger, ingen nye tilbydere)
- **Personvern:** Alle v4-felt (CSV-ene, `leirer.json`, `sjekk-plan.md`, README) er søkt gjennom med regex etter telefonnumre (8 siffer, med og uten mellomrom, `+47`), e-postadresser og personnavn i `notat`/`pris_notat`/`kurs_navn`. Det ble ikke funnet noen personopplysninger. Sifrene 48948539 som ble meldt, er ikke et telefonnummer: de er en del av den heksadesimale artikkel-ID-en i Spond-lenken til Sandnes Ulf (`…/news-article/362C3B1674AB48948539B819FAB79B29`), i `url` og i «Kilde:»-lenka i `notat`. De er ikke fjernet, fordi lenka da ville slutte å virke.
- **v1–v3 skal ikke brukes til eksport.** Eldre filer (`kurs-norge-v1.csv`–`-v3.csv`, `tilbydere-norge-v1.csv`–`-v3.csv`, `leirer-v2.json`, `leirer-v3.json`, `leirer-v4.json`) er ikke endret og kan inneholde personopplysninger. Bruk bare v4.1-filene.
- **Format v1.1:** `leirer.json` har fått `pameldingStatus` og `pameldingApner` (mellom `dod` og `fremhevet`). Det finnes ingen `scripts/importer-csv.mjs` på maskinen, så det er ikke mulig å sjekke om importeren tåler nye kolonner. CSV-en har derfor **ikke** fått `pamelding_status`/`pamelding_apner`, og den er uendret fra v4.
- Feltene er bare fylt der kildesiden sier det tydelig (lest 26.11.2026, bare for rader med verifisert/delvis 2027-dato og Sjøleir-ukene): «påmeldingen er åpen/åpnet», aktiv påmeldingsknapp/billett/handlekurv for 2027-arrangementet, Spond med påmeldingsfrist fram i tid, «påmeldingen åpner snart», påmeldingsperiode (Rubic: fra 01.01.2027), DNT-tilbudets salgsstart (19.11.2026) og Sjøleirens status per uke (ledig/venteliste). Ellers `null`.
- `kildeSjekket` står fortsatt som 2026-11-26 på alle rader, siden alle rader allerede var sjekket i dag.
- Skript: `build_v41.py` (bygger `leirer.json` med de nye feltene) og `pamelding_v41.py` (statusene per kildelenke). Kopier av v4: `leirer-v4.json`, `README-v4.md`.

## Filer
| Fil | Innhold |
|---|---|
| `kurs-norge-v4.csv` | 218 rader: 103 vinter og 115 sommer. Kolonnene er de samme som i v1. |
| `tilbydere-norge-v4.csv` | 133 tilbydere. Kolonnene er de samme som i v1. |
| `leirer.json` | 241 objekter etter `weekslot-data/leirer-format.md` v1.1, ett objekt per kurs per uke. Validert med `node` (nøkkelrekkefølge inkl. `pameldingStatus`/`pameldingApner`, tillatte verdier, unike id-er, status, heltall, ISO-datoer, boolske felt, `land`, ingen tomme strenger) og med `jq`: 0 feil. |
| `skolerute-avvik.json` | Avvik mellom radene og skoleruta. Uendret fra v3 (5 linjer, bare kommuner som ikke står i skolerute-fila). |
| `sjekk-plan.md` | Plan for når forventet/delvis/dato_ikke_publisert-rader i vinterferien bør sjekkes, med observert eller anslått grunnlag. |
| `leirer-v3.json`, `README-v3.md`, `skolerute-avvik-v3.json` | Kopier av v3 fra før filene ble overskrevet. |
| `kurs-norge-v1.csv`–`-v3.csv`, `tilbydere-norge-v1.csv`–`-v3.csv`, `README-v1.md`, `README-v2.md`, `leirer-v2.json` | Eldre versjoner. Ikke endret. |
| `rows4.jsonl`, `build_v4.py`, `e1.py`, `plan.py` | Arbeidsdata og skript. `e1.py` legger inn de nye radene og skal ikke kjøres på nytt (gir duplikater). Sarpsborg/Fredrikstad-endringene ble gjort direkte i `rows4.jsonl` (kopi før endring: `rows4-before-e2.jsonl`). |

## Status
- **verifisert**: Dato, uke og pris eller alder er lest på tilbyderens egen side for 2027.
- **delvis**: 2027-tilbudet er bekreftet, men dato, pris eller alder mangler.
- **forventet**: Bare en tidligere utgave er publisert. `notat` sier «Forventet basert på …», fjorårets dato, kildelenke og skolens ferieuke for 2027. Datofeltene er tomme. Prisen er fjorårets, med årstall i `pris_notat`.
- **dato_ikke_publisert**: Tilbudet er oppgitt som fast, men det finnes ingen dato å bygge på. I JSON blir dette `forventet`.

### Uke × status (CSV-rader)
| | verifisert | delvis | forventet | dato_ikke_publisert | sum |
|---|---|---|---|---|---|
| Vinter uke 7 | 0 | 2 | 14 | 0 | 16 |
| Vinter uke 8 | 10 | 9 | 54 | 5 | 78 |
| Vinter uke 9 | 1 | 2 | 3 | 3 | 9 |
| Sommer | 38 | 8 | 69 | 0 | 115 |
| **Sum** | 49 | 21 | 140 | 8 | 218 |

## Nytt i v4
- **20 nye vinterrader i sju kommuner** (alle forventet eller dato_ikke_publisert; ingen 2027-program er publisert ennå):
  - Ullensaker (uke 8): 6 rader fra kommunens vinterferieprogram 2026 (PDF) – svømmekurs, skøyter/ishockey, innebandy, turn/parkour, dans, tegnekurs. Alle gratis i 2026.
  - Nordre Follo (uke 8): 3 – Ski og Kolben bibliotek (2025-program) og Kjeller'n fritidssenter (turer i skoleferier, ingen dato).
  - Lørenskog (uke 8): 3 – Lørenskog HK håndballskole for jenter (2026, 800 kr), kommunens ferietilbud og bibliotekets vinterprogram (begge dato_ikke_publisert).
  - Øygarden (uke 9): 3 – Sotra SK håndballskole (2026, 300 kr) og Øygarden IL fotballskole og eliteuke (dato_ikke_publisert).
  - Indre Østfold (uke 8): 2 – Fladmark Gård (LetsReg-enkeltoppslag, 2026, 995 kr) og kommunale skøytebaner med gratis skøyteutlån (åpent tilbud, ikke kurs).
  - Ringsaker (uke 8): 2 – kommunens vinteraktivitetsdager i Mjøsparken (2026, gratis) og Sjusjøen Skisenter skiskole (sesongtilbud, ikke ferie-spesifikt).
  - Karmøy (uke 7): 1 – SK Vedavåg Karmøy fotballskole (2026, 350 kr).
- **Sarpsborg:** Begge radene som bygger på 2024 (Borgarsyssel Museum og IHK Sparta vintercamp) står som `forventet` og har fått «Basert på 2024-program» i `notat`. Ingen av dem ble fjernet: museet er i drift (stengt for sesongen nå), og klubben arrangerer fortsatt camper (høstcamp 2026). Men ingen vinterutgave er funnet for 2025 eller 2026, og påmeldingsskjemaet klubbens camp-side lenker til er arkivert. Begge er usikre og står i sjekk-planen.
- **Fredrikstad:**
  - UKM/St. Croix-huset: alder 13–20 år og gratis (pris 0) bekreftet på St. Croix-husets egen side. Adressen for Ung Vintercamp 2026 viser nå Ung Høstcamp 2026 med samme opplegg og vilkår. URL endret til denne siden.
  - Esport4alle: egen side bekrefter at Feriegaming+ går fast i vinterferien (Lisleby, Sellebak, sentrum), men den oppgir ikke alder eller pris. Navn og notat oppdatert; alder/pris fortsatt tomme.
  - Gomma Turnforening og Borge Turnforening: ingen åpen side med alder eller pris funnet. Borge har gått over til Spond, og nyhetssiden nevner ikke vinterferietilbudet. Feltene er fortsatt tomme.

## Skolerute
Kilde: `/workspace/weekslot-research/skolerute-2027.csv`.
- Uke 7 (15.–19.02): Stavanger, Sandnes, Karmøy og Haugesund.
- Uke 9 (01.–05.03): Bergen, Øygarden og Drammen.
- Uke 8 (22.–26.02): alle de andre, også Nordre Follo, Lørenskog, Ullensaker, Indre Østfold og Ringsaker.

Alle vinterrader er sjekket mot fila med `build_v4.py`; ingen nye avvik. I 2026 hadde Karmøy (Rogaland) og Ringsaker (Innlandet) vinterferie i uke 9. Radene som bygger på 2026 er flyttet til 2027-uka i skoleruta (Karmøy uke 7, Ringsaker uke 8), og dette står i `notat`.

## Kilderegler som er fulgt
- Bare enkle fakta med egne ord: tittel, arrangør, dato og uke, alder, pris, sted og kildelenke. Ingen beskrivelser, bilder, personnavn, e-post eller telefon.
- **Hoopit:** Ikke lest.
- **Spond:** Bare fakta og lenke (SK Vedavåg, IHK Sparta).
- **KFUK-KFUM:** Ikke brukt.
- **LetsReg og DNT:** Bare enkeltoppslag på `/register/`-sider. I v4 ett LetsReg-oppslag (Fladmark Gård). Cloudflare er ikke omgått.
- Alle nye rader er sjekket med WebFetch/curl mot tilbyderens egen side eller kommunens egen oversikt. Lokalaviser og søkeresultater er bare brukt som spor. Priser som bare sto i søkeutdrag (f.eks. Sjusjøen skiskole) er ikke brukt.
- Ingen kontakt med noen. Ingen påmelding, konto, innlogging, betaling eller publisering. Gapbook-arkivet er ikke rørt.

## Kjente hull
- **Under målet på 3 vinterrader:** Karmøy (1), Indre Østfold (2) og Ringsaker (2). Indre Østfold-raden for skøytebaner og Sjusjøen-raden er åpne/sesongtilbud, ikke ferietilbud.
  - Karmøy: et gratis kommunalt skitur-tilbud (Sauda) er bare omtalt i lokalaviser; ingen kommuneside funnet, så det er ikke lagt inn. Visnes Gruvemuseum er åpent på søndager om vinteren, men vinterferien er ikke nevnt, så det er utelatt.
  - Indre Østfold: kommunens ferieaktivitetssider dekker bare sommeren. Askim håndballskole viser bare høsttilbud.
  - Ringsaker: «Bylab Moelv 24.02.2027» er et byutviklingsmøte, ikke barnetilbud, og er utelatt.
- Øygarden kommunes vinterferieside gir 404. Lørenskogs 2024-PDF er ikke lesbar, og innholdet i Lørenskog biblioteks vinterbrosjyre (Issuu) er ikke lest.
- Nordre Follo bibliotek bygger på 2025-programmet; Kjeller'n-turene i 2026 er bare omtalt i lokalpresse og ikke brukt.
- Sarpsborg: Borgarsyssel og IHK Sparta bygger på 2024 og er usikre (se over).
- Fredrikstad: Gomma, Borge og Esport4alle mangler fortsatt alder og pris.
- 148 av 218 rader er `forventet` eller `dato_ikke_publisert`. 64 av 103 vinterrader har pris. Se `sjekk-plan.md` for når de bør sjekkes.
