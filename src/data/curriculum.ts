// فهرست کتاب، دقیقاً از روی صفحه‌های Inhalt
export type SectionKey = "A" | "B" | "C" | "D";

export interface Section {
  key: SectionKey;
  title: string;
  task: string;
  skills: string[];
}

export interface Lesson {
  n: number;
  title: string;
  titleFa: string;
  page: number;
  endPage: number;
  sections: Section[];
  grammar: string[];
  vocab: string[];
}

export const LESSONS: Lesson[] = [
  {
    n: 1,
    title: "Deutsch global",
    titleFa: "آلمانی در جهان",
    page: 9,
    endPage: 18,
    sections: [
      {
        key: "A",
        title: "Freut mich sehr.",
        task: "Sein Profil schreiben",
        skills: [
          "sich vorstellen und nach dem Befinden fragen",
          "alte Bekannte aus dem Kurs begrüßen",
          "nach persönlichen Informationen fragen und eine Kursliste schreiben",
        ],
      },
      {
        key: "B",
        title: "In die weite Welt",
        task: "Über wichtige Stationen in seinem Leben schreiben",
        skills: ["Lebensplanung verstehen", "sich darüber austauschen, seit wann man etwas tut"],
      },
      {
        key: "C",
        title: "Warum Deutsch?",
        task: "Über eine Person sprechen",
        skills: [
          "eine interessante Person befragen",
          "sich darüber austauschen, warum man Deutsch lernt",
          "Interesse, Überraschung ausdrücken",
          "etwas bewerten",
        ],
      },
    ],
    grammar: [
      "Perfekt: trennbare Verben",
      "Personalpronomen im Dativ",
      "Konnektor weil",
      "temporale Präposition seit + Dativ",
    ],
    vocab: ["persönliche Informationen", "Lebenspläne", "Stationen in einem Leben"],
  },
  {
    n: 2,
    title: "Gut aussehen",
    titleFa: "خوش‌پوشی و ظاهر",
    page: 19,
    endPage: 30,
    sections: [
      {
        key: "A",
        title: "In einer Boutique",
        task: "Rollenspiel: in einer Boutique",
        skills: [
          "beschreiben, welche Kleidung heute jemand trägt",
          "als Kunde in einer Boutique um Informationen bitten und seine Meinung sagen",
        ],
      },
      {
        key: "B",
        title: "Mode",
        task: "Ratespiel: Aussagen über Personen machen",
        skills: [
          "Informationen über Mode in Deutschland verstehen",
          "sich darüber austauschen, was jemand gut kann, gerne tut etc.",
        ],
      },
      {
        key: "C",
        title: "Filmstars",
        task: "Ratespiel: das Aussehen einer Person beschreiben",
        skills: [
          "sich über Haarfarbe, Augenfarbe etc. austauschen",
          "Personenbeschreibungen verstehen",
          "die Nationalität nennen",
        ],
      },
      {
        key: "D",
        title: "Ich empfehle ...",
        task: "Eine Person beschreiben, die man gerne hat",
        skills: [
          "Empfehlungen über Einkaufsmöglichkeiten in seiner Stadt geben",
          "Waren benennen und auswählen",
          "sich darüber austauschen, wie man einen Filmstar findet",
        ],
      },
    ],
    grammar: [
      "Demonstrativartikel dies- im Nominativ und Akkusativ",
      "Frageartikel welch- im Nominativ und Akkusativ",
      "Wortbildung: Nationalitäten",
      "Komparativ: schön, groß",
      "Komparativ und Superlativ: gut, viel, gerne",
    ],
    vocab: ["Kleidung", "Mode", "Geschäfte und Einkaufen", "Aussehen", "Haar- und Augenfarbe"],
  },
  {
    n: 3,
    title: "Familie und Freunde",
    titleFa: "خانواده و دوستان",
    page: 31,
    endPage: 40,
    sections: [
      {
        key: "A",
        title: "Familien",
        task: "Ratespiel: über seine Vergangenheit schreiben",
        skills: [
          "Fragen zu einem Text formulieren",
          "über seine Familie schreiben",
          "sich über die Familie austauschen",
        ],
      },
      {
        key: "B",
        title: "Paare",
        task: "Darüber schreiben, wie man seine Freundin / Frau, seinen Freund / Mann kennengelernt hat",
        skills: [
          "sich über den Charakter und das Aussehen von Personen austauschen",
          "über Ereignisse in der Vergangenheit schreiben",
        ],
      },
      {
        key: "C",
        title: "Freunde",
        task: "Sich über soziale Netzwerke austauschen",
        skills: [
          "sich über die Bedeutung von Freund bewusst werden",
          "auf eine Meinung positiv oder negativ reagieren",
          "Tipps zum Umgang mit sozialen Medien geben",
        ],
      },
    ],
    grammar: [
      "Präteritum: regelmäßige und unregelmäßige Verben",
      "Konjunktiv II sollen",
      "reziproke Verben",
      "Wortbildung: un + Adjektiv",
    ],
    vocab: ["Familie", "Familientypen", "Aussehen und Charakter", "Freunde und soziale Medien"],
  },
  {
    n: 4,
    title: "Die Ferienwohnung",
    titleFa: "خانه‌ی تعطیلات",
    page: 41,
    endPage: 52,
    sections: [
      {
        key: "A",
        title: "Wohnungstausch",
        task: "Eine Anzeige für eine Haustausch-Plattform schreiben",
        skills: [
          "sich über Haustausch im Urlaub austauschen",
          "sich darüber austauschen, was sich in der Nähe seines Wohnortes befindet",
          "die Lage von Stadtteilen beschreiben",
        ],
      },
      {
        key: "B",
        title: "Die E-Mail",
        task: "Haustausch-Partner per E-Mail kontaktieren, sich und seine Wohnung vorstellen",
        skills: [
          "Lage der Wohnung beschreiben",
          "Wohnungsanzeigen verstehen",
          "mit einem Vermieter am Telefon sprechen und Informationen über eine Wohnung erfragen",
        ],
      },
      {
        key: "C",
        title: "Küche kunterbunt",
        task: "Kursraum beschreiben",
        skills: ["sich darüber austauschen, wo Dinge stehen / liegen / hängen"],
      },
      {
        key: "D",
        title: "Stellst du sie ...",
        task: "Versteckspiel im Kurs",
        skills: [
          "notieren, wo man Dinge hingestellt / hingelegt hat",
          "sich darüber austauschen, wohin man gewöhnlich etwas legt / stellt",
        ],
      },
    ],
    grammar: [
      "Verben mit Wechselpräpositionen: legen, liegen, stehen, stellen, hängen",
      "Possessivartikel im Nominativ und Akkusativ: euer",
      "Wechselpräpositionen: in, auf, über, unter, neben, zwischen, vor, hinter",
    ],
    vocab: [
      "Wohnungsanzeige",
      "Himmelsrichtungen",
      "Lage, Größe etc. von Wohnungen",
      "Mieten einer Wohnung",
      "Wohnungseinrichtung",
      "Dinge im Haushalt",
      "Geschäfte",
    ],
  },
  {
    n: 5,
    title: "Guten Appetit",
    titleFa: "نوش جان",
    page: 53,
    endPage: 62,
    sections: [
      {
        key: "A",
        title: "Plastiktüten?",
        task: "Müll sortieren und darüber sprechen",
        skills: ["seine Meinung über eine Geschäftsidee äußern"],
      },
      {
        key: "B",
        title: "Kindergeburtstag",
        task: "Einkaufsliste für eine Kursparty besprechen",
        skills: [
          "über seinen Kindergeburtstag sprechen",
          "sich darüber austauschen, was man immer, oft ... im Kühlschrank hat",
        ],
      },
      {
        key: "C",
        title: "Ein Essen in Wien",
        task: "Jemanden zum Essen einladen",
        skills: [
          "in einem Restaurant bestellen und bezahlen",
          "höflich um etwas bitten",
          "sich über die Höhe des Trinkgelds austauschen",
        ],
      },
    ],
    grammar: [
      "Konjunktiv II: haben / können",
      "Indefinitpronomen ein- / welch- im Nominativ und Akkusativ",
    ],
    vocab: ["Verpackungen", "Lebensmittel", "Mengenangaben", "Einkaufsliste", "Im Restaurant", "Trinkgeld"],
  },
  {
    n: 6,
    title: "Trends & mehr",
    titleFa: "ترندها و بیشتر",
    page: 63,
    endPage: 74,
    sections: [
      {
        key: "A",
        title: "Streetart",
        task: "Sich über Trends austauschen",
        skills: ["über Gefühle sprechen", "Wünsche für die eigene Stadt äußern"],
      },
      {
        key: "B",
        title: "Mit dem Rucksack",
        task: "Eine halbformelle E-Mail schreiben",
        skills: [
          "sich über Reisen austauschen",
          "etwas begründen",
          "Termine verschieben",
          "Vermutungen äußern",
        ],
      },
      {
        key: "C",
        title: "Open-Air-Kino",
        task: "Einen Text über seinen Lieblingsfilm schreiben und diesen präsentieren",
        skills: [
          "einen Fragebogen zum Thema Film ausfüllen",
          "zukünftige Zeitpunkte bestimmen",
          "sich über Lieblingsfilme austauschen",
          "besprechen, welche Filme man zusammen sehen möchte",
        ],
      },
      {
        key: "D",
        title: "Poetry Slam",
        task: "Weitere Strophen für einen Text schreiben und im Stil eines Poetry Slams vortragen",
        skills: [
          "über das Verhältnis von Personen auf einem Foto spekulieren",
          "eine Umfrage darüber machen, was den Mitschülern egal ist",
        ],
      },
    ],
    grammar: [
      "Reflexive Verben",
      "Verben mit präpositionaler Ergänzung im Akkusativ",
      "Artikelwort dies- im Dativ",
      "temporale Präpositionen: in, während",
      "Wortbildung: Verb → Nomen",
    ],
    vocab: ["Reisen", "Umwelt", "Termine", "Trends", "Kunst", "Gefühle", "Kino und Filme", "Poesie"],
  },
  {
    n: 7,
    title: "Schule und Beruf",
    titleFa: "مدرسه و شغل",
    page: 75,
    endPage: 86,
    sections: [
      {
        key: "A",
        title: "Plan B",
        task: "Über einen Lebenstraum schreiben",
        skills: ["sich darüber austauschen, was wichtig im Job ist"],
      },
      {
        key: "B",
        title: "Schule",
        task: "Sich darüber austauschen, was man als Kind werden wollte",
        skills: [
          "darüber sprechen, welche Fächer man in der Schule hatte",
          "sich darüber austauschen, in welchem Fach man gut / schlecht war",
          "über seinen Lieblingslehrer schreiben",
        ],
      },
      {
        key: "C",
        title: "Jobs",
        task: "Ein Bewerbungsschreiben verfassen",
        skills: [
          "Stellenanzeigen verstehen",
          "formelle und informelle Schreiben unterscheiden lernen",
          "Konsequenzen nennen",
        ],
      },
      {
        key: "D",
        title: "Traumjob",
        task: "Eine Nachricht über Wichtiges im Job schreiben",
        skills: [
          "Stellenanzeigen verstehen",
          "Bedingungen nennen",
          "sich darüber austauschen, was wichtig im Job ist",
        ],
      },
    ],
    grammar: [
      "Modalverben: Präteritum",
      "modale Präpositionen: ohne + Akkusativ, mit + Dativ",
      "Konnektor deshalb",
      "Konnektoren wenn, dass",
    ],
    vocab: ["Beruf und Berufsalltag", "Schulfächer", "Stellenanzeige", "Bewerbungsschreiben"],
  },
  {
    n: 8,
    title: "Glück und Gesundheit",
    titleFa: "شادی و سلامت",
    page: 87,
    endPage: 96,
    sections: [
      {
        key: "A",
        title: "Fragen Sie Ihren Arzt ...",
        task: "Rollenspiel: in der Apotheke",
        skills: [
          "sagen, wo man Schmerzen hat",
          "verstehen, wo jemand Schmerzen hat",
          "verstehen, wie man seine Medikamente einnehmen muss",
        ],
      },
      {
        key: "B",
        title: "Glücklich und zufrieden",
        task: "Sich über seine Wünsche austauschen",
        skills: ["sich darüber austauschen, was Glück ist und was glücklich macht"],
      },
      {
        key: "C",
        title: "Ein glücklicher Mensch",
        task: "Sich darüber austauschen, was bei Stress hilft",
        skills: [
          "nach der Bedeutung unbekannter Vokabeln fragen",
          "Vokabeln erklären",
          "Personen und Dinge beschreiben",
        ],
      },
    ],
    grammar: [
      "Konjunktiv II: sein",
      "temporale Präpositionen: bis und von ... bis",
      "Komparativ und Superlativ: Vergleiche mit genauso ... wie, als",
      "Adjektivdeklination nach indefinitem Artikel im Nominativ",
    ],
    vocab: ["Körper", "Arztbesuch", "Krankheiten", "Charaktereigenschaften", "Nationalitäten", "Arbeit"],
  },
  {
    n: 9,
    title: "Freie Zeit",
    titleFa: "اوقات فراغت",
    page: 97,
    endPage: 106,
    sections: [
      {
        key: "A",
        title: "Fernsehen heute",
        task: "Nachfragen, ob man das richtige Produkt für jemanden gekauft hat",
        skills: [
          "sich nach dem Fernsehprogramm erkundigen",
          "sich über sein Fernsehverhalten austauschen",
          "sich darüber austauschen, welche Technik man benutzt",
        ],
      },
      {
        key: "B",
        title: "Lieblings-App",
        task: "Rollenspiel: als Gastgeber Snacks und Getränke anbieten",
        skills: [
          "sich darüber austauschen, wozu man das Internet nutzt",
          "fragen, wer die gleiche Lieblings-App hat",
        ],
      },
      {
        key: "C",
        title: "Lieblingstag",
        task: "Über sein Lieblingsfest als Kind schreiben",
        skills: [
          "über wichtige Feste/Feiertage in seinem Land berichten",
          "sich darüber austauschen, wer wem was schenkt",
        ],
      },
    ],
    grammar: [
      "Konnektor dann",
      "Adjektivdeklination nach indefinitem Artikel im Akkusativ und Dativ",
      "Verben mit Dativ- und Akkusativergänzung",
    ],
    vocab: ["Fernsehen und Sendungen", "Internet", "Computer", "Apps", "Feste und Feiertage"],
  },
  {
    n: 10,
    title: "So macht es Spaß!",
    titleFa: "این‌طوری کیف می‌دهد!",
    page: 107,
    endPage: 118,
    sections: [
      {
        key: "A",
        title: "Sympathisch und höflich",
        task: "Rollenspiel: perfekter Umgang mit Kundenfragen",
        skills: ["Gegenstände beschreiben", "sich höflich ausdrücken"],
      },
      {
        key: "B",
        title: "Komplimente machen",
        task: "Ratespiel: Komplimente über eine Person im Kurs machen und verstehen und raten, wer das ist",
        skills: [
          "sich darüber austauschen, wer welche Komplimente gerne bekommt",
          "jemandem Komplimente machen",
        ],
      },
      {
        key: "C",
        title: "Partnersuche",
        task: "Rollenspiel: über sich erzählen",
        skills: [
          "sich darüber austauschen, was man alles selbst macht",
          "Interesse für eine Person signalisieren",
        ],
      },
      {
        key: "D",
        title: "Schenken",
        task: "Einen Text über ein Produkt für ein Kundenforum schreiben",
        skills: [
          "Geschenkideen beurteilen",
          "einen Rap zu Ende schreiben",
          "sich darüber austauschen, wie zufrieden man mit seinen Einkäufen ist",
        ],
      },
    ],
    grammar: [
      "Verb: lassen",
      "Verben mit Dativ- und Akkusativergänzung: Stellung der Objekte",
      "Genitiv",
      "Adjektivdeklination nach definitivem Artikel im Nominativ, Akkusativ und Dativ",
      "modale Präposition: aus",
      "Präposition: über + Akkusativ",
    ],
    vocab: ["Orientierung im Einkaufszentrum", "Material und Form", "Aufgaben im Haushalt", "Komplimente"],
  },
  {
    n: 11,
    title: "Welt im Wandel",
    titleFa: "جهان در حال تغییر",
    page: 119,
    endPage: 130,
    sections: [
      {
        key: "A",
        title: "Wichtiger als Geld?",
        task: "Sich über Tabu-Fragen im Heimatland austauschen",
        skills: [
          "sich darüber austauschen, was man mit Geld machen kann",
          "sich darüber austauschen, was wichtiger als Geld ist",
        ],
      },
      {
        key: "B",
        title: "Die etwas andere Bank",
        task: "Rollenspiel: bei der Bank",
        skills: [
          "sich über Sprüche zum Thema Geld austauschen",
          "sagen, wem etwas gehört",
          "höfliche indirekte Fragen stellen",
        ],
      },
      {
        key: "C",
        title: "Mein Konto, dein Konto ...",
        task: "Ein Gedicht schreiben",
        skills: [
          "sich darüber austauschen, wofür man Geld ausgegeben hat",
          "über Vor- und Nachteile des Online-Bankings sprechen",
        ],
      },
      {
        key: "D",
        title: "Sie haben Post",
        task: "Eine Umfrage zum Thema elektronische Post machen",
        skills: ["sich über Vor- und Nachteile elektronischer Post austauschen"],
      },
    ],
    grammar: [
      "Passiv Präsens",
      "Indirekte Frage mit Fragewort und ob",
      "Fragepronomen: Wem?",
      "Possessivartikel: Ihr",
    ],
    vocab: [
      "Geld",
      "Persönliche Werte",
      "Banken",
      "Online-Banking",
      "Post",
      "E-Mail, SMS, WhatsApp ...",
      "Briefe",
    ],
  },
  {
    n: 12,
    title: "Ab in den Urlaub",
    titleFa: "راهی تعطیلات",
    page: 131,
    endPage: 142,
    sections: [
      {
        key: "A",
        title: "Kurz mal weg!",
        task: "Gemeinsam einen Urlaub planen",
        skills: [
          "sich darüber austauschen, wo die Leute am liebsten Kurzurlaub machen",
          "Reiseziele nennen",
        ],
      },
      {
        key: "B",
        title: "Wo ist das Hotel Cocoon?",
        task: "Eine Wegbeschreibung für die Webseite seiner Sprachschule schreiben",
        skills: ["eine Wegbeschreibung verstehen", "sagen, woher man kommt"],
      },
      {
        key: "C",
        title: "Reisepartnerin gesucht",
        task: "Eine Reise planen",
        skills: [
          "sich darüber austauschen, welche Art von Urlaub man mag",
          "sich darüber austauschen, wer wie lange in Urlaub fährt",
          "sich über Interessen austauschen",
        ],
      },
      {
        key: "D",
        title: "Selfies",
        task: "Gruppenarbeit zu Selfies präsentieren",
        skills: ["sich darüber austauschen, worauf man sich freut"],
      },
    ],
    grammar: [
      "Verben mit präpositionaler Ergänzung im Akkusativ und Dativ",
      "Fragen und Präpositionaladverbien",
      "Wechselpräpositionen: an, in, auf",
      "lokale Präpositionen: aus, von, bis zu",
      "temporale Präposition: für",
    ],
    vocab: [
      "Reiseutensilien",
      "Reiseziele",
      "Mengenangaben",
      "Wegbeschreibung",
      "Probleme auf Reisen",
      "Gefühle",
      "Selfies",
      "Öffentliche Verkehrsmittel",
    ],
  },
];

