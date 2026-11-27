# sokeord-1126.csv – metode (26.11.2026)

Kolonner: sok, kommune, ferie, type_side, kilde, sesongtopp, trends_indeks, foreslatt_tittel, foreslatt_url, maalt, sett_i_kilde

- kilde: google-forslag (Google autocomplete, 350 forespørsler 26.11 kl. 18:44–18:52, ~1,2 s mellomrom, ingen blokkering; råsvar i raw/sokeord/google-forslag-1126.json),
  trends (Google Trends, NO, 5 år, ukesdata; råsvar raw/sokeord/trends-sokeord-1126.json + trends_raw.json; én 429 underveis, ett nytt forsøk etter ~8 min gikk gjennom),
  folk-spor-ogsa (titler/spørsmål fra WebSearch-søkesammendrag, IKKE en ekte «Folk spør også om»-boks),
  konkurrenttittel (OsloFamilie/BarnasNorge-titler fra konkurrenter-1126.md og raw/konk),
  anslag (mønster brukt på en kommune uten at søket er sett i noen kilde).
  Flere kilder skilles med «+».
- maalt=ja bare når raden har et Trends-tall (relativ interesse 0–100 innen et sammenligningssett, ikke volum). Ingen rader har absolutt søkevolum.
- sett_i_kilde=ja: søket er observert i minst én åpen kilde. nei = anslag.
- trends_indeks: 5-års snitt innen settet som står i parentes. Tall fra ulike sett kan ikke sammenlignes direkte.
- sesongtopp: målt for generiske Trends-søk; for andre rader «arvet fra generisk Trends, anslag».
- foreslatt_url: stabile URL-er uten år (år står i tittelen). Byvarianter i Trends er 0 (for lite volum), så kommune-sidene er long tail.
- Skript: sokeord_suggest.py, trends_sokeord.py, bygg_sokeord.py.
