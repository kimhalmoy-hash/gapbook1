# WeekSlot – kurs og leirer for barn i Norge, v3 (26.11.2026)

v3 bygger på v2. Hovedvekten er vinterferien 2027, slik at vintersidene kan bli klare før 14.12.

## Filer
| Fil | Innhold |
|---|---|
| `kurs-norge-v3.csv` | 198 rader: 83 vinter og 115 sommer. Kolonnene er de samme som i v1. |
| `tilbydere-norge-v3.csv` | 115 tilbydere. Kolonnene er de samme som i v1. |
| `leirer.json` | 221 objekter etter `weekslot-data/leirer-format.md`. Det er ett objekt per kurs per uke. Fila er validert med `node` (nøkkelrekkefølge, unike id-er, status, heltall, ISO-datoer, boolske felt, `land`, ingen tomme strenger) og med `jq`. |
| `skolerute-avvik.json` | Avvik mellom radene og skoleruta. Innholdet er det samme som i v2. |
| `leirer-v2.json`, `README-v2.md`, `skolerute-avvik-v2.json` | Kopier av v2 fra før filene ble overskrevet. |
| `kurs-norge-v1.csv`/`-v2.csv`, `tilbydere-norge-v1.csv`/`-v2.csv`, `README-v1.md` | v1 og v2. Disse er ikke endret. |
| `rows3.jsonl`, `build_v3.py`, `d1.py`–`d5.py` | Arbeidsdata og byggeskript. Ikke kjør `d*.py` på nytt, for da blir radene duplisert. `d5.py` legger inn priser. |

## Status
- **verifisert**: Dato, uke og pris eller alder er lest på tilbyderens egen side for 2027.
- **delvis**: 2027-tilbudet er bekreftet, men dato, pris eller alder mangler.
- **forventet**: Bare en tidligere utgave er publisert, oftest 2026 og noen ganger 2025 eller 2024. `notat` sier hva raden bygger på, med «Forventet basert på …», fjorårets dato, kildelenken og skolens ferieuke for 2027. Datofeltene er tomme. Prisen er fjorårets pris, med årstall i `pris_notat`.
- **dato_ikke_publisert**: Tilbudet finnes, men det finnes ingen dato å bygge på. Eksempler er Skien kommunes ferieaktiviteter og ferieskolen på Århus gård. I JSON blir dette `forventet`.

### Uke × status (CSV-rader)
| | verifisert | delvis | forventet | dato_ikke_publisert | sum |
|---|---|---|---|---|---|
| Vinter uke 7 | 0 | 2 | 13 | 0 | 15 |
| Vinter uke 8 | 10 | 9 | 40 | 3 | 62 |
| Vinter uke 9 | 1 | 2 | 2 | 1 | 6 |
| Sommer | 38 | 8 | 69 | 0 | 115 |

## Nytt i v3
- **43 nye vinterrader.** Antallet vinterrader har gått fra 40 i v2 til 83. Mange av de nye radene er ferieprogram på museer, bibliotek og i kommunene, og ikke rene kurs. Noen er åpne tilbud uten påmelding: Skien fritidspark, INSPIRIA og Kjerringåsen. Dette står i `type` og `notat`.
- **Nye kommuner:** Sandefjord, Tønsberg, Porsgrunn, Arendal, Haugesund, Moss og Bodø. Larvik har nå også en vinterrad.
- **Priser:** 9 eksisterende rader har fått pris fra åpne sider, nemlig billettsider og én LetsReg-`/register/`-side. Radene er Stavanger Hockey tema-camp, Brekkeparken, Hvalfangstmuseet, INSPIRIA, Norsk Oljemuseum, Vitenfabrikken, Kristiansand museum, Larvik museum og Sverresborg TINE. Prisen er ordinær barnebillett der aktiviteten er inkludert i billetten.
- **Hvalfangstmuseet** har publisert 2027-programmet (20.–28.02.2027) og står som `verifisert`. Datofeltene er satt til ukedagene med program (22.–26.02).

## Skolerute
Kilde: `/workspace/weekslot-research/skolerute-2027.csv`.
- Uke 7: Stavanger, Sandnes, Karmøy og Haugesund.
- Uke 9: Bergen, Øygarden og Drammen.
- Uke 8: alle de andre, også Tromsø og Bodø.

Alle vinterrader er sjekket mot fila med `build_v3.py`, og det er ingen nye avvik. Kommuner som ikke står i fila, har beholdt uka tilbyderen selv oppgir. Det gjelder Færder, Malvik, Ørsta og Nore og Uvdal. Rader fra Rogaland og Tromsø som bygger på 2026 (uke 9 og uke 10), er flyttet til 2027-uka i skoleruta. Det samme gjelder Nordnorsk Kunstmuseum, som bygger på 2025.

## Kilderegler som er fulgt
- Vi lagrer bare enkle fakta med egne ord: tittel, arrangør, dato og uke, alder, pris, sted og kildelenke. Vi lagrer ingen beskrivelser, bilder, personnavn, e-post eller telefon.
- **Hoopit:** Ikke lest.
- **Spond Discover og spond.club:** Bare fakta og lenke.
- **KFUK-KFUM:** Ikke brukt.
- **Rubic:** Tillatt, men ikke nødvendig i v3.
- **LetsReg og DNT:** Bare enkeltoppslag på `/register/`-sider. I v3 ble det gjort ett LetsReg-oppslag, for Sverresborg. Cloudflare er ikke omgått.
- **Tromsøbadet** ga «Tilgang nektet» (403). Siden er ikke omgått og ikke brukt.
- Alle rader er sjekket med WebFetch mot tilbyderens egen side, eller mot kommunens egen vinterferieoversikt der tilbyderen ikke har en egen side. Det gjelder Fredrikstads aktivitetsportal, Tønsberg kommune og Stavanger kommune, og det står i `notat`. Lokalaviser og søkeresultater er bare brukt som spor, ikke som kilde.
- Ingen kontakt med noen. Ingen påmelding, konto, innlogging, betaling eller publisering. Gapbook-arkivet er ikke rørt.

## Kjente hull
- **Skien har 4 vinterrader, og Tromsø har 2.** Målet var 5 per by. Skien kommune og Århus gård legger ut vinterprogrammet først rett før ferien. Det fantes ingen åpen 2026-side for klubbcamper i Skien. I Tromsø er kommunens 2026-side fjernet (404), og Tromsøbadet blokkerer. Skolesider med vinterferieliste kan være fra 2020, så de er ikke brukt.
- Sarpsborg har 5 rader, men to av dem er eldre (Borgarsyssel og IHK Sparta 2024), og én er et åpent alpinanlegg.
- 124 av 198 rader er `forventet` og må sjekkes på nytt når tilbyderne publiserer. Vinterprogrammene kommer typisk i desember–januar.
- 51 av 83 vinterrader har pris. Mange museums- og bibliotekrader mangler pris, eller viser bare ordinær billett. Klubbcamper i Fredrikstads aktivitetsportal (Gomma, Borge, Esport4alle, UKM) mangler alder og pris.
- Kommuner i skoleruta uten vinterrader: Nordre Follo, Lørenskog, Indre Østfold, Ullensaker, Karmøy, Øygarden og Ringsaker. Lørenskog og Moss har kommunale vinterferieprogram, men bare 2024-PDF og en side som gir 404 var tilgjengelige.