export const BOOK_NAME = "Starten wir! A2";
export const TARGET_LEVEL = "A2";

// هر بخش دو صفحه است و بعد از بخش‌ها Grammatik Xpress و در صفحه‌ی آخر Xtra Lesen می‌آید
export const sectionPages = (lesson: Lesson, index: number): [number, number] => {
  const first = lesson.page + 1 + index * 2;
  return [first, first + 1];
};
export const grammarPages = (lesson: Lesson): [number, number] => [lesson.endPage - 2, lesson.endPage - 1];

export const XTRA_TITLES: Record<number, string> = {
  1: "Berlin, Alabama",
  2: "Touristen am Flughafen",
  3: "Brief in die Zukunft",
  4: "Geld im Haus",
  5: "Die Kochshow",
  6: "Veranstaltungen",
  7: "Mit der Kamera um die Welt",
  8: "Kulturschock",
  9: "Ein Laptop für jedes Kind",
  10: "Smalltalk",
  11: "Mehr als ein Postbote",
  12: "Ankunft am Flughafen",
};

// صفحه‌ی PDF سه شماره عقب‌تر از شماره‌ی چاپی کتاب است
export const pdfPage = (bookPage: number) => bookPage - 3;
// هر سه درس یک پوشه است و مرور هم پس از پایان هر پوشه می‌آید
export const lessonFolder = (n: number) => Math.ceil(n / 3);
export const folderName = (folder: number) =>
  `پوشه ${folder.toLocaleString("fa-IR")}: درس ${(folder * 3 - 2).toLocaleString("fa-IR")} تا ${(folder * 3).toLocaleString("fa-IR")}`;

export const getLesson = (n: number) => LESSONS[n - 1];
