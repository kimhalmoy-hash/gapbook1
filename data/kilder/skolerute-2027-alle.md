# skolerute-2027-alle.csv – metode (26.11.2026, avvik avklart samme dag)

Alle 357 kommuner, samme kolonner som skolerute-2027.csv. Høstferie 2026, vinterferie og påske 2027 (skoleåret 2026/27).
Datoer = første og siste hverdag elevene har fri. paske_til er normalt 2. påskedag 29.03; 30.03 eller 31.03 der kommunen har ekstra fridager.

## Kilder (bare offisielle)
- Kommuneliste og folketall: SSB tabell 01222, 2026K3 (ssb_01222.json) + KLASS 131/104 (src/alle/klass*.json). rang = rangering etter folketall.
  Kommunenavn: norsk navn (fra Brønnøysundregistrene) for kommuner med flere offisielle navn.
- Hjemmesider: Enhetsregisteret (src/alle/brreg_komm.json).
- Lovdata: Lovdatas åpne data «Lovtidend avd. II – lokale forskrifter» (api.lovdata.no/v1/publicData, NLOD), lastet ned og søkt lokalt (src/alle/lovdata/). Lovdatas søkesider (/sok) er sperret i robots.txt og er ikke brukt.
- Kommunenes egne sider/PDF-er: funnet via sitemap.xml, lenker fra forsiden, kommunens eget søkefelt, og for noen få via nettsøk som pekte rett på kommunens fil. Kopier i src/alle/sider/ (filnavn = kommunenummer_md5(url)).
- region-felles: bare der kommunens egen side lenker til felles rute (Namsos → Trøndelag fylkeskommune; Grue og Engerdal → «Skolerute Innlandet 2026-2027», datoer fra Innlandet fylkeskommunes forskrift FOR-2026-06-16-1160).
- Ingen aggregatorer (skoleferier.no, skolerute.com, skoleruta.com, hemvik.no, skole-rute.no, familiekabalen.no o.l.) er brukt, selv der nettsøk viste dem.

## Prioritet og kontroll
- Automatisk valg: kommunens side/PDF foran Lovdata. Avvik mellom kildene avklares manuelt etter regelen
  **nyeste offisielle vedtak gjelder**. Det kan være en forskrift eller endringsforskrift i Lovdata, et politisk vedtak
  eller kommunens side når den viser til et nyere vedtak. Bergen-regelen gjelder ikke lenger.
  Merknad sier hvilken kilde som er brukt, vedtaksdatoen og hva den andre kilden sa. Finner vi ikke hvilken kilde
  som er nyest, beholdes verdien med «Uavklart avvik» og en begrunnelse.
  Avklaringene ligger i overstyr.py. `python3 avvik_scan.py` lister alle kommuner der Lovdata (også endringsforskrifter)
  og kommunens side eller raden er uenige. `python3 lovtekst.py FOR-ÅÅÅÅ-MM-DD-NR` viser forskriftsteksten fra den lokale kopien.
- Automatisk uttrekk (skolerute_parse.py) med kontroller: uke beregnes fra dato (ISO), høst må være uke 39–41, vinter 7–10, start mandag/slutt fredag (unntak: kjente 3-dagers ferier ons–fre i Troms/Finnmark), flerårige dokumenter avgrenses til 2026/27.
- Rader som feilet kontrollen er lest manuelt (merknad starter med «Manuelt kontrollert», se overstyr.py). Noen kalender-PDF-er/bilder er lest visuelt (Hammerfest, Folldal, Birkenes, Herøy i Nordland).
- «bare uketall»: kilden oppgir bare uke; datoene er mandag–fredag i den uka (står i merknad).
- Planleggingsdager er ikke med.

## Kjør på nytt
    python3 alle_base.py && python3 lovdata_run.py && python3 discover.py && python3 crawl.py \
      && python3 fetchparse.py && python3 overstyr.py && python3 bygg_skolerute_alle.py
(src/alle/lovdata/idx.py bygger Lovdata-indeksen etter ny nedlasting; sitesok.py og hent.py er hjelpeverktøy for enkeltkommuner.)
Alle henteskript bruker én forespørsel om gangen per domene med 1,5 s pause.

## Avvik avklart 26.11.2026
- Byttet til nyeste vedtak (endringsforskrift): Bergen (FOR-2025-06-23-1333, vinter 1.–5.03), Tvedestrand (FOR-2026-02-11-872, påske t.o.m. 30.03).
  For Oslo, Sogndal, Austevoll, Tinn og Hol gjengir endringsforskriften hele tabellen med samme datoer, og den er nå kilde.
  Høyanger og Vik har endringer som ikke berører feriene.
