# WeekSlot – kurs og leirer for barn i Norge, v5 (26.11.2026)

v5 bygger på v4.1 og gjelder sommer 2027: sommerleirer i fem byer, TINE Fotballskole i alle 30 kommunene i skoleruta og kommunale sommertilbud i de 10 største kommunene. Vinterradene er uendret fra v4.1.

## Filer
| Fil | Innhold |
|---|---|
| `kurs-norge-v5.csv` | 408 rader: 103 vinter og 305 sommer. Samme kolonner som v1 (ingen påmeldingskolonner, se under). |
| `tilbydere-norge-v5.csv` | 269 tilbydere. Samme kolonner som v1. |
| `leirer.json` | 479 objekter etter `leirer-format.md` v1.1, ett objekt per kurs per uke. Validert med `node` (nøkkelrekkefølge, unike id-er, tillatte verdier for status/pameldingStatus, heltall, ISO-datoer, boolske felt, `land`, `lenkestatus`, ingen tomme strenger) og `jq`: 0 feil. |
| `sjekk-plan.md` | Vinterdelen (uendret innhold) og en ny sommerdel med alle sommerrader som venter. |
| `skolerute-avvik.json` | Uendret fra v4 (5 linjer). |
| `tine2026-stripped.json` | Utdrag av TINE-kartets åpne datafil for 2026 med bare fakta (klubb, sted, datoer, alder, pris, lenke). Kontaktnavn, e-post, telefon og instruktørnavn er fjernet før lagring. |
| `tine-utenfor-sommer.json` | 19 TINE-arrangementer som lå utenfor sommerferien (uke 14, 22, 24, 34–41) og derfor ble tatt ut. |
| `leirer-v4.1.json`, `README-v4.1.md` | v4.1 før overskriving. |
| `rows5.jsonl`, `build_v5.py`, `f1_tine.py`, `g1.py`, `plan5.py`, `pamelding_v41.py` | Arbeidsdata og skript. Ikke kjør `f1_tine.py` eller `g1.py` på nytt (gir duplikater). |

**v1–v4 (og `leirer-v2.json`–`leirer-v4.1.json`) kan inneholde personopplysninger og skal ikke brukes til eksport.** Bruk bare v5-filene.

## Status
- **verifisert**: dato, uke og pris eller alder lest på tilbyderens egen side for 2027.
- **delvis**: 2027-tilbudet er bekreftet, men noe mangler.
- **forventet**: bare tidligere utgave publisert. `notat` har «Forventet basert på …», fjorårets datoer og kilde. Datofelt tomme; pris er fjorårets med år i `pris_notat`.
- **dato_ikke_publisert**: fast tilbud uten dato. I JSON: `forventet`.

### Sesong og uke × status (CSV-rader)
| Sesong / uke | verifisert | delvis | forventet | dato_ikke_publisert | sum |
|---|---|---|---|---|---|
| Vinter uke 7 | 0 | 2 | 14 | 0 | 16 |
| Vinter uke 8 | 10 | 9 | 54 | 5 | 78 |
| Vinter uke 9 | 1 | 2 | 3 | 3 | 9 |
| Sommer uke 25 | 3 | 1 | 4 | 0 | 8 |
| Sommer uke 26 | 6 | 1 | 111 | 0 | 118 |
| Sommer uke 27 | 6 | 1 | 21 | 0 | 28 |
| Sommer uke 28–31 | 10 | 3 | 6 | 0 | 19 |
| Sommer uke 32 | 3 | 1 | 19 | 0 | 23 |
| Sommer uke 33 | 5 | 0 | 83 | 0 | 88 |
| Sommer, flere uker i én rad | 5 | 1 | 13 | 2 | 21 |
| **Sum** | 49 | 21 | 328 | 10 | 408 |

### Påmeldingsfelt (JSON, 479 objekter)
`pameldingStatus`: apen 36, ikke_apnet 8, full 1, null 434. `pameldingApner`: 2027-01-01 ×4, 2026-11-19 ×2, null 473. Ingen nye rader i v5 har fått verdier: alle nye rader er forventet/dato_ikke_publisert, og 2026-sidene sier ingenting om påmelding for 2027. Det finnes ingen `scripts/importer-csv.mjs`, så CSV-en har fortsatt ikke `pamelding_status`/`pamelding_apner`.

## Nytt i v5
### 1) Sommer i fem byer (sommerrader inkl. eldre)
| By | Sommerrader | Nytt i v5 |
|---|---|---|
| Bergen | 34 | 12 leirer fra TIF Viking (i samarbeid med Bergen kommune), 2 tilrettelagte kommunale leirer, 13 TINE |
| Trondheim | 18 | DNT Newtoncamp (enkeltoppslag), Science Camp (kommunen), 7 TINE |
| Tromsø | 16 | Tromsø Turnforening (uke 26 og 33), Polar sommercamp ishockey (Spond), rideleir uke 26 og 27, Vitensentersommer, 3 TINE |
| Stavanger | 16 | 10 TINE |
| Kristiansand | 15 | Seilleir (CSF), Haraldvigen feriekoloni uke 26 og 27 (kommunen), Hånes IF håndballskole (LetsReg-enkeltoppslag), Fritidsenhetens sommertilbud (dato_ikke_publisert), 5 TINE |

