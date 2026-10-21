import { defineMessages, mapLocalized, useLocalized, type Localized } from '@/shared/i18n';
import type { Publication, PublicationBlock, PublicationDetail, PublicationType } from './types';

interface PublicationLabels {
  type: Record<PublicationType, string>;
  readPaper: string;
  readMore: string;
}

const PUBLICATION_LABELS = defineMessages<PublicationLabels>({
  en: {
    type: { paper: 'Paper', news: 'News', event: 'Event', media: 'Media' },
    readPaper: 'Read paper →',
    readMore: 'Read more →',
  },
  uk: {
    type: { paper: 'Стаття', news: 'Новина', event: 'Подія', media: 'Медіа' },
    readPaper: 'Читати статтю →',
    readMore: 'Читати далі →',
  },
});

export const usePublicationLabels = () => useLocalized(PUBLICATION_LABELS);

type PublicationDetailText = Omit<PublicationDetail, 'pdfUrl' | 'sourceUrl'>;

interface PublicationText {
  title: string;
  source: string;
  excerpt: string;
  detail?: PublicationDetailText;
}

interface PublicationEntry {
  slug: string;
  type: PublicationType;
  year: number;
  linkKind?: 'paper' | 'more';
  isFeatured?: boolean;
  sourceUrl?: string;
  detailLinks?: Pick<PublicationDetail, 'pdfUrl' | 'sourceUrl'>;
  text: Localized<PublicationText>;
}

const LINKEDIN_POST = 'https://www.linkedin.com/feed/update/urn:li:activity:';

const GRAIL_ISSUE_BLOCKS = defineMessages<PublicationBlock[]>({
  en: [
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
  ],
  uk: [
    {
      kind: 'paragraph',
      text: 'Стаття виросла з COIL-модуля VIRaTeC: студенти досліджували тему в глобальній віртуальній аудиторії та перетворили свої висновки на рецензовану публікацію.',
    },
    { kind: 'heading', text: 'Від ідеї до глобальної публікації' },
    {
      kind: 'paragraph',
      text: 'Шестеро студентів факультету інформаційних технологій КНУ опублікували дві статті в Grail of Science — українському журналі категорії Б, випуск 67 від 1 травня 2026 року.',
    },
    {
      kind: 'quote',
      text: '«Від ідеї → до співпраці → до дослідження → до глобальної публікації».',
      author: '— VIRaTeC',
    },
  ],
});

const GRAIL_LEAD = defineMessages({
  en: 'Student research from a VIRaTeC COIL module, published in a Ukrainian Category B peer-reviewed journal.',
  uk: 'Студентське дослідження з COIL-модуля VIRaTeC, опубліковане в українському рецензованому журналі категорії Б.',
});

const GRAIL_DETAIL_LABELS = defineMessages({
  en: { formatLabel: 'Article', kindLabel: 'Journal article', publishedOn: '1 May 2026' },
  uk: { formatLabel: 'Стаття', kindLabel: 'Стаття в журналі', publishedOn: '1 травня 2026' },
});

const ORCID_JOURNAL = defineMessages({
  en: 'Journal article listed in Dr. Larysa Liashenko’s ORCID record.',
  uk: 'Журнальна стаття з профілю ORCID д-ра Лариси Ляшенко.',
});

const ORCID_CONFERENCE = defineMessages({
  en: 'Conference paper listed in Dr. Larysa Liashenko’s ORCID record.',
  uk: 'Доповідь на конференції з профілю ORCID д-ра Лариси Ляшенко.',
});

