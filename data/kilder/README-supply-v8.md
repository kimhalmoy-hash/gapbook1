# WeekSlot – kurs og leirer for barn i Norge, v8 (27.11.2026)

v8 bygger på v7 og er gjeldende versjon. Lista dekker nå flere kommuner:
1. **Ti nye kommuner:** Hamar, Gjøvik, Lillehammer, Molde, Halden, Ringerike, Kongsberg, Harstad, Alta og Narvik.
2. **Påfyll i seks kommuner med få rader:** Bodø, Haugesund, Arendal, Moss, Porsgrunn og Skien.
3. **Kilder for sommer 2027:** idrettsleirer, TINE Fotballskole, kulturskole/sommerskole, svømming, kommunale ferieaktiviteter, KFUK-KFUM (sitemap) med mer. Vinter og påske 2027 er bare tatt med der arrangøren har et fast mønster (se under).

Alle v7-rader er uendret. 74 rader er lagt til.

## Filer
| Fil | Innhold |
|---|---|
| `kurs-norge-v8.csv` | 504 rader: 105 vinter, 16 påske og 383 sommer. Samme kolonner som v7 (`pamelding_status` og `pamelding_apner` til slutt, tomme når ukjent). |
| `tilbydere-norge-v8.csv` | 332 tilbydere. Samme kolonner som før. |
| `leirer.json` | 624 objekter etter `leirer-format.md` v1.1, ett per kurs per uke. Validert med node (nøkkelrekkefølge, unike id-er, tillatte verdier, uke 1–53, heltall, ISO-datoer, boolske felt, `land`, `lenkestatus`, ingen tomme strenger) og jq: 0 feil. |
| `endringer-v8.md` | Alle objekter som er lagt til, endret eller fjernet mot v7 (121 lagt til, 0 endret, 0 fjernet). |
| `sjekk-plan.md` | Vinter, sommer (med de nye arrangørene) og påske. Observerte publiseringsdatoer er lagt inn der arrangørens side viste dem. |
| `skolerute-avvik.json` | Uendret. |
| `leirer-v7.json`, `README-v7.md` | v7 slik den var før overskriving. |
| `rows8.jsonl`, `i1_v8.py`, `add8.py`, `build_v8.py`, `plan8.py`, `v8-kilder/` | Arbeidsdata og skript. `i1_v8` kopierer `rows7.jsonl` til `rows8.jsonl` og legger til v8-radene. Deretter kjøres `build_v8` → `plan8`. `v8-kilder/` har Forskerfabrikkens 2026-kurs (bare sted, dato og pris) og postnummerlista. |

**v1–v7 kan inneholde personopplysninger og skal ikke brukes til eksport.** Dette gjelder også `leirer-v2.json`–`leirer-v7.json`. Bruk bare v8-filene.

## Status
- **verifisert**: dato, uke og pris eller alder er lest på tilbyderens egen side for 2027.
- **delvis**: tilbudet finnes på tilbyderens side, men mangler noe for 2027. For TINE-radene i v6 betyr det at klubben har en egen side for TINE Fotballskole uten 2027-dato. Siden kan være fast, eller for 2023–2026. `notat` sier hva grunnlaget er («Delvis: …»).
- **forventet**: bare en tidligere utgave er publisert. `notat` har «Forventet basert på …», fjorårets datoer og kilden.
- **dato_ikke_publisert**: fast tilbud uten dato. I JSON blir dette `forventet`.

### Sesong × status (CSV-rader)
| Sesong | verifisert | delvis | forventet | dato_ikke_publisert | sum |
|---|---|---|---|---|---|
| vinter2027 | 12 | 13 | 72 | 8 | 105 |
| paske2027 | 0 | 0 | 16 | 0 | 16 |
| sommer2027 | 39 | 55 | 286 | 3 | 383 |
| **Sum** | 51 | 68 | 374 | 11 | 504 |

