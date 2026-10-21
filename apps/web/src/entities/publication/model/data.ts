import type { Publication, PublicationBlock, PublicationType } from './types';

export const PUBLICATION_TYPE_LABEL: Record<PublicationType, string> = {
  paper: 'Paper',
  news: 'News',
  event: 'Event',
  media: 'Media',
};

const LINKEDIN_POST = 'https://www.linkedin.com/feed/update/urn:li:activity:';

const GRAIL_ISSUE_BLOCKS: PublicationBlock[] = [
  {
    kind: 'paragraph',
    text: 'The article grew out of a VIRaTeC COIL module: students explored the topic in a global virtual classroom and turned their findings into a peer-reviewed paper.',
  },
  { kind: 'heading', text: 'From an idea to global publication' },
  {
    kind: 'paragraph',
    text: 'Six students of the KNU Faculty of Information Technology published two articles in Grail of Science, a Ukrainian Category B journal, issue 67, dated 1 May 2026.',
  },
  {
    kind: 'quote',
    text: '“From an idea → to collaboration → to research → to global publication.”',
    author: '— VIRaTeC',
  },
];

export const PUBLICATIONS: Publication[] = [
  {
    slug: 'big-data-and-ai-digital-economy',
    type: 'paper',
    year: 2026,
    title: 'Big Data and AI: the foundation of the digital economy',
    source: 'K. Kravets, A. Mekshun, A. Loban, L. Liashenko · Grail of Science, No. 67',
    excerpt:
      'Student research from a VIRaTeC COIL module, published in a Ukrainian Category B peer-reviewed journal.',
    linkLabel: 'Read paper →',
    isFeatured: true,
    detail: {
      heroTitle: 'Big Data and AI:',
      heroAccent: 'the foundation of the digital economy.',
      lead: 'Student research from a VIRaTeC COIL module, published in a Ukrainian Category B peer-reviewed journal.',
      formatLabel: 'Article',
      kindLabel: 'Journal article',
      publishedOn: '1 May 2026',
      readTime: 'pp. 303–311',
      blocks: GRAIL_ISSUE_BLOCKS,
      authors: 'Kateryna Kravets, Anastasiia Mekshun, Anastasiia Loban, Larysa Liashenko',
      sourceLabel: 'Grail of Science, No. 67 · DOI 10.36074/grail-of-science.01.05.2026.032',
      pdfUrl: 'https://archive.journal-grail.science/index.php/2710-3056/article/view/4534/4540',
      sourceUrl: 'https://doi.org/10.36074/grail-of-science.01.05.2026.032',
    },
  },
  {
    slug: 'ai-driven-talent-acquisition',
    type: 'paper',
    year: 2026,
    title: 'The economic efficiency of AI-driven talent acquisition',
    source: 'M. Artemenko, S. Vasylyeva, M. Tymoshenko, L. Liashenko · Grail of Science, No. 67',
    excerpt:
      'Student research from a VIRaTeC COIL module, published in a Ukrainian Category B peer-reviewed journal.',
    linkLabel: 'Read paper →',
    detail: {
      heroTitle: 'The economic efficiency',
      heroAccent: 'of AI-driven talent acquisition.',
      lead: 'Student research from a VIRaTeC COIL module, published in a Ukrainian Category B peer-reviewed journal.',
      formatLabel: 'Article',
      kindLabel: 'Journal article',
      publishedOn: '1 May 2026',
      readTime: 'pp. 312–321',
      blocks: GRAIL_ISSUE_BLOCKS,
      authors: 'Mariia Artemenko, Sofiia Vasylyeva, Mykhailo Tymoshenko, Larysa Liashenko',
      sourceLabel: 'Grail of Science, No. 67 · DOI 10.36074/grail-of-science.01.05.2026.033',
      pdfUrl: 'https://archive.journal-grail.science/index.php/2710-3056/article/view/4535/4541',
      sourceUrl: 'https://doi.org/10.36074/grail-of-science.01.05.2026.033',
    },
  },
  {
    slug: 'integrating-rbl-into-coil-acit-2026',
    type: 'paper',
    year: 2026,
    title:
      'Integrating Research-Based Learning into COIL to foster students’ academic and intercultural growth',
    source:
      'I. Shcherbiak, D. Kostenko, Z. Krupnyk, L. Liashenko, K. Binytska, A. Kolesnikov · ACIT 2026',
    excerpt:
      '2026 16th International Conference on Advanced Computer Information Technologies (ACIT), pp. 1711–1716.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.1109/ACIT69831.2026.11700156',
  },
  {
    slug: 'kostiantyn-tyshchenko-legacy-conference',
    type: 'event',
    year: 2026,
    title: 'The Interdisciplinary Legacy of Professor Kostiantyn Tyshchenko: Digital Challenges',
    source: 'II International Scientific Conference · KNU, 14–15 October 2026',
    excerpt:
      'Dr. Larysa Liashenko gave a plenary talk on the global student collaboration network; Olha Yezerska and Larysa Liashenko presented a joint paper.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://philology.knu.ua/conference-dedicated-to-the-legacy-of-professor-kostiantyn-tyshchenko/',
  },
  {
    slug: 'pstu-global-collaboration-framework-workshop',
    type: 'news',
    year: 2026,
    title:
      'Pryazovskyi State Technical University joins the Global Collaboration Framework workshop',
    source: 'Pryazovskyi State Technical University · 21 September 2026',
    excerpt:
      'A partner report on the VIRaTeC Global Network at KNU workshop with Dr. Kelly Tzoumis (Johns Hopkins University) on 15 September 2026.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://pstu.edu/uk/novyny/pdtu-doluchyvsya-do-mizhnarodnogo-vorkshopu-global-collaboration-framework-novi-mozhlyvosti-dlya-osvity-nauky-ta-mizhnarodnoyi-spivpraczi/',
  },
  {
    slug: 'from-student-ideas-to-global-research',
    type: 'event',
    year: 2026,
    title: 'From Student Ideas to Global Research (JHU × KNU)',
    source: 'Online · 15 September 2026',
    excerpt:
      'A guest lecture by Dr. Kelly Tzoumis (Johns Hopkins University) on turning ideas into a research article, book chapter or monograph, moderated by Dr. Larysa Liashenko and Olha Yezerska.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7503727552549511168/`,
  },
  {
    slug: 'global-collaboration-framework-workshop',
    type: 'event',
    year: 2026,
    title: 'Author-led workshop by Dr. Kelly Tzoumis (JHU): Global Collaboration Framework',
    source: 'VIRaTeC Global Network at KNU',
    excerpt:
      'A workshop on the Johns Hopkins University Global Collaboration Framework for 54 students and faculty, and the first steps towards a collaborative book with student voices.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7506460993095434240/`,
  },
  {
    slug: 'learning-through-experience',
    type: 'news',
    year: 2026,
    title: 'Learning Through Experience: offshore wind farm negotiation with JHU',
    source: 'Global Collaboration Framework · Johns Hopkins University',
    excerpt:
      'Students from Algeria, Cameroon, Jordan, Morocco, Ukraine and the USA negotiated the site of an offshore wind farm in a role-play initiated by Dr. Kelly Tzoumis.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7507442054768250880/`,
  },
  {
    slug: 'digital-narratives-2026',
    type: 'event',
    year: 2026,
    title: 'Digital Narratives: AI and IT in Multidisciplinary Research 2026',
    source: 'Conference · KNU, 8 June 2026',
    excerpt:
      'Nearly 100 participants saw the results of certified COIL modules 2025–2026: Foundations of NLP (206 students), Cyber Hygiene (87) and Data-Driven Decision Making (67).',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://philology.knu.ua/digital-narratives-ai-and-it-in-multidisciplinary-research-2026/',
  },
  {
    slug: 'new-model-of-international-education',
    type: 'news',
    year: 2026,
    title: 'The University is shaping a new model of international education',
    source: 'Taras Shevchenko National University of Kyiv · 18 June 2026',
    excerpt:
      'KNU reports on Digital Narratives 2026 and on COIL modules authored by students, including the NLP module by Eduard Parkhomenko.',
    linkLabel: 'Read more →',
    sourceUrl: 'https://knu.ua/news/14058',
  },
  {
    slug: 'data-driven-decision-making',
    type: 'news',
    year: 2026,
    title: 'Data-Driven Decision Making Across Borders',
    source: 'Coventry University · University of Florida · KNU Faculty of Economics',
    excerpt:
      'An 8-week COIL module on modern data analytics tools and data-driven thinking, initiated by Dr. Azadeh Jafar Nezhad (Coventry University).',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7460424753208754176/`,
  },
  {
    slug: 'global-minds-in-action',
    type: 'news',
    year: 2026,
    title: 'Global Minds in Action: Foundations of NLP COIL module',
    source: 'Institute of Philology, KNU · 20 April 2026',
    excerpt:
      'An 8-week Research-Based Learning module by Eduard Parkhomenko: about 200 students, 31 international teams and five workshops with seven universities.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://philology.knu.ua/institute-of-philology-in-the-international-educational-space-language-as-a-driver-of-global-it-education/',
  },
  {
    slug: 'navigating-cultural-hierarchies-in-asia',
    type: 'event',
    year: 2026,
    title: 'Pre-COIL workshop: Navigating Cultural Hierarchies in Asia',
    source: 'Online master-class · 3 February 2026',
    excerpt:
      'How cultural hierarchy in Asia shapes decision-making in project management, for 46 KNU FIT students.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7427464281388085248/`,
  },
  {
    slug: 'santo-tomas-coil-experience',
    type: 'news',
    year: 2025,
    title:
      'Santo Tomás Valdivia computer engineering students stand out in an international COIL experience',
    source: 'Instituto Profesional Santo Tomás · 20 August 2025',
    excerpt:
      'A partner report on the digital security COIL with KNU and the certificates awarded to Santo Tomás students.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://enlinea.santotomas.cl/mundo-santo-tomas-2/estudiantes-de-ingenieria-en-informatica-de-santo-tomas-valdivia-destacan-en-experiencia-internacional-coil/321756/',
  },
  {
    slug: 'implementing-rbl-within-coil-modules',
    type: 'event',
    year: 2025,
    title: 'Implementing Research-Based Learning within certified COIL modules',
    source: 'IT&I-2025 International Scientific and Practical Conference',
    excerpt:
      'Outcomes of a COIL research project led by master’s teams with 127 students from six universities in Chile, Colombia, the UAE, the UK, India and Ukraine.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7398792569578496000/`,
  },
  {
    slug: 'building-digital-resilience-hkbu',
    type: 'event',
    year: 2025,
    title: 'Building Digital Resilience through Intercultural Exchange',
    source: 'Summit panel · School of Continuing Education, Hong Kong Baptist University',
    excerpt:
      'COIL for Cyber Risks & Business Intelligence: how master’s students lead international projects.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7361076388205842432/`,
  },
  {
    slug: 'coil-cyberbridge-talks-2025',
    type: 'event',
    year: 2025,
    title: '2025 VIRaTeC COIL Series: COIL + CyberBridge Talks',
    source: 'International conference · KNU',
    excerpt:
      'Three concurrent COIL modules with Coventry University, Universidad Católica de Colombia, Santo Tomás, the American University in the Emirates and Karunya Institute.',
    linkLabel: 'Read more →',
    sourceUrl: `${LINKEDIN_POST}7338597253764304898/`,
  },
  {
    slug: 'first-intercontinental-coil-project',
    type: 'news',
    year: 2025,
    title: 'The first intercontinental virtual research (COIL) project of students',
    source: 'Institute of Philology, KNU · 10 June 2025',
    excerpt:
      'KNU reports on the 2025 VIRaTeC COIL Series and the student project led by Anastasiia Loban and Anton Dmytrenko.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://philology.knu.ua/en/professional-development-initiative-2025-viratec-coil-series-coil-cyberbridge-talks-2/',
  },
  {
    slug: 'coil-certificates-2025',
    type: 'news',
    year: 2025,
    title: 'Recognising innovative learning: certificates for COIL participants',
    source: 'Taras Shevchenko National University of Kyiv · 6 June 2025',
    excerpt: 'Certificates are awarded to the participants of three COIL modules.',
    linkLabel: 'Read more →',
    sourceUrl: 'https://knu.ua/news/13647',
  },
  {
    slug: 'coventry-bridging-divides-coil',
    type: 'event',
    year: 2025,
    title: 'Bridging Divides: Internationalisation at Home through COIL',
    source: 'Coventry University · KNU, 28 April 2025',
    excerpt:
      'An invited talk at KNU by Marina Orsini-Jones (Coventry University) on Coventry’s approach to COIL and intercultural skills.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://pureportal.coventry.ac.uk/en/activities/bridging-divides-internationalisation-at-home-through-coil/',
  },
  {
    slug: 'cybersecurity-in-action-pcsics-2025',
    type: 'paper',
    year: 2025,
    title: 'Cybersecurity in Action: an international COIL project with interactive workshops',
    source: 'L. Liashenko, T. Andriichuk · VIII International PCSICS Conference, 11 April 2025',
    excerpt:
      'A Cybersecurity Essentials COIL pilot with partners in Ukraine, Colombia and Chile, presented with a student poster session.',
    linkLabel: 'Read more →',
    sourceUrl:
      'https://pcsits.knu.ua/wp-content/uploads/2025/04/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%B0-2025.pdf',
  },
  {
    slug: 'designing-coil-programs-2024',
    type: 'paper',
    year: 2024,
    title:
      'Designing COIL programs for intercultural student collaboration and practical engagement with global business in scientific fields',
    source:
      'IV International Scientific Conference “Scientific Orientations: Theory and Practice of Research”',
    excerpt: 'Conference paper listed in Dr. Larysa Liashenko’s ORCID record.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.62731/mcnd-18.10.2024',
  },
  {
    slug: 'professional-english-digital-portfolios-2024',
    type: 'paper',
    year: 2024,
    title:
      'Reevaluating assessment practices in higher education: professional English digital portfolios for first-year data analysis students',
    source: 'Studia Linguistica',
    excerpt: 'Journal article listed in Dr. Larysa Liashenko’s ORCID record.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.17721/studling2024.25.89-98',
  },
  {
    slug: 'abstract-writing-non-english-scholars-2024',
    type: 'paper',
    year: 2024,
    title:
      'Enhancing abstract impact: successful abstract writing for scholars with non-English language backgrounds',
    source: 'The Latest Development Trends in Philological Science and Education',
    excerpt: 'Conference paper listed in Dr. Larysa Liashenko’s ORCID record.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.30525/978-9934-26-404-7-48',
  },
  {
    slug: 'english-digital-messaging-2024',
    type: 'paper',
    year: 2024,
    title:
      'Exploring linguistic features of English language digital messaging: a study of Twitter and Instagram communication',
    source: 'Grail of Science',
    excerpt: 'Journal article listed in Dr. Larysa Liashenko’s ORCID record.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.36074/grail-of-science.10.05.2024.057',
  },
  {
    slug: 'predicting-stock-market-trends-python-2024',
    type: 'paper',
    year: 2024,
    title: 'Predicting stock market trends with Python',
    source: 'Grail of Science',
    excerpt: 'Journal article listed in Dr. Larysa Liashenko’s ORCID record.',
    linkLabel: 'Read paper →',
    sourceUrl: 'https://doi.org/10.36074/grail-of-science.07.06.2024.012',
  },
];

export const findPublication = (slug: string | undefined) =>
  PUBLICATIONS.find((publication) => publication.slug === slug);