- Rettet feil fra automatisk tolking: Ullensvang (påske t.o.m. 29.03), Valle (høstferie 28.09–02.10),
  Høyanger (påske fra forskrift), Nordkapp (sammenlignet feilaktig med forskriften for 2027–28).
  Storfjord og Hægebostad var også sammenlignet med feil skoleår.
- Uavklart, verdien er beholdt: Målselv (forskriften er selvmotsigende: «uke 10» mot tabell 22.–26.02),
  Drangedal (Lovdata «uke 8» med datoene 15.–19.02; kommunens PDF sier 22.–26.02), Hemsedal (Lovdata: påske t.o.m. «mandag 5. april»),
  Røros (Lovdata: «2. påskedag 6. april») og Iveland (Lovdata: vinterferie «t.o.m. tirsdag 30.»).
- Kontrollert uten reelt avvik (feil i automatisk tolking): Asker, Sandnes, Nes, Heim, Nesodden, Vestre Toten, Sula, Nord-Odal,
  Værøy, Bø, Vardø, Åseral (skrivefeil «30. april» i Lovdata), Horten (nyeste forskrift 06.11.2024 = uke 41), Alver (forskrift 20.01.2026; høringen var et utkast).
- Nye rader: Alta (kommunens side, ny adresse), Rælingen (PDF fra Rud skole, felles rute for Rælingsskolen), Sirdal (Lovdata med endring).

## Gjenstår («ikke funnet», 52 kommuner, 228970 innbyggere)
- Agder (3): Lyngdal (4225, 10869), Froland (4214, 6283), Gjerstad (4211, 2518)
- Akershus (3): Frogn (3214, 16504), Gjerdrum (3230, 7529), Hurdal (3242, 3061)
- Buskerud (2): Gol (3324, 4968), Rollag (3336, 1480)
- Finnmark (4): Kautokeino (5612, 2902), Karasjok (5610, 2518), Lebesby (5624, 1223), Loppa (5614, 841)
- Innlandet (8): Eidskog (3416, 6099), Tynset (3427, 5787), Sør-Fron (3438, 3070), Dovre (3431, 2499), Alvdal (3428, 2486), Skjåk (3433, 2197), Rendalen (3424, 1838), Tolga (3426, 1606)
- Møre og Romsdal (11): Volda (1577, 10940), Herøy (Møre og Romsdal) (1515, 9034), Ulstein (1516, 8859), Sunndal (1563, 7053), Hareid (1517, 5258), Stranda (1525, 4333), Aure (1576, 3351), Tingvoll (1560, 3047), Gjemnes (1557, 2822), Sande (1514, 2390), Smøla (1573, 2123)
- Nordland (2): Meløy (1837, 6073), Træna (1835, 456)
- Rogaland (2): Randaberg (1127, 11807), Kvitsøy (1144, 574)
- Telemark (3): Notodden (4005, 13302), Seljord (4022, 2976), Tokke (4034, 2250)
- Troms (4): Sørreisa (5526, 3521), Salangen (5522, 2110), Dyrøy (5528, 1058), Lavangen (5518, 1002)
- Trøndelag (2): Overhalla (5047, 3877), Røyrvik (5043, 428)
- Vestland (5): Osterøy (4630, 8248), Gloppen (4650, 6009), Vaksdal (4628, 3898), Tysnes (4616, 3072), Fedje (4633, 516)
- Østfold (3): Våler (Østfold) (3114, 6268), Hvaler (3110, 4683), Aremark (3124, 1354)

## opencom.no (Stavanger) – kun manuell nedlasting
Beslutning 26.11.2026: **ingen automatisk henting fra opencom.no, og ingen kontakt med Stavanger kommune.**
Fila lastes ned manuelt i nettleseren én gang i året (datasett «skolerute-stavanger», ressurs «Skolerute Siste.csv»,
lisens NLOD 2.0, kilde oppgis som «Opencom.no»). opencom.no sin robots.txt (endret 19.10.2026) sperrer /api/ og
/dataset/*/resource/*/download/ for crawlere.
`opencom_skolerute.py` er et eksempel for manuell bruk. Det henter ingenting fra nettet, leser bare en fil du har
lastet ned selv, og stopper hvis det ikke kjøres fra en terminal med `--manuell`. Det skal ikke legges inn i cron,
rutiner, CI eller andre automatiske jobber.
    python3 opencom_skolerute.py src/alle/opencom/stav-2026-27.csv --manuell
Format: én rad per skole per dag (dato, skole, elevdag, laeredag, sfodag, kommentar). Det finnes år tilbake til 2015-16,
og 2027-28 er publisert.