I v7 var summene 50 verifisert, 68 delvis, 302 forventet og 10 dato_ikke_publisert (430 rader).

### Påmeldingsfelt
- JSON (624 objekter):
  - `pameldingStatus`: apen 39, ikke_apnet 8, full 1, null 576.
  - `pameldingApner`: 2027-01-01 ×4, 2026-11-19 ×2, null 618.
- CSV (504 rader):
  - `pamelding_status`: apen 31, ikke_apnet 8, full 1, tom 464.
  - `pamelding_apner`: 2027-01-01 ×4, 2026-11-19 ×2, tom 498.

Bare én ny rad har påmeldingsstatus: Bodø IBK (`apen`; påmeldingen til 2027-campen ligger ute). De nye `forventet`-radene bygger på 2026-sider. Påmeldingen der gjaldt 2026, så feltene står tomme.

### `lenkestatus`
Alle 59 kilde-URL-er for de nye radene svarte HTTP 200 27.11.2026, så `lenkestatus` er `ok` og `dod` er `false`.

## Nytt i v8
### Nye rader per kommune (CSV-rader)
| Kommune | Nye rader | Hva |
|---|---|---|
| Lillehammer | 13 | TINE (Lillehammer FK, Faaberg IL), friidrett, klatring, NJFF-sommerskole, Maihaugen, Forskerfabrikken, hockey, dans, tennis, vannski, sommerskiskole, KFUK-KFUM |
| Hamar | 8 | TINE (Vang FL, HamKam YA, Fart), Forskerfabrikken ×2, KFUK-KFUM, Hamar IL turncamp, PS:Dans |
| Gjøvik | 6 | TINE (Vardal, Vind, Biri), KFUK-KFUM, Farmen JR (frivilligsentralen), Husflidsuka |
| Molde | 6 | TINE (Skåla, Træff), Forskerfabrikken, Molde FK, SK Rival sandvolleyball, Molde og Omegn IF friluftslivskole |
| Ringerike | 6 | Sommerskolen (kommunen), Hønefoss BK ×3 (TINE, aktivitetsskole, augustskole), Ådal IL (TINE), Hønefoss Tennisklubb |
| Halden | 5 | TINE (Kvik Halden, Berg IL), Forskerfabrikken ×2, Halden Idrettsråd |
| Kongsberg | 4 | Sommerskolen (kommunen), golf-camp, Forskerfabrikken ×2 |
| Harstad | 4 | Grottebadet sommersvømmeskole, Harstad HK, Forskerfabrikken ×2 |
| Moss | 4 | Forskerfabrikken ×2, Moss Seilforening, Ekholt BK (påske) |
| Arendal | 4 | Forskerfabrikken ×2, Øyestad håndball-camp, Kulturkammeret sommerskole |
| Alta | 3 | Alta IF (TINE), Huset sommerskole, Alta Museum |
| Bodø | 3 | Bodø IBK Summer Camp 2027 (verifisert), B&OI Turn, Bodø HK vinterferie |
| Haugesund | 3 | Klatreskole, kunstverksted, sandvolleyball (kommunens oversikt) |
| Narvik | 2 | Narvik Turnforening, Narvik Rideskole |
| Skien | 2 | Forskerfabrikken, kommunens sommeraktiviteter (`dato_ikke_publisert`) |
| Porsgrunn | 1 | Forskerfabrikken |
| **Sum** | **74** | 72 sommer, 1 vinter, 1 påske |

### Status for de nye radene
- **verifisert: 1.** Bodø IBK Summer Camp innebandy, 9.–12.08.2027, er publisert med dato, alder og pris.
- **forventet: 72.** De bygger på 2026-utgaven (Narvik Turnforening og Lillehammer Vannskiklubb på 2025). `notat` har «Forventet basert på …», fjorårets datoer og kilden.
- **dato_ikke_publisert: 1.** Skien kommunes sommeraktiviteter. Det er et fast tilbud, men programmet legges ut før ferien.
- **Vinter og påske:** Ingen arrangør i disse kommunene har publisert 2027-datoer for vinter- eller påskeferien. To rader er lagt til etter fast mønster:
  - Bodø HK, REMA 1000 Håndballskole i vinterferien: forventet i uke 8.
  - Ekholt BK, TINE Fotballskole i påsken (Moss): forventet i uke 12.
