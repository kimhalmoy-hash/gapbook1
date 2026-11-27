# WeekSlot data/leirer.json – format v1

Fila er én JSON-array. Ett objekt per kurs/leir per uke (samme oppdeling som `data/kilder/kurs-norge-v1.csv`). UTF-8, datoer ISO `YYYY-MM-DD`. Felter som mangler på kilden settes til `null`, aldri gjettet.

```json
{
  "id": "stavanger-if-fotball-ffo-fotballskole-i-vinterferien-2-7-klasse-vinter2027-u7",
  "tittel": "FFO-fotballskole i vinterferien (2.–7. klasse)",
  "tilbyder": "Stavanger IF Fotball",
  "tilbyderUrl": "https://stavangerif.no/",
  "url": "https://stavangerif.no/na-apner-pameldingen-...",
  "type": "idrettsleir",
  "sesong": "vinter2027",
  "uke": 7,
  "datoFra": null,
  "datoTil": null,
  "alderFra": 7,
  "alderTil": 12,
  "prisNok": 150,
  "prisNotat": "2026: 150 kr/dag ...",
  "by": "Stavanger",
  "kommune": "Stavanger",
  "fylke": "Rogaland",
  "land": "NO",
  "status": "forventet",
  "notat": "Fjorår: 23.–26.02.2026 ...",
  "kildeSjekket": "2026-11-26",
  "lenkestatus": null,
  "dod": false,
  "pameldingStatus": null,
  "pameldingApner": null,
  "fremhevet": false,
  "demo": false
}
```

`scripts/importer-csv.mjs` lager stabile id-er: slug av tilbyder, tittel, sesong og uke. Eksempelet over er den faktiske algoritmen (hele tittelen, ikke et forkortet utdrag).

## Regler

- `id`: unik og stabil mellom eksporter.
- `sesong`: `vinter2027`, `paske2027`, `sommer2027`, `host2027` og tilsvarende senere år.
- `uke`: heltall når kilden oppgir én uke. Spenn og lister beholdes som tekst, for eksempel `"25-33"` eller `"26,27,32,33"`. De splittes ikke opp i nye rader.
- `prisNok`: heltall eller `null`. Et prisområde som `5900-6700` blir `null`. Teksten ligger i `prisNotat`.
- `status` (datakvalitet): `verifisert` | `delvis` | `forventet`. CSV-verdien `dato_ikke_publisert` blir `forventet` (tilbudet har bare fjorårets dato; den står i `notat`).
- `lenkestatus` settes av `sjekk-lenker.mjs`: `ok` | `usikker` | `utløpt`, eller `null` før første sjekk. `dod: true` ved 404/410/DNS-feil.
- `pameldingStatus`: `apen` | `ikke_apnet` | `full` | `stengt` | `null`. Bare når kilden sier det. Ellers `null`, som vises som «Påmelding: ukjent – sjekk arrangørens side». `sjekk-lenker` kan sette feltet fra JSON-LD `offers.availability` eller en kort «Fulltegnet»-tekst på Rubic. Den gjetter ikke ut fra brødtekst.
- `pameldingApner`: ISO-dato når påmeldingen åpner, bare hvis kilden oppgir den. Er datoen i dag eller tidligere og `pameldingStatus` er `null`, vises én linje: «Påmeldingen åpnet 19. nov. – sjekk arrangørens side». Da vises ikke «Påmelding: ukjent». En fremtidig dato vises som «Påmeldingen åpner …». Har status en verdi, vises den. `kildeSjekket` vises som «Sist sjekket».
- `fremhevet: true` bare for betalt synlighet. Vises merket «Fremhevet» (svensk «Utvald», engelsk «Featured»). Prisene står i `config/site.json`: `fremhevetPrisKr` (290 kr per kommune per uke), `toppKategoriPrisKr` (690 kr per ferie) og `sesongpakkePrisKr` (990 kr per ferie). `prisSesonger` er `vinterferie`, `paskeferie` og `hostferie`. Sommerpris er ikke satt.
- `demo: true` bare for eksempeldata. Vises aldri på indekserbare sider og tas aldri med i sitemap.
- `land`: `NO` nå, `SE` / `DK` / `FI` senere. Importen fra `kurs-norge-v1.csv` setter `NO` fordi fila er det norske datasettet. Feltet finnes ikke per rad i CSV-en.
- Personopplysninger (e-post, telefon) skal ikke ligge i tekstfeltene. Importen fjerner dem. `valider.mjs` feiler hvis noe blir igjen.
- Hoopit-lenker er ikke tillatt.

Tynne lister (færre enn 3 synlige rader med status `verifisert` eller `delvis`) får `noindex,follow` og står utenfor sitemap. `forventet` alene gjør ikke siden indekserbar. `dod` og `lenkestatus: utløpt` skjules fra listene. Utløpt sluttdato skjules også.

## data/tilbydere.json

Én rad per tilbyder fra `data/kilder/tilbydere-norge-v1.csv`. `nettside` blir `tilbyderUrl` på leirene, koblet på navnet `tilbyder`.

## data/skolerute.json

Én rad per kommune per skoleår, fra `data/kilder/skolerute-2027.csv`. `skolear` er `"2026-2027"` slik at senere skoleår kan ligge ved siden av. Ferieuker er ikke hardkodet i koden. Sidene leser denne fila.

```json
{
  "skolear": "2026-2027",
  "rang": 2,
  "kommune": "Bergen",
  "kommunenummer": "4601",
  "fylke": "Vestland",
  "folketall": 295589,
  "hostferie": { "uke": 41, "datoFra": "2026-10-05", "datoTil": "2026-10-09" },
  "vinterferie": { "uke": 9, "datoFra": "2027-03-01", "datoTil": "2027-03-05" },
  "paske": { "uke": null, "datoFra": "2027-03-22", "datoTil": "2027-03-29" },
  "kildeUrl": "https://www.bergen.kommune.no/...",
  "kildeType": "kommune",
  "merknad": "Veiledende rute; ... AVVIK I KILDE: ..."
}
```

`merknad` og `kildeUrl` beholdes ordrett. Bergen bruker kommunens egne datoer for uke 9 (01.–05.03.2027), ikke Lovdata-teksten som oppgir februar. Tromsøs høstferie er tre dager: vis `datoFra`–`datoTil`, ikke bare ukenummeret.

Et kurs treffer en ferie når datoene overlapper. Mangler kurset datoer, brukes oppgitt ukenummer mot feriens ukenummer i feriedatoens år. Kommuner uten rad viser ingen ferie. Ingen uke gjettes.

## data/kandidater.json

Skrives av `finn-leirer.mjs`. Samme felt som leirene, med `null` der fakta mangler. Filen publiseres ikke inn i `leirer.json` og er ignorert av git.
