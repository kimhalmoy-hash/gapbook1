export const LOCALES = ["nb", "sv", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export type Copy = {
  htmlLang: string;
  tagline: string;
  switcher: string;
  localeName: Record<Locale, string>;
  heroTitle: string;
  heroSub: string;
  ctaFind: string;
  ctaProviderNav: string;
  howTitle: string;
  steps: { t: string; d: string }[];
  seasonsTitle: string;
  seasonBlurb: Record<"vinter" | "sommer" | "host" | "paske", string>;
  seasonName: Record<"vinter" | "sommer" | "host" | "paske", string>;
  providerTitle: string;
  providerBody: string;
  providerCta: string;
  providerSubject: string;
  tipTitle: string;
  tipBody: string;
  tipCta: string;
  tipSubject: string;
  emailLabel: string;
  trust: string;
  privacyTitle: string;
  privacyH1: string;
  privacyLink: string;
  summerBoth: string;
  summerStart: string;
  summerSourceFirst: string;
  empty: string;
  featuredLink: string;
  featuredPageTitle: string;
  featuredPageDescription: string;
  featuredH1: string;
  featuredIntro: string;
  featuredGetTitle: string;
  featuredGet: string[];
  featuredStartTitle: string;
  featuredStart: string[];
  featuredCta: string;
  featuredSubject: string;
  featuredFaqTitle: string;
  featuredFaq: { q: string; a: string }[];
  expected: string;
  partial: string;
  example: string;
  ageMissing: string;
  priceMissing: string;
  fromAge: string;
  toAge: string;
  ageRange: string;
  years: string;
  week: string;
  weeks: string;
  fromPrice: string;
  weeksHeading: string;
  signup: string;
  seeOrganiser: string;
  lastYearPrice: string;
  lastYearFree: string;
  gratis: string;
  weekWord: string;
  h1Season: string;
  h1SeasonWeek: string;
  h1Week: string;
  h1WeekHoliday: string;
  h1Place: string;
  h1PlaceWeek: string;
  h1HolidayPlace: string;
  h1HolidayPlaceNoWeek: string;
  pamelding: { apen: string; ikke_apnet: string; full: string; stengt: string; ukjent: string };
  opens: string;
  openedCheck: string;
  checked: string;
  providerSite: string;
  note: string;
  source: string;
  sourceLink: string;
  ownDates: string;
  datesResolved: string;
  lastYearLine: string;
  expectedShort: string;
  expectedSummer: string;
  expectedSummerWeek: string;
  showMore: string;
  seeAll: string;
  explore: string;
  holidayHeading: string;
  schoolCalendarNb: string;
  offThisWeek: string;
  offThisSeason: string;
  inHoliday: string;
  calendarWeek: string;
  filters: { week: string; place: string; type: string; age: string; all: string; count: string };
  homeTitle: string;
  homeDescription: string;
  weekTitle: string;
  weekDescription: string;
  placeTitle: string;
  placeDescription: string;
  typeTitle: string;
  typeDescription: string;
  seasonTitle: string;
  seasonDescription: string;
  detailDescription: string;
  breadcrumbHome: string;
  notFoundTitle: string;
  notFoundBody: string;
  types: Record<string, string>;
};

const typesNb: Record<string, string> = {
  idrettsleir: "Idrett",
  skikurs: "Ski",
  naturleir: "Natur og friluft",
  klatring: "Klatring",
  ridning: "Ridning",
  musikk: "Musikk",
  "gaming/kodekurs": "Gaming og koding",
  kodekurs: "Teknologi og koding",
  multiaktivitet: "Flere aktiviteter",
  seilleir: "Sjø og seiling",
  "vannsport/seilleir": "Sjø og vannsport",
  teater: "Teater",
  "realfag/forskerkurs": "Realfag",
};

const typesSv: Record<string, string> = {
  idrettsleir: "Idrott",
  skikurs: "Skidor",
  naturleir: "Natur och friluftsliv",
  klatring: "Klättring",
  ridning: "Ridning",
  musikk: "Musik",
  "gaming/kodekurs": "Spel och programmering",
  kodekurs: "Teknik och programmering",
  multiaktivitet: "Flera aktiviteter",
  seilleir: "Hav och segling",
  "vannsport/seilleir": "Hav och vattensport",
  teater: "Teater",
  "realfag/forskerkurs": "Naturvetenskap",
};

const typesEn: Record<string, string> = {
  idrettsleir: "Sports",
  skikurs: "Skiing",
  naturleir: "Nature and outdoors",
  klatring: "Climbing",
  ridning: "Horse riding",
  musikk: "Music",
  "gaming/kodekurs": "Gaming and coding",
  kodekurs: "Tech and coding",
  multiaktivitet: "Multi-activity",
  seilleir: "Sea and sailing",
  "vannsport/seilleir": "Sea and watersports",
  teater: "Theatre",
  "realfag/forskerkurs": "Science",
};

export const COPY: Record<Locale, Copy> = {
  nb: {
    htmlLang: "nb",
    tagline: "Ferieuka, ordnet.",
    switcher: "Språk",
    localeName: { nb: "Norsk", sv: "Svenska", en: "English" },
    heroTitle: "Finn ukekurs og leirer for barna, uke for uke",
    heroSub: "Sommer, høst, vinter og påske. Se hva som finnes der du bor, sammenlign og meld på hos arrangøren.",
    ctaFind: "Finn aktivitet",
    ctaProviderNav: "Bli synlig på WeekSlot",
    howTitle: "Slik funker det",
    steps: [
      { t: "Velg ferieuke og sted", d: "Filtrer på uke, kommune, type og alder." },
      { t: "Sammenlign alder, tider og pris", d: "Vi viser fakta fra arrangørens egen side." },
      { t: "Meld på direkte hos arrangøren", d: "Påmeldingen skjer hos den som arrangerer." },
    ],
    seasonsTitle: "Feriene",
    seasonBlurb: {
      sommer: "Ukekurs og leirer hele sommeren, uke for uke.",
      host: "Én uke, mye å velge mellom.",
      vinter: "Ski, is og innendørs moro.",
      paske: "Kurs og leirer i påskeuka.",
    },
    seasonName: { vinter: "Vinterferie", sommer: "Sommerleir", host: "Høstferie", paske: "Påske" },
    providerTitle: "Har du ukekurs eller leir for barn?",
    providerBody: "Det er gratis å bli lagt inn. Send oss navn, uke, sted, alder, tider, pris og en lenke til påmeldingen.",
    providerCta: "Send oss tilbudet ditt",
    providerSubject: "Nytt tilbud til WeekSlot",
    tipTitle: "Mangler det en leir du kjenner til?",
    tipBody: "Tips oss, så sjekker vi og legger den inn.",
    tipCta: "Tips oss",
    tipSubject: "Tips til WeekSlot",
    emailLabel: "E-post",
    trust: "Vi viser arrangørenes egne opplysninger. Sjekk alltid detaljene hos arrangøren før påmelding.",
    privacyTitle: "Personvern | WeekSlot",
    privacyH1: "Personvern",
    privacyLink: "Personvern",
    summerBoth: "Sommerferie: fra {fra} til {til} (uke {uker}){detalj}",
    summerStart: "Sommerferien starter {fra} (uke {uker}). Slutten er ikke publisert.{detalj}",
    summerSourceFirst: "Kilde, første skoledag",
    empty: "Ingen tilbud registrert her ennå. Kjenner du en arrangør? Tips oss.",
    featuredLink: "For arrangører",
    featuredPageTitle: "Legg inn ferietilbudet ditt gratis | WeekSlot for arrangører",
    featuredPageDescription:
      "Har du ukekurs eller leir for barn i skoleferien? Det er gratis å bli lagt inn på WeekSlot. Foreldre finner deg etter uke og kommune.",
    featuredH1: "Bli sett av foreldre som planlegger ferieuka",
    featuredIntro: "WeekSlot viser ukekurs og leirer for barn, sortert etter uke og kommune. Det er gratis å bli lagt inn.",
    featuredGetTitle: "Dette får du",
    featuredGet: [
      "Tilbudet ditt vises på sidene for riktig uke, kommune og type aktivitet.",
      "Foreldre ser alder, tider, pris og lenke til påmeldingen din.",
      "Påmelding og betaling skjer hos deg, som før.",
    ],
    featuredStartTitle: "Slik kommer du i gang",
    featuredStart: [
      "Send oss tilbudet ditt på kontakt@weekslot.com: navn, uke, sted, alder, tider, pris og lenke til påmeldingen.",
      "Vi legger det inn og gir beskjed når det er synlig.",
    ],
    featuredCta: "Send oss tilbudet ditt",
    featuredSubject: "Nytt tilbud på WeekSlot",
    featuredFaqTitle: "Spørsmål og svar",
    featuredFaq: [
      {
        q: "Koster det noe?",
        a: "Nei. Det er gratis å bli lagt inn.",
      },
      {
        q: "Tar WeekSlot påmeldinger eller betaling?",
        a: "Nei. Foreldre går videre til din egen påmelding.",
      },
      {
        q: "Hva om jeg vil endre opplysningene?",
        a: "Send oss en e-post på kontakt@weekslot.com, så oppdaterer vi.",
      },
    ],
    expected: "Forventet – {år}-dato ikke publisert ennå",
    partial: "Noe mangler på kilden",
    example: "Eksempel",
    ageMissing: "Alder ikke oppgitt",
    priceMissing: "Pris ikke oppgitt",
    fromAge: "fra {alder} år",
    toAge: "til {alder} år",
    ageRange: "{fra}–{til} år",
    years: "år",
    week: "Uke {nr}",
    weeks: "Uke {nr}",
    fromPrice: "fra {pris}",
    weeksHeading: "Ukene",
    signup: "Meld på hos arrangøren",
    seeOrganiser: "Se arrangørens side",
    lastYearPrice: "I fjor: {pris}",
    lastYearFree: "I fjor: gratis",
    gratis: "Gratis",
    weekWord: "uke",
    h1Season: "{ferie}: kurs og leirer for barn",
    h1SeasonWeek: "{ferie} (uke {uke}): kurs og leirer for barn",
    h1Week: "Uke {nr} {aar}: kurs og leirer for barn",
    h1WeekHoliday: "{ferie}, uke {nr}: kurs og leirer for barn",
    h1Place: "Kurs og leirer for barn i {by}",
    h1PlaceWeek: "Kurs og leirer for barn i {by} ({uker})",
    h1HolidayPlace: "{ferie} {by} {aar} (uke {uke}): aktiviteter, kurs og leirer for barn",
    h1HolidayPlaceNoWeek: "{ferie} {by} {aar}: aktiviteter, kurs og leirer for barn",
    pamelding: {
      apen: "Påmelding åpen",
      ikke_apnet: "Påmeldingen er ikke åpnet",
      full: "Fulltegnet",
      stengt: "Påmeldingen er stengt",
      ukjent: "Påmelding: ukjent – sjekk arrangørens side",
    },
    opens: "Påmeldingen åpner {dato}",
    openedCheck: "Påmeldingen åpnet {dato} – sjekk arrangørens side",
    checked: "Sist sjekket {dato}",
    providerSite: "Arrangørens nettsted",
    note: "Merknad",
    source: "Kilde",
    sourceLink: "Kilde: arrangørens nettsted",
    ownDates: "Kommunens egne datoer er brukt",
    datesResolved: "Datoene følger det nyeste offisielle vedtaket.",
    lastYearLine: "Fjorårets dato: {dato}",
    expectedShort: "Forventet ut fra fjorårets opplegg",
    expectedSummer: "Forventet sommeren {aar} · i {fjor}: uke {uker}",
    expectedSummerWeek: "I {fjor}: uke {uker}",
    showMore: "Vis flere",
    seeAll: "Se alle",
    explore: "Utforsk",
    holidayHeading: "Skolerute",
    schoolCalendarNb: "Skoleruta på norsk",
    offThisWeek: "Kommuner med fri denne uken, der vi har skolerute",
    offThisSeason: "Kommuner med fri, der vi har skolerute",
    inHoliday: "I {ferie}",
    calendarWeek: "Kalenderuke {nr}: {fra}–{til}",
    filters: {
      week: "Velg uke",
      place: "Velg by eller kommune",
      type: "Velg type",
      age: "Alder",
      all: "Alle",
      count: "{n} tilbud",
    },
    homeTitle: "Finn ukekurs og leirer for barn | WeekSlot",
    homeDescription: "WeekSlot samler ukekurs og leirer for barn i hver skoleferie, sortert etter uke og by. Ferieuka, ordnet.",
    weekTitle: "Ukekurs og leirer uke {nr} {år} | WeekSlot",
    weekDescription: "Uke {nr} {år}. Se ukekurs og leirer for barn, og hvilke kommuner som har fri der vi har skolerute.",
    placeTitle: "Ukekurs og leirer for barn i {by} | WeekSlot",
    placeDescription: "Fra fotballskole til naturleir i {by}, sortert på uke. Datoene for høstferie, vinterferie og påske kommer fra skoleruta.",
    typeTitle: "{type} for barn – ukekurs og leirer | WeekSlot",
    typeDescription: "Se {type} uke for uke. Velg kommune for å se hva som er nær deg.",
    seasonTitle: "Ukekurs og leirer i {ferie} | WeekSlot",
    seasonDescription: "{ferie}. Ukekurs og leirer for barn, uke for uke, med skolerute der vi har den.",
    detailDescription: "{tittel} hos {tilbyder} i {sted}. Meld på hos arrangøren.",
    breadcrumbHome: "Forside",
    notFoundTitle: "Siden finnes ikke",
    notFoundBody: "Vi fant ikke siden. Gå til forsiden og velg uke, kommune eller ferie.",
    types: typesNb,
  },
  sv: {
    htmlLang: "sv",
    tagline: "Lovveckan, fixad.",
    switcher: "Språk",
    localeName: { nb: "Norsk", sv: "Svenska", en: "English" },
    heroTitle: "Hitta veckokurser och läger för barnen, vecka för vecka",
    heroSub: "Sommar, höst, sportlov och påsk. Se vad som finns där du bor, jämför och anmäl hos arrangören.",
    ctaFind: "Hitta aktivitet",
    ctaProviderNav: "Synas på WeekSlot",
    howTitle: "Så funkar det",
    steps: [
      { t: "Välj lovvecka och ort", d: "Filtrera på vecka, kommun, typ och ålder." },
      { t: "Jämför ålder, tider och pris", d: "Vi visar fakta från arrangörens egen sida." },
      { t: "Anmäl direkt hos arrangören", d: "Anmälan görs hos den som arrangerar." },
    ],
    seasonsTitle: "Loven",
    seasonBlurb: {
      sommer: "Veckokurser och läger hela sommaren, vecka för vecka.",
      host: "En vecka, mycket att välja mellan.",
      vinter: "Skidor, is och inomhusskoj.",
      paske: "Kurser och läger under påsklovet.",
    },
    seasonName: { vinter: "Sportlov", sommer: "Sommarlov", host: "Höstlov", paske: "Påsklov" },
    providerTitle: "Har du veckokurs eller läger för barn?",
    providerBody: "Det är gratis att bli inlagd. Skicka namn, vecka, plats, ålder, tider, pris och en länk till anmälan.",
    providerCta: "Skicka ditt erbjudande",
    providerSubject: "Nytt erbjudande till WeekSlot",
    tipTitle: "Saknas ett läger du känner till?",
    tipBody: "Tipsa oss, så kollar vi och lägger in det.",
    tipCta: "Tipsa oss",
    tipSubject: "Tips till WeekSlot",
    emailLabel: "E-post",
    trust: "Vi visar arrangörernas egna uppgifter. Kontrollera alltid detaljerna hos arrangören före anmälan.",
    privacyTitle: "Integritet | WeekSlot",
    privacyH1: "Integritet",
    privacyLink: "Integritet",
    summerBoth: "Sommarlov: från {fra} till {til} (vecka {uker}){detalj}",
    summerStart: "Sommarlovet börjar {fra} (vecka {uker}). Slutet är inte publicerat.{detalj}",
    summerSourceFirst: "Källa, första skoldagen",
    empty: "Inga erbjudanden registrerade här än. Känner du en arrangör? Tipsa oss.",
    featuredLink: "För arrangörer",
    featuredPageTitle: "Lägg in ditt lovtillbud gratis | WeekSlot för arrangörer",
    featuredPageDescription:
      "Har du veckokurs eller läger för barn på skollovet? Det är gratis att synas på WeekSlot. Föräldrar hittar dig efter vecka och kommun.",
    featuredH1: "Syns för föräldrar som planerar lovveckan",
    featuredIntro:
      "WeekSlot visar veckokurser och läger för barn, sorterade efter vecka och kommun. Det är gratis att bli inlagd.",
    featuredGetTitle: "Det här får du",
    featuredGet: [
      "Ditt erbjudande visas på sidorna för rätt vecka, kommun och typ av aktivitet.",
      "Föräldrar ser ålder, tider, pris och länk till din anmälan.",
      "Anmälan och betalning sker hos dig, som förut.",
    ],
    featuredStartTitle: "Så kommer du igång",
    featuredStart: [
      "Skicka ditt erbjudande till kontakt@weekslot.com: namn, vecka, plats, ålder, tider, pris och länk till anmälan.",
      "Vi lägger in det och meddelar när det syns.",
    ],
    featuredCta: "Skicka ditt erbjudande",
    featuredSubject: "Nytt erbjudande på WeekSlot",
    featuredFaqTitle: "Frågor och svar",
    featuredFaq: [
      {
        q: "Kostar det något?",
        a: "Nej. Det är gratis att bli inlagd.",
      },
      {
        q: "Tar WeekSlot emot anmälningar eller betalning?",
        a: "Nej. Föräldrar går vidare till din egen anmälan.",
      },
      {
        q: "Vad gör jag om jag vill ändra uppgifterna?",
        a: "Mejla oss på kontakt@weekslot.com, så uppdaterar vi.",
      },
    ],
    expected: "Förväntat – {år}-datum inte publicerat än",
    partial: "Något saknas hos källan",
    example: "Exempel",
    ageMissing: "Ålder inte angiven",
    priceMissing: "Pris inte angivet",
    fromAge: "från {alder} år",
    toAge: "till {alder} år",
    ageRange: "{fra}–{til} år",
    years: "år",
    week: "Vecka {nr}",
    weeks: "Vecka {nr}",
    fromPrice: "från {pris}",
    weeksHeading: "Veckorna",
    signup: "Anmäl hos arrangören",
    seeOrganiser: "Se arrangörens sida",
    lastYearPrice: "I fjol: {pris}",
    lastYearFree: "I fjol: gratis",
    gratis: "Gratis",
    weekWord: "vecka",
    h1Season: "{ferie}: kurser och läger för barn",
    h1SeasonWeek: "{ferie} (vecka {uke}): kurser och läger för barn",
    h1Week: "Vecka {nr} {aar}: kurser och läger för barn",
    h1WeekHoliday: "{ferie}, vecka {nr}: kurser och läger för barn",
    h1Place: "Kurser och läger för barn i {by}",
    h1PlaceWeek: "Kurser och läger för barn i {by} ({uker})",
    h1HolidayPlace: "{ferie} {by} {aar} (vecka {uke}): aktiviteter, kurser och läger för barn",
    h1HolidayPlaceNoWeek: "{ferie} {by} {aar}: aktiviteter, kurser och läger för barn",
    pamelding: {
      apen: "Anmälan öppen",
      ikke_apnet: "Anmälan har inte öppnat",
      full: "Fulltecknat",
      stengt: "Anmälan är stängd",
      ukjent: "Anmälan: okänd – kolla arrangörens sida",
    },
    opens: "Anmälan öppnar {dato}",
    openedCheck: "Anmälan öppnade {dato} – kolla arrangörens sida",
    checked: "Senast kollad {dato}",
    providerSite: "Arrangörens webbplats",
    note: "Anmärkning",
    source: "Källa",
    sourceLink: "Källa: arrangörens webbplats",
    ownDates: "Kommunens egna datum används",
    datesResolved: "Datumen följer det senaste officiella beslutet.",
    lastYearLine: "Fjolårets datum: {dato}",
    expectedShort: "Förväntat utifrån förra årets upplägg",
    expectedSummer: "Förväntat sommaren {aar} · i {fjor}: vecka {uker}",
    expectedSummerWeek: "I {fjor}: vecka {uker}",
    showMore: "Visa fler",
    seeAll: "Se alla",
    explore: "Utforska",
    holidayHeading: "Skolkalender",
    schoolCalendarNb: "Skolkalender på norska",
    offThisWeek: "Kommuner som är lediga den här veckan, där vi har skolkalender",
    offThisSeason: "Kommuner som är lediga, där vi har skolkalender",
    inHoliday: "Under {ferie}",
    calendarWeek: "Kalendervecka {nr}: {fra}–{til}",
    filters: {
      week: "Välj vecka",
      place: "Välj ort eller kommun",
      type: "Välj typ",
      age: "Ålder",
      all: "Alla",
      count: "{n} erbjudanden",
    },
    homeTitle: "Hitta veckokurser och läger för barn | WeekSlot",
    homeDescription: "WeekSlot samlar veckokurser och läger för barn under varje skollov, sorterat efter vecka och ort.",
    weekTitle: "Veckokurser och läger vecka {nr} {år} | WeekSlot",
    weekDescription: "Vecka {nr} {år}. Se veckokurser och läger för barn, och vilka kommuner som är lediga där vi har skolkalender.",
    placeTitle: "Veckokurser och läger för barn i {by} | WeekSlot",
    placeDescription: "Från fotbollsskola till naturläger i {by}, sorterat efter vecka. Lovdatum kommer från skolkalendern.",
    typeTitle: "{type} för barn – veckokurser och läger | WeekSlot",
    typeDescription: "Se {type} vecka för vecka. Välj ort för att se vad som finns nära dig.",
    seasonTitle: "Veckokurser och läger under {ferie} | WeekSlot",
    seasonDescription: "{ferie}. Veckokurser och läger för barn, vecka för vecka.",
    detailDescription: "{tittel} hos {tilbyder} i {sted}. Anmäl hos arrangören.",
    breadcrumbHome: "Startsida",
    notFoundTitle: "Sidan finns inte",
    notFoundBody: "Vi hittade inte sidan. Gå till startsidan och välj vecka, kommun eller lov.",
    types: typesSv,
  },
  en: {
    htmlLang: "en",
    tagline: "Holiday week, sorted.",
    switcher: "Language",
    localeName: { nb: "Norsk", sv: "Svenska", en: "English" },
    heroTitle: "Find week-long courses and camps for kids, week by week",
    heroSub: "Summer, autumn, winter and Easter. See what's on near you, compare, and sign up with the organiser.",
    ctaFind: "Find an activity",
    ctaProviderNav: "Get listed on WeekSlot",
    howTitle: "How it works",
    steps: [
      { t: "Pick a holiday week and place", d: "Filter by week, municipality, type and age." },
      { t: "Compare ages, times and prices", d: "We show facts from the organiser's own page." },
      { t: "Sign up with the organiser", d: "Registration happens on the organiser's site." },
    ],
    seasonsTitle: "The holidays",
    seasonBlurb: {
      sommer: "Courses and camps all summer, week by week.",
      host: "One week, plenty to choose from.",
      vinter: "Skiing, ice and indoor fun.",
      paske: "Courses and camps in Easter week.",
    },
    seasonName: { vinter: "Winter break", sommer: "Summer", host: "Autumn break", paske: "Easter" },
    providerTitle: "Run a week-long course or camp for kids?",
    providerBody: "Listing is free. Send the name, week, place, ages, times, price and a link to sign-up.",
    providerCta: "Send us your listing",
    providerSubject: "New listing for WeekSlot",
    tipTitle: "Missing a camp you know about?",
    tipBody: "Tell us, and we'll check it and add it.",
    tipCta: "Send a tip",
    tipSubject: "Tip for WeekSlot",
    emailLabel: "Email",
    trust: "We show the organisers' own information. Always check the details with the organiser before signing up.",
    privacyTitle: "Privacy | WeekSlot",
    privacyH1: "Privacy",
    privacyLink: "Privacy",
    summerBoth: "Summer holiday: from {fra} to {til} (week {uker}){detalj}",
    summerStart: "The summer holiday starts {fra} (week {uker}). The end date is not published.{detalj}",
    summerSourceFirst: "Source, first school day",
    empty: "No listings here yet. Know an organiser? Send us a tip.",
    featuredLink: "For organisers",
    featuredPageTitle: "List your holiday activity for free | WeekSlot for organisers",
    featuredPageDescription:
      "Do you run a week-long course or camp for kids in the school holidays? Listing on WeekSlot is free. Parents find you by week and municipality.",
    featuredH1: "Get seen by parents planning the holiday week",
    featuredIntro: "WeekSlot shows week-long courses and camps for kids, sorted by week and municipality. Listing is free.",
    featuredGetTitle: "What you get",
    featuredGet: [
      "Your activity appears on the pages for the right week, municipality and type of activity.",
      "Parents see age, times, price and a link to your sign-up.",
      "Sign-up and payment stay with you, as before.",
    ],
    featuredStartTitle: "How to get started",
    featuredStart: [
      "Send us your activity at kontakt@weekslot.com: name, week, place, age, times, price and a link to sign-up.",
      "We add it and let you know when it's live.",
    ],
    featuredCta: "Send us your activity",
    featuredSubject: "New listing on WeekSlot",
    featuredFaqTitle: "Questions and answers",
    featuredFaq: [
      {
        q: "Does it cost anything?",
        a: "No. Listing is free.",
      },
      {
        q: "Does WeekSlot take sign-ups or payments?",
        a: "No. Parents go straight to your own sign-up.",
      },
      {
        q: "What if I want to change the details?",
        a: "Email us at kontakt@weekslot.com and we'll update it.",
      },
    ],
    expected: "Expected – {år} dates not published yet",
    partial: "Some details are missing at the source",
    example: "Example",
    ageMissing: "Age not stated",
    priceMissing: "Price not stated",
    fromAge: "from age {alder}",
    toAge: "up to age {alder}",
    ageRange: "{fra}–{til} years",
    years: "years",
    week: "Week {nr}",
    weeks: "Week {nr}",
    fromPrice: "from {pris}",
    weeksHeading: "Weeks",
    signup: "Sign up with the organiser",
    seeOrganiser: "See the organiser's page",
    lastYearPrice: "Last year: {pris}",
    lastYearFree: "Last year: free",
    gratis: "Free",
    weekWord: "week",
    h1Season: "{ferie}: courses and camps for kids",
    h1SeasonWeek: "{ferie} (week {uke}): courses and camps for kids",
    h1Week: "Week {nr} {aar}: courses and camps for kids",
    h1WeekHoliday: "{ferie}, week {nr}: courses and camps for kids",
    h1Place: "Courses and camps for kids in {by}",
    h1PlaceWeek: "Courses and camps for kids in {by} ({uker})",
    h1HolidayPlace: "{ferie} {by} {aar} (week {uke}): activities, courses and camps for kids",
    h1HolidayPlaceNoWeek: "{ferie} {by} {aar}: activities, courses and camps for kids",
    pamelding: {
      apen: "Registration open",
      ikke_apnet: "Registration has not opened",
      full: "Sold out",
      stengt: "Registration is closed",
      ukjent: "Registration: unknown – check the organiser's page",
    },
    opens: "Registration opens {dato}",
    openedCheck: "Registration opened {dato} – check the organiser's page",
    checked: "Last checked {dato}",
    providerSite: "Organiser's website",
    note: "Note",
    source: "Source",
    sourceLink: "Source: the organiser's website",
    ownDates: "The municipality's own dates are used",
    datesResolved: "The dates follow the latest official decision.",
    lastYearLine: "Last year's dates: {dato}",
    expectedShort: "Expected from last year's listing",
    expectedSummer: "Expected summer {aar} · in {fjor}: week {uker}",
    expectedSummerWeek: "In {fjor}: week {uker}",
    showMore: "Show more",
    seeAll: "See all",
    explore: "Explore",
    holidayHeading: "School calendar",
    schoolCalendarNb: "School calendar in Norwegian",
    offThisWeek: "Municipalities off this week, where we have a school calendar",
    offThisSeason: "Municipalities off, where we have a school calendar",
    inHoliday: "In the {ferie}",
    calendarWeek: "Calendar week {nr}: {fra}–{til}",
    filters: {
      week: "Choose week",
      place: "Choose town or municipality",
      type: "Choose type",
      age: "Age",
      all: "Any",
      count: "{n} listings",
    },
    homeTitle: "Find week-long courses and camps for kids | WeekSlot",
    homeDescription: "WeekSlot brings together week-long courses and camps for kids in every school holiday, sorted by week and town.",
    weekTitle: "Kids' courses and camps week {nr} {år} | WeekSlot",
    weekDescription: "Week {nr} {år}. Courses and camps for kids, and which municipalities are off where we have a school calendar.",
    placeTitle: "Kids' courses and camps in {by} | WeekSlot",
    placeDescription: "From football schools to nature camps in {by}, sorted by week. Holiday dates come from the school calendar.",
    typeTitle: "{type} for kids – courses and camps | WeekSlot",
    typeDescription: "See {type} week by week. Choose a town to see what's near you.",
    seasonTitle: "Kids' courses and camps in {ferie} | WeekSlot",
    seasonDescription: "{ferie}. Week-long courses and camps for kids, week by week.",
    detailDescription: "{tittel} by {tilbyder} in {sted}. Sign up with the organiser.",
    breadcrumbHome: "Home",
    notFoundTitle: "Page not found",
    notFoundBody: "We couldn't find that page. Go to the front page and choose a week, town or holiday.",
    types: typesEn,
  },
};

export function copy(locale: Locale): Copy {
  return COPY[locale];
}

export function fyll(mal: string, verdier: Record<string, string | number | null | undefined>): string {
  return mal.replace(/\{([^}]+)\}/g, (_, nokkel: string) => {
    const verdi = verdier[nokkel];
    return verdi == null ? "" : String(verdi);
  });
}

export function intlLocale(locale: Locale): string {
  if (locale === "sv") return "sv-SE";
  if (locale === "en") return "en-GB";
  return "nb-NO";
}