- **Ferieuker:** De ti nye kommunene finnes ikke i `skolerute-2027.csv`. Ferieukene deres er hentet fra `skolerute-2027-alle.csv` i samme mappe:
  - vinterferie uke 8: Hamar, Gjøvik, Lillehammer, Molde, Halden og Harstad;
  - vinterferie uke 9: Ringerike og Kongsberg;
  - vinterferie uke 7: Narvik;
  - vinterferie 24.–26.02 (uke 8): Alta.

  `build_v8.py` bruker denne fila bare for de ti nye kommunene.

### Dubletter slått sammen
- **TINE-kartet mot klubbsider:** Lillehammer FK (to kartoppføringer), Faaberg IL, Hønefoss BK og Alta IF hadde både en oppføring i TINE-kartet og en egen klubbside. Fem kartoppføringer er slått sammen til fire rader med klubbsiden som kilde, og karteventens ID står i `notat`.
- **Forskerfabrikken:**
  - Kurs på flere skoler i samme kommune og for samme trinn er slått sammen til én rad med flere uker. Arendal 4.–6. trinn hadde for eksempel kurs på Stinta og Birkenlund.
  - Forskerfabrikkens fire kurs i Ringerike er en del av Sommerskolen Ringerike og ligger i den raden.
  - Den generelle v7-raden «Sommerskole (2.–6. trinn), flere byer» er beholdt for byene som ikke har egen rad.
- **Andre:**
  - KFUK-KFUM Ferieklubben Lillehammer sto både i KFUK-KFUMs sitemap og i kommunens oversikt. Den er én rad.
  - PS:Dans hadde to arrangementssider for samme uke (3.–5. og 5.–7. klasse). Den er én rad.
- **Mot v7:** Ingen nye rader overlapper med v7 på samme kommune, sesong, tilbyder og uke. TINE-radene som fantes fra før i Bodø, Haugesund, Arendal, Moss, Porsgrunn og Skien er ikke lagt til på nytt.

### Blokkerte eller manglende sider (ikke omgått)
- **Blokkert, ikke omgått:**
  - `aktiviteter.dnt.no/register/hhtsfriluftsskoleuke262026_085113` (Hamar og Hedemarken Turistforening, friluftsskole uke 26) svarte 403 med Cloudflare-sjekk.
  - `arendalsturnforening.no/sommerskole/` svarte 454 med nettleser- og brannmursjekk.
- **Ikke lest etter kildereglene:**
  - DNT-artikler på dnt.no (Kongsberg friluftsskole, Haugesund friluftssommer, Barnas Turlag Lillehammer).
  - Hoopit-lenken til Lillehammer FK.
  - Facebook-lenker (Lillehammer Seilforening og Folkeverkstedets sommerskole i søm).
- **404 per 27.11.2026:**
  - Narvik Turnforenings 2026-side (2025-siden er brukt).
  - Hafjells side om sommerferieuka.
  - Moss kommunes side om Sommerferieklubben 2026.
  - Porsgrunn kommunes side om sommerprogrammet.
  - Haugesund kommunes side «Hva skjer i sommer».