### 2) TINE Fotballskole
- Kartet «Finn din fotballskole» (tine.no) er skriptbasert, men henter en åpen datafil uten innlogging. Den er brukt som kilde. 2027-fila var tom 26.11.2026, så alle rader er `forventet` med 2026-uka. Raden lenker til kartet. Kommune er utledet fra postnummer (Brings åpne postnummerregister).
- Inntil 10 klubber per kommune. Klubbstørrelse finnes ikke i dataene, så klubber med flest arrangementer er prioritert. Én rad per klubb, uke og sted.
- Bare uke 25–33 er tatt med. 19 arrangementer i påske, før sommerferien og om høsten er tatt ut.
- Klubber som allerede hadde en egen TINE-rad for samme uke (Tromsø IL, Odd, Sarpsborg FK, Lura IL, Sandnes Ulf, Åssiden IF, Fet IL, Stavanger IF, Sverresborg), er ikke lagt inn på nytt. Ett klubbnavn i dataene var ufullstendig («B», Bærum) og er hoppet over.
- Hoopit er ikke lest. Klubbenes egne sider er ikke sjekket rad for rad. Tallene kommer fra TINE/NFF-kartet.

### 3) Kommunale sommertilbud (10 største kommuner)
| Kommune | Rader | Tilbud |
|---|---|---|
| Oslo | 2 | Sommerskolen Oslo (uke 26–27, gratis), Bydel Grorud sommerferieaktiviteter (gratis) |
| Bergen | 2 (+12) | Tilrettelagte sommerleirer (gratis). TIF Viking-leirene er i samarbeid med kommunen. |
| Trondheim | 1 | Science Camp (gratis, foreløpig 21.–25.06.2027) |
| Stavanger | 1 | Fiks ferigge ferie (fra før) |
| Bærum | 1 | Ungdom og Fritid sommertilbud (gratis) |
| Kristiansand | 3 | Haraldvigen feriekoloni ×2, Fritidsenheten |
| Drammen | 2 (+1) | Sjøspeider og MS-speider fra kommunens oversikt over gratis tilbud (kulturskolens MusikkLab fra før) |
| Asker | 1 | Feriekontoret / «Hva skjer i Asker» (dato_ikke_publisert) |
| Lillestrøm | 1 | Lillestrøm sommerskole (uke 26, 32, 33) |
| Fredrikstad | 1 | Kommunens ferieaktiviteter (maks 400 kr for kommunestøttede tilbud) |

## Kilderegler som er fulgt
- Bare enkle fakta med egne ord: tittel, arrangør, dato og uke, alder, pris, sted og kildelenke. Ingen beskrivelser, bilder, personnavn, e-post eller telefon.
- **Hoopit:** Ikke lest.
- **Spond:** Bare fakta og lenke (SK Vedavåg, IHK Sparta).
- **KFUK-KFUM:** Ikke brukt.
- **LetsReg og DNT:** Bare enkeltoppslag på `/register/`-sider. I v4 ett LetsReg-oppslag (Fladmark Gård). Cloudflare er ikke omgått.
- Alle nye rader er sjekket med WebFetch/curl mot tilbyderens egen side eller kommunens egen oversikt. Lokalaviser og søkeresultater er bare brukt som spor. Priser som bare sto i søkeutdrag (f.eks. Sjusjøen skiskole) er ikke brukt.
- Ingen kontakt med noen. Ingen påmelding, konto, innlogging, betaling eller publisering. Gapbook-arkivet er ikke rørt.

- **Personvernsøk før levering:** regex over alle v5-felt (8 siffer, `+47`, e-post) og navnemønstre i notat/pris_notat/kursnavn: 0 treff på personopplysninger. Treff på to ord med stor forbokstav var bare steds-, anleggs- og arrangementsnavn.
- **KFUK-KFUM:** Bare sitemapet er brukt. Det har ingen leirsider for de fem byene, så ingen rader.
- **DNT:** Bare `/register/`-sider (Newtoncamp). Sider på dnt.no er ikke brukt.

## Kjente hull
- **TINE:** Bare 2026-data. Skien har ingen kart-rad (Odd fantes fra før). Mange kommuner har færre enn 10 klubber i kartet. Arendal, Fredrikstad og Porsgrunn har bare 1 klubb. Postnummer-til-kommune kan gi feil ved kommunegrenser.
- **KFUK-KFUM og speidere:** Ingen leirer funnet i de fem byene. Speiderrader finnes bare i Drammen.
- **Tromsø:** Kommunens sommerleir og bootcamp (uke 26–27) er bare omtalt på en skoleside, ikke på kommunens side. Derfor er de ikke lagt inn. Tromsø Ryttersportsklubb oppgir ikke årstall.
- **Trondheim:** Kommunens ferieside lenker videre uten et eget sommerprogram. Sommer i Trondheim er ikke funnet for 2026.
- **Stavanger:** Utenom TINE er det ingen nye sommerrader (DNT Stavangers friluftsskole finnes bare på en ekstern side og er ikke brukt).
- **Påmelding:** Ingen sommerrader har 2027-påmelding ennå, unntatt de som allerede var verifisert/delvis.
- 338 av 408 rader er `forventet` eller `dato_ikke_publisert`. Se `sjekk-plan.md`. De fleste sommerrader bør sjekkes i mars 2027.
- Fra v4: Karmøy, Indre Østfold og Ringsaker har under 3 vinterrader, og Sarpsborg-radene bygger på 2024.
