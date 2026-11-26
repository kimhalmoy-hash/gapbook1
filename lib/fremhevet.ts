export function fremhevetFaq(pris: number) {
  return [
    {
      q: "Må jeg betale for å være med?",
      a: "Nei. Grunnoppføringen er gratis. Fremhevet er et valg for deg som vil ha mer synlighet.",
    },
    {
      q: "Tar WeekSlot påmeldinger eller betaling?",
      a: "Nei. Foreldre går videre til din egen påmelding.",
    },
    {
      q: "Hvordan vet foreldre at noe er fremhevet?",
      a: "Alle betalte plasseringer er merket «Fremhevet» eller «Annonse».",
    },
    {
      q: "Hva om jeg vil endre opplysningene?",
      a: "Send oss en e-post på kontakt@weekslot.com, så oppdaterer vi.",
    },
    {
      q: "Hva koster Fremhevet?",
      a: `Fremhevet koster ${pris} kr per kommune per uke. To kommuner samme uke koster ${pris * 2} kr.`,
    },
  ];
}