const ENTRIES: PublicationEntry[] = [
  {
    slug: 'big-data-and-ai-digital-economy',
    type: 'paper',
    year: 2026,
    isFeatured: true,
    detailLinks: {
      pdfUrl: 'https://archive.journal-grail.science/index.php/2710-3056/article/view/4534/4540',
      sourceUrl: 'https://doi.org/10.36074/grail-of-science.01.05.2026.032',
    },
    text: {
      en: {
        title: 'Big Data and AI: the foundation of the digital economy',
        source: 'K. Kravets, A. Mekshun, A. Loban, L. Liashenko · Grail of Science, No. 67',
        excerpt: GRAIL_LEAD.en,
        detail: {
          ...GRAIL_DETAIL_LABELS.en,
          heroTitle: 'Big Data and AI:',
          heroAccent: 'the foundation of the digital economy.',
          lead: GRAIL_LEAD.en,
          readTime: 'pp. 303–311',
          blocks: GRAIL_ISSUE_BLOCKS.en,
          authors: 'Kateryna Kravets, Anastasiia Mekshun, Anastasiia Loban, Larysa Liashenko',
          sourceLabel: 'Grail of Science, No. 67 · DOI 10.36074/grail-of-science.01.05.2026.032',
        },
      },
      uk: {
        title: 'Big Data and AI: the foundation of the digital economy',
        source: 'К. Кравець, А. Мекшун, А. Лобан, Л. Ляшенко · Grail of Science, № 67',
        excerpt: GRAIL_LEAD.uk,
        detail: {
          ...GRAIL_DETAIL_LABELS.uk,
          heroTitle: 'Big Data and AI:',
          heroAccent: 'the foundation of the digital economy.',
          lead: GRAIL_LEAD.uk,
          readTime: 'с. 303–311',
          blocks: GRAIL_ISSUE_BLOCKS.uk,
          authors: 'Катерина Кравець, Анастасія Мекшун, Анастасія Лобан, Лариса Ляшенко',
          sourceLabel: 'Grail of Science, № 67 · DOI 10.36074/grail-of-science.01.05.2026.032',
        },
      },
    },
  },
  {
    slug: 'ai-driven-talent-acquisition',
    type: 'paper',
    year: 2026,
    detailLinks: {
      pdfUrl: 'https://archive.journal-grail.science/index.php/2710-3056/article/view/4535/4541',
      sourceUrl: 'https://doi.org/10.36074/grail-of-science.01.05.2026.033',
    },
    text: {
      en: {
        title: 'The economic efficiency of AI-driven talent acquisition',
        source:
          'M. Artemenko, S. Vasylyeva, M. Tymoshenko, L. Liashenko · Grail of Science, No. 67',
        excerpt: GRAIL_LEAD.en,
        detail: {
          ...GRAIL_DETAIL_LABELS.en,
          heroTitle: 'The economic efficiency',
          heroAccent: 'of AI-driven talent acquisition.',
          lead: GRAIL_LEAD.en,
          readTime: 'pp. 312–321',
          blocks: GRAIL_ISSUE_BLOCKS.en,
          authors: 'Mariia Artemenko, Sofiia Vasylyeva, Mykhailo Tymoshenko, Larysa Liashenko',
          sourceLabel: 'Grail of Science, No. 67 · DOI 10.36074/grail-of-science.01.05.2026.033',
        },
      },
      uk: {
        title: 'The economic efficiency of AI-driven talent acquisition',
        source: 'М. Артеменко, С. Васильєва, М. Тимошенко, Л. Ляшенко · Grail of Science, № 67',
        excerpt: GRAIL_LEAD.uk,
        detail: {
          ...GRAIL_DETAIL_LABELS.uk,
          heroTitle: 'The economic efficiency',
          heroAccent: 'of AI-driven talent acquisition.',
          lead: GRAIL_LEAD.uk,
          readTime: 'с. 312–321',
          blocks: GRAIL_ISSUE_BLOCKS.uk,
          authors: 'Марія Артеменко, Софія Васильєва, Михайло Тимошенко, Лариса Ляшенко',
          sourceLabel: 'Grail of Science, № 67 · DOI 10.36074/grail-of-science.01.05.2026.033',
        },
      },
    },
  },
  {
    slug: 'integrating-rbl-into-coil-acit-2026',
    type: 'paper',
    year: 2026,
    sourceUrl: 'https://doi.org/10.1109/ACIT69831.2026.11700156',
    text: {
      en: {
        title:
          'Integrating Research-Based Learning into COIL to foster students’ academic and intercultural growth',
        source:
          'I. Shcherbiak, D. Kostenko, Z. Krupnyk, L. Liashenko, K. Binytska, A. Kolesnikov · ACIT 2026',
        excerpt:
          '2026 16th International Conference on Advanced Computer Information Technologies (ACIT), pp. 1711–1716.',
      },
      uk: {
        title:
          'Integrating Research-Based Learning into COIL to foster students’ academic and intercultural growth',
        source:
          'І. Щербяк, Д. Костенко, З. Крупник, Л. Ляшенко, К. Біницька, А. Колесніков · ACIT 2026',
        excerpt:
          '16-та Міжнародна конференція з передових комп’ютерних інформаційних технологій (ACIT 2026), с. 1711–1716.',
      },
    },
  },
  {
    slug: 'kostiantyn-tyshchenko-legacy-conference',
    type: 'event',
    year: 2026,
    sourceUrl:
      'https://philology.knu.ua/conference-dedicated-to-the-legacy-of-professor-kostiantyn-tyshchenko/',
    text: {
      en: {
        title:
          'The Interdisciplinary Legacy of Professor Kostiantyn Tyshchenko: Digital Challenges',
        source: 'II International Scientific Conference · KNU, 14–15 October 2026',
        excerpt:
          'Dr. Larysa Liashenko gave a plenary talk on the global student collaboration network; Olha Yezerska and Larysa Liashenko presented a joint paper.',
      },
      uk: {
        title: 'Міждисциплінарна спадщина професора Костянтина Тищенка: цифрові виклики',
        source: 'ІІ Міжнародна наукова конференція · КНУ, 14–15 жовтня 2026',
        excerpt:
          'Д-р Лариса Ляшенко виступила з пленарною доповіддю про глобальну мережу студентської співпраці; Ольга Єзерська та Лариса Ляшенко представили спільну доповідь.',
      },
    },
  },
  {
    slug: 'pstu-global-collaboration-framework-workshop',
    type: 'news',
    year: 2026,
    sourceUrl:
      'https://pstu.edu/uk/novyny/pdtu-doluchyvsya-do-mizhnarodnogo-vorkshopu-global-collaboration-framework-novi-mozhlyvosti-dlya-osvity-nauky-ta-mizhnarodnoyi-spivpraczi/',
    text: {
      en: {
        title:
          'Pryazovskyi State Technical University joins the Global Collaboration Framework workshop',
        source: 'Pryazovskyi State Technical University · 21 September 2026',
        excerpt:
          'A partner report on the VIRaTeC Global Network at KNU workshop with Dr. Kelly Tzoumis (Johns Hopkins University) on 15 September 2026.',
      },
      uk: {
        title: 'ПДТУ долучився до міжнародного воркшопу Global Collaboration Framework',
        source: 'Приазовський державний технічний університет · 21 вересня 2026',
        excerpt:
          'Звіт партнера про воркшоп глобальної мережі VIRaTeC при КНУ з д-ром Келлі Цуміс (Університет Джонса Гопкінса) 15 вересня 2026 року.',
      },
    },
  },
  {
    slug: 'from-student-ideas-to-global-research',
    type: 'event',
    year: 2026,
    sourceUrl: `${LINKEDIN_POST}7503727552549511168/`,
    text: {
      en: {
        title: 'From Student Ideas to Global Research (JHU × KNU)',
        source: 'Online · 15 September 2026',
        excerpt:
          'A guest lecture by Dr. Kelly Tzoumis (Johns Hopkins University) on turning ideas into a research article, book chapter or monograph, moderated by Dr. Larysa Liashenko and Olha Yezerska.',
      },
      uk: {
        title: 'Від студентських ідей до глобальних досліджень (JHU × КНУ)',
        source: 'Онлайн · 15 вересня 2026',
        excerpt:
          'Гостьова лекція д-ра Келлі Цуміс (Університет Джонса Гопкінса) про те, як перетворити ідею на наукову статтю, розділ книги чи монографію. Модератори — д-р Лариса Ляшенко та Ольга Єзерська.',
      },
    },
  },
  {
    slug: 'global-collaboration-framework-workshop',
    type: 'event',
    year: 2026,
    sourceUrl: `${LINKEDIN_POST}7506460993095434240/`,
    text: {
      en: {
        title: 'Author-led workshop by Dr. Kelly Tzoumis (JHU): Global Collaboration Framework',
        source: 'VIRaTeC Global Network at KNU',
        excerpt:
          'A workshop on the Johns Hopkins University Global Collaboration Framework for 54 students and faculty, and the first steps towards a collaborative book with student voices.',
      },
      uk: {
        title: 'Авторський воркшоп д-ра Келлі Цуміс (JHU): Global Collaboration Framework',
        source: 'Глобальна мережа VIRaTeC при КНУ',
        excerpt:
          'Воркшоп про Global Collaboration Framework Університету Джонса Гопкінса для 54 студентів і викладачів та перші кроки до спільної книги з голосами студентів.',
      },
    },
  },
  {
    slug: 'learning-through-experience',
    type: 'news',
    year: 2026,
    sourceUrl: `${LINKEDIN_POST}7507442054768250880/`,
    text: {
      en: {
        title: 'Learning Through Experience: offshore wind farm negotiation with JHU',
        source: 'Global Collaboration Framework · Johns Hopkins University',
        excerpt:
          'Students from Algeria, Cameroon, Jordan, Morocco, Ukraine and the USA negotiated the site of an offshore wind farm in a role-play initiated by Dr. Kelly Tzoumis.',
      },
      uk: {
        title: 'Навчання через досвід: переговори щодо офшорної вітрової електростанції з JHU',
        source: 'Global Collaboration Framework · Університет Джонса Гопкінса',
        excerpt:
          'Студенти з Алжиру, Камеруну, Йорданії, Марокко, України та США в рольовій грі, ініційованій д-ром Келлі Цуміс, домовлялися про розташування офшорної вітрової електростанції.',
      },
    },
  },
  {
    slug: 'digital-narratives-2026',
    type: 'event',
    year: 2026,
    sourceUrl:
      'https://philology.knu.ua/digital-narratives-ai-and-it-in-multidisciplinary-research-2026/',
    text: {
      en: {
        title: 'Digital Narratives: AI and IT in Multidisciplinary Research 2026',
        source: 'Conference · KNU, 8 June 2026',
        excerpt:
          'Nearly 100 participants saw the results of certified COIL modules 2025–2026: Foundations of NLP (206 students), Cyber Hygiene (87) and Data-Driven Decision Making (67).',
      },
      uk: {
        title: 'Digital Narratives: ШІ та ІТ у мультидисциплінарних дослідженнях 2026',
        source: 'Конференція · КНУ, 8 червня 2026',
        excerpt:
          'Майже 100 учасників ознайомилися з результатами сертифікованих COIL-модулів 2025–2026 років: Foundations of NLP (206 студентів), Cyber Hygiene (87) і Data-Driven Decision Making (67).',
      },
    },
  },
  {
    slug: 'new-model-of-international-education',
    type: 'news',
    year: 2026,
    sourceUrl: 'https://knu.ua/news/14058',
    text: {
      en: {
        title: 'The University is shaping a new model of international education',
        source: 'Taras Shevchenko National University of Kyiv · 18 June 2026',
        excerpt:
          'KNU reports on Digital Narratives 2026 and on COIL modules authored by students, including the NLP module by Eduard Parkhomenko.',
      },
      uk: {
        title: 'Університет формує нову модель міжнародної освіти',
        source: 'Київський національний університет імені Тараса Шевченка · 18 червня 2026',
        excerpt:
          'КНУ розповідає про Digital Narratives 2026 та авторські студентські COIL-модулі, зокрема модуль з NLP Едуарда Пархоменка.',
      },
    },
  },
  {
    slug: 'data-driven-decision-making',
    type: 'news',
    year: 2026,
    sourceUrl: `${LINKEDIN_POST}7460424753208754176/`,
    text: {
      en: {
        title: 'Data-Driven Decision Making Across Borders',
        source: 'Coventry University · University of Florida · KNU Faculty of Economics',
        excerpt:
          'An 8-week COIL module on modern data analytics tools and data-driven thinking, initiated by Dr. Azadeh Jafar Nezhad (Coventry University).',
      },
      uk: {
        title: 'Ухвалення рішень на основі даних без кордонів',
        source: 'Університет Ковентрі · Університет Флориди · Економічний факультет КНУ',
        excerpt:
          '8-тижневий COIL-модуль про сучасні інструменти аналізу даних і мислення на основі даних, ініційований д-ром Азаде Джафар Нежад (Університет Ковентрі).',
      },
    },
  },
  {
    slug: 'global-minds-in-action',
    type: 'news',
    year: 2026,
    sourceUrl:
      'https://philology.knu.ua/institute-of-philology-in-the-international-educational-space-language-as-a-driver-of-global-it-education/',
    text: {
      en: {
        title: 'Global Minds in Action: Foundations of NLP COIL module',
        source: 'Institute of Philology, KNU · 20 April 2026',
        excerpt:
          'An 8-week Research-Based Learning module by Eduard Parkhomenko: about 200 students, 31 international teams and five workshops with seven universities.',
      },
      uk: {
        title: 'Global Minds in Action: COIL-модуль Foundations of NLP',
        source: 'Інститут філології КНУ · 20 квітня 2026',
        excerpt:
          '8-тижневий модуль Research-Based Learning Едуарда Пархоменка: близько 200 студентів, 31 міжнародна команда та п’ять воркшопів за участі семи університетів.',
      },
    },
  },
  {
    slug: 'navigating-cultural-hierarchies-in-asia',
    type: 'event',
    year: 2026,
    sourceUrl: `${LINKEDIN_POST}7427464281388085248/`,
    text: {
      en: {
        title: 'Pre-COIL workshop: Navigating Cultural Hierarchies in Asia',
        source: 'Online master-class · 3 February 2026',
        excerpt:
          'How cultural hierarchy in Asia shapes decision-making in project management, for 46 KNU FIT students.',
      },
      uk: {
        title: 'Pre-COIL воркшоп: культурні ієрархії в Азії',
        source: 'Онлайн-майстер-клас · 3 лютого 2026',
        excerpt:
          'Як культурна ієрархія в Азії впливає на ухвалення рішень в управлінні проєктами — для 46 студентів ФІТ КНУ.',
      },
    },
  },
  {
    slug: 'santo-tomas-coil-experience',
    type: 'news',
    year: 2025,
    sourceUrl:
      'https://enlinea.santotomas.cl/mundo-santo-tomas-2/estudiantes-de-ingenieria-en-informatica-de-santo-tomas-valdivia-destacan-en-experiencia-internacional-coil/321756/',
    text: {
      en: {
        title:
          'Santo Tomás Valdivia computer engineering students stand out in an international COIL experience',
        source: 'Instituto Profesional Santo Tomás · 20 August 2025',
        excerpt:
          'A partner report on the digital security COIL with KNU and the certificates awarded to Santo Tomás students.',
      },
      uk: {
        title:
          'Студенти комп’ютерної інженерії Santo Tomás Valdivia відзначилися в міжнародному COIL-проєкті',
        source: 'Instituto Profesional Santo Tomás · 20 серпня 2025',
        excerpt:
          'Звіт партнера про COIL із цифрової безпеки спільно з КНУ та сертифікати, вручені студентам Santo Tomás.',
      },
    },
  },
  {
    slug: 'implementing-rbl-within-coil-modules',
    type: 'event',
    year: 2025,
    sourceUrl: `${LINKEDIN_POST}7398792569578496000/`,
    text: {
      en: {
        title: 'Implementing Research-Based Learning within certified COIL modules',
        source: 'IT&I-2025 International Scientific and Practical Conference',
        excerpt:
          'Outcomes of a COIL research project led by master’s teams with 127 students from six universities in Chile, Colombia, the UAE, the UK, India and Ukraine.',
      },
      uk: {
        title: 'Впровадження Research-Based Learning у сертифікованих COIL-модулях',
        source: 'Міжнародна науково-практична конференція IT&I-2025',
        excerpt:
          'Результати дослідницького COIL-проєкту під керівництвом команд магістрантів за участі 127 студентів із шести університетів Чилі, Колумбії, ОАЕ, Великої Британії, Індії та України.',
      },
    },
  },
  {
    slug: 'building-digital-resilience-hkbu',
    type: 'event',
    year: 2025,
    sourceUrl: `${LINKEDIN_POST}7361076388205842432/`,
    text: {
      en: {
        title: 'Building Digital Resilience through Intercultural Exchange',
        source: 'Summit panel · School of Continuing Education, Hong Kong Baptist University',
        excerpt:
          'COIL for Cyber Risks & Business Intelligence: how master’s students lead international projects.',
      },
      uk: {
        title: 'Розбудова цифрової стійкості через міжкультурний обмін',
        source:
          'Панель саміту · School of Continuing Education, Гонконзький баптистський університет',
        excerpt:
          'COIL з кіберризиків і бізнес-аналітики: як магістранти очолюють міжнародні проєкти.',
      },
    },
  },
  {
    slug: 'coil-cyberbridge-talks-2025',
    type: 'event',
    year: 2025,
    sourceUrl: `${LINKEDIN_POST}7338597253764304898/`,
    text: {
      en: {
        title: '2025 VIRaTeC COIL Series: COIL + CyberBridge Talks',
        source: 'International conference · KNU',
        excerpt:
          'Three concurrent COIL modules with Coventry University, Universidad Católica de Colombia, Santo Tomás, the American University in the Emirates and Karunya Institute.',
      },
      uk: {
        title: 'Серія VIRaTeC COIL 2025: COIL + CyberBridge Talks',
        source: 'Міжнародна конференція · КНУ',
        excerpt:
          'Три паралельні COIL-модулі з Університетом Ковентрі, Universidad Católica de Colombia, Santo Tomás, Американським університетом в Еміратах і Karunya Institute.',
      },
    },
  },
  {
    slug: 'first-intercontinental-coil-project',
    type: 'news',
    year: 2025,
    sourceUrl:
      'https://philology.knu.ua/en/professional-development-initiative-2025-viratec-coil-series-coil-cyberbridge-talks-2/',
    text: {
      en: {
        title: 'The first intercontinental virtual research (COIL) project of students',
        source: 'Institute of Philology, KNU · 10 June 2025',
        excerpt:
          'KNU reports on the 2025 VIRaTeC COIL Series and the student project led by Anastasiia Loban and Anton Dmytrenko.',
      },
      uk: {
        title: 'Перший міжконтинентальний віртуальний дослідницький (COIL) проєкт студентів',
        source: 'Інститут філології КНУ · 10 червня 2025',
        excerpt:
          'КНУ розповідає про серію VIRaTeC COIL 2025 та студентський проєкт під керівництвом Анастасії Лобан і Антона Дмитренка.',
      },
    },
  },
  {
    slug: 'coil-certificates-2025',
    type: 'news',
    year: 2025,
    sourceUrl: 'https://knu.ua/news/13647',
    text: {
      en: {
        title: 'Recognising innovative learning: certificates for COIL participants',
        source: 'Taras Shevchenko National University of Kyiv · 6 June 2025',
        excerpt: 'Certificates are awarded to the participants of three COIL modules.',
      },
      uk: {
        title: 'Визнання інноваційного навчання: сертифікати для учасників COIL',
        source: 'Київський національний університет імені Тараса Шевченка · 6 червня 2025',
        excerpt: 'Учасникам трьох COIL-модулів вручено сертифікати.',
      },
    },
  },
  {
    slug: 'coventry-bridging-divides-coil',
    type: 'event',
    year: 2025,
    sourceUrl:
      'https://pureportal.coventry.ac.uk/en/activities/bridging-divides-internationalisation-at-home-through-coil/',
    text: {
      en: {
        title: 'Bridging Divides: Internationalisation at Home through COIL',
        source: 'Coventry University · KNU, 28 April 2025',
        excerpt:
          'An invited talk at KNU by Marina Orsini-Jones (Coventry University) on Coventry’s approach to COIL and intercultural skills.',
      },
      uk: {
        title: 'Долаючи бар’єри: інтернаціоналізація вдома через COIL',
        source: 'Університет Ковентрі · КНУ, 28 квітня 2025',
        excerpt:
          'Запрошена доповідь Марини Орсіні-Джонс (Університет Ковентрі) у КНУ про підхід Ковентрі до COIL та міжкультурних навичок.',
      },
    },
  },
  {
    slug: 'cybersecurity-in-action-pcsics-2025',
    type: 'paper',
    year: 2025,
    linkKind: 'more',
    sourceUrl:
      'https://pcsits.knu.ua/wp-content/uploads/2025/04/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%B0-2025.pdf',
    text: {
      en: {
        title: 'Cybersecurity in Action: an international COIL project with interactive workshops',
        source: 'L. Liashenko, T. Andriichuk · VIII International PCSICS Conference, 11 April 2025',
        excerpt:
          'A Cybersecurity Essentials COIL pilot with partners in Ukraine, Colombia and Chile, presented with a student poster session.',
      },
      uk: {
        title: 'Cybersecurity in Action: an international COIL project with interactive workshops',
        source: 'Л. Ляшенко, Т. Андрійчук · VIII Міжнародна конференція PCSICS, 11 квітня 2025',
        excerpt:
          'Пілотний COIL Cybersecurity Essentials з партнерами з України, Колумбії та Чилі, представлений разом зі студентською постерною сесією.',
      },
    },
  },
  {
    slug: 'designing-coil-programs-2024',
    type: 'paper',
    year: 2024,
    sourceUrl: 'https://doi.org/10.62731/mcnd-18.10.2024',
    text: {
      en: {
        title:
          'Designing COIL programs for intercultural student collaboration and practical engagement with global business in scientific fields',
        source:
          'IV International Scientific Conference “Scientific Orientations: Theory and Practice of Research”',
        excerpt: ORCID_CONFERENCE.en,
      },
      uk: {
        title:
          'Designing COIL programs for intercultural student collaboration and practical engagement with global business in scientific fields',
        source:
          'IV Міжнародна наукова конференція «Scientific Orientations: Theory and Practice of Research»',
        excerpt: ORCID_CONFERENCE.uk,
      },
    },
  },
  {
    slug: 'professional-english-digital-portfolios-2024',
    type: 'paper',
    year: 2024,
    sourceUrl: 'https://doi.org/10.17721/studling2024.25.89-98',
    text: {
      en: {
        title:
          'Reevaluating assessment practices in higher education: professional English digital portfolios for first-year data analysis students',
        source: 'Studia Linguistica',
        excerpt: ORCID_JOURNAL.en,
      },
      uk: {
        title:
          'Reevaluating assessment practices in higher education: professional English digital portfolios for first-year data analysis students',
        source: 'Studia Linguistica',
        excerpt: ORCID_JOURNAL.uk,
      },
    },
  },
  {
    slug: 'abstract-writing-non-english-scholars-2024',
    type: 'paper',
    year: 2024,
    sourceUrl: 'https://doi.org/10.30525/978-9934-26-404-7-48',
    text: {
      en: {
        title:
          'Enhancing abstract impact: successful abstract writing for scholars with non-English language backgrounds',
        source: 'The Latest Development Trends in Philological Science and Education',
        excerpt: ORCID_CONFERENCE.en,
      },
      uk: {
        title:
          'Enhancing abstract impact: successful abstract writing for scholars with non-English language backgrounds',
        source: 'The Latest Development Trends in Philological Science and Education',
        excerpt: ORCID_CONFERENCE.uk,
      },
    },
  },
  {
    slug: 'english-digital-messaging-2024',
    type: 'paper',
    year: 2024,
    sourceUrl: 'https://doi.org/10.36074/grail-of-science.10.05.2024.057',
    text: {
      en: {
        title:
          'Exploring linguistic features of English language digital messaging: a study of Twitter and Instagram communication',
        source: 'Grail of Science',
        excerpt: ORCID_JOURNAL.en,
      },
      uk: {
        title:
          'Exploring linguistic features of English language digital messaging: a study of Twitter and Instagram communication',
        source: 'Grail of Science',
        excerpt: ORCID_JOURNAL.uk,
      },
    },
  },
  {
    slug: 'predicting-stock-market-trends-python-2024',
    type: 'paper',
    year: 2024,
    sourceUrl: 'https://doi.org/10.36074/grail-of-science.07.06.2024.012',
    text: {
      en: {
        title: 'Predicting stock market trends with Python',
        source: 'Grail of Science',
        excerpt: ORCID_JOURNAL.en,
      },
      uk: {
        title: 'Predicting stock market trends with Python',
        source: 'Grail of Science',
        excerpt: ORCID_JOURNAL.uk,
      },
    },
  },
];

const PUBLICATIONS = mapLocalized(PUBLICATION_LABELS, (labels, locale) =>
  ENTRIES.map(({ text, linkKind, detailLinks, ...entry }): Publication => {
    const { detail, ...localizedText } = text[locale];
    const kind = linkKind ?? (entry.type === 'paper' ? 'paper' : 'more');

    return {
      ...entry,
      ...localizedText,
      linkLabel: kind === 'paper' ? labels.readPaper : labels.readMore,
      detail: detail && { ...detail, ...detailLinks },
    };
  }),
);

export const usePublications = () => useLocalized(PUBLICATIONS);

export const findPublication = (publications: Publication[], slug: string | undefined) =>
  publications.find((publication) => publication.slug === slug);