## Kjente hull (v8)
- **Sommer 2027:** Nesten ingen arrangører har publisert 2027 ennå. Unntaket er Bodø IBK. Alle de andre nye radene er `forventet` og må sjekkes igjen etter `sjekk-plan.md`.
- **Ukenummer:** 2026-ukene er beholdt, som i tidligere versjoner. Men sommerferien 2027 starter mandag 21.06 (uke 25), mens 2026-ferien startet i uke 26. Tilbud i «første ferieuke» kan derfor komme i uke 25 i 2027. Dette gjelder også eldre rader med uke 26.
- **Tynne kommuner:**
  - Porsgrunn har bare én ny rad (Forskerfabrikken). Kommunens sommerprogram ga 404, og Ung i Porsgrunn er et ungdomstilbud.
  - Narvik har to nye rader. Kommunens sommeraktiviteter er ungdomsklubbkvelder og er ikke tatt med.
  - Alta har tre nye rader. Taekwon-do-klubbens side svarte 406.
  - Harstad har fire nye rader. Sommerfryd og 68°Nord fotballskole sto bare i lokalavisen og er ikke tatt med.
  - Kongsberg, Harstad og Narvik har ingen TINE-oppføringer i 2026-kartet.
- **Ikke tatt med:**
  - TINE-arrangementer i uke 34 (SK Haugar, SK Vard Haugesund, Rygge IL), som i tidligere versjoner.
  - Friluftsrådet Sørs friluftsskole: uka for Arendal står ikke i teksten.
  - Moss Tennisklubb: uka står ikke på klubbens side.
  - Sommerles: nasjonal digital kampanje.
  - Lillehammer-tilbud som bare sto i kommunens oversikt, uten arrangørside: Hafjell, curling, søm og snekring.
- **Kulturskole og svømming:** Bare Grottebadet (Harstad) har et eget svømmekurs, og bare Arendal kulturskole (Kulturkammeret) har et sommertilbud fra kulturskolen. Ingen andre kulturskole- eller svømmekurs for sommer 2027 ble funnet på åpne sider.

## Fra v7
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

### (Fra v6)
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
- **Hoopit:** Ikke lest (heller ikke Hoopit-lenker fra klubbsider i v8).
- **Spond:** Bare fakta og lenke (SK Vedavåg, IHK Sparta). Ingen nye Spond-rader i v7.
- **KFUK-KFUM:** Ikke brukt.
- **LetsReg og DNT:** Bare enkeltoppslag på `/register/`-sider. I v4 ett LetsReg-oppslag (Fladmark Gård). I v7 svarte samme side 403, og det er ikke omgått. Cloudflare er ikke omgått.
- Alle nye rader er sjekket med WebFetch/curl mot tilbyderens egen side eller kommunens egen oversikt. Lokalaviser og søkeresultater er bare brukt som spor. Priser som bare sto i søkeutdrag (f.eks. Sjusjøen skiskole) er ikke brukt.
- Ingen kontakt med noen. Ingen påmelding, konto, innlogging, betaling eller publisering. Gapbook-arkivet er ikke rørt.

- **Personvernsøk før levering:** regex over alle v8-filer (CSV, tilbydere, JSON, sjekk-plan, README, endringer-v8): 8 siffer, `+47` og e-post, og navnemønstre i notat/pris_notat/kursnavn: 0 treff på personopplysninger. Treff på to ord med stor forbokstav var bare steds-, anleggs- og arrangementsnavn.
- **KFUK-KFUM:** Bare URL-er fra sitemapet (`/aktiviteter/event-id-…`, tillatt i robots.txt) er brukt. Ingen KFUK-KFUM-endringer i v7.
- **DNT:** Bare `/register/`-sider (Newtoncamp). Sider på dnt.no er ikke brukt.
- **v8:** Bare åpne sider. Forskerfabrikkens kurssider (`customer.forskerfabrikken.no/open/…`) er åpne påmeldingssider uten innlogging, og prisene derfra er brukt. Spond-sider (Discover og klubbsider) er brukt bare til fakta og lenke. TINE-kartets åpne datafil har kontaktfelt; de er ikke lagret. Bare stedet, datoene, alderen og prisen er brukt. Navn, e-post og telefonnumre fra kildene er ikke tatt med.

### Hull fra tidligere versjoner
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
