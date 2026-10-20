import type { Publication, PublicationType } from './types';

export const PUBLICATION_TYPE_LABEL: Record<PublicationType, string> = {
  paper: 'Paper',
  news: 'News',
  event: 'Event',
  media: 'Media',
};

export const PUBLICATIONS: Publication[] = [
  {
    slug: 'first-intercontinental-coil-project',
    type: 'news',
    year: 2025,
    title: 'The first intercontinental virtual student research (COIL) project',
    source: 'Educational and Scientific Institute of Philology, KNU',
    excerpt:
      'Master’s students of the Faculty of Information Technologies initiated and delivered the first intercontinental author’s research project in Ukrainian higher education, together with partner universities in the UK, Colombia, Chile, the UAE and India.',
    linkLabel: 'Read more →',
    isFeatured: true,
  },
  {
    slug: 'from-virtual-classroom-to-publication',
    type: 'paper',
    year: 2026,
    title: 'From virtual classroom to publication: student research in a «B» journal',
    source: 'A. Loban, K. Kravets, M. Tymoshenko et al. · KNU FIT',
    excerpt:
      'Six KNU FIT students turned their COIL research into a peer-reviewed article in a category «B» journal.',
    linkLabel: 'Read paper →',
    detail: {
      heroTitle: 'From virtual classroom',
      heroAccent: 'to publication.',
      lead: 'Six KNU FIT students turned their COIL research into a peer-reviewed article in a category «B» journal.',
      formatLabel: 'Article',
      kindLabel: 'Journal article',
      publishedOn: '2 May 2026',
      readTime: '4 min read',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The study grew out of an international COIL project: students formulated a research question in a virtual classroom, analysed data with international peers and prepared the paper with KNU FIT researchers.',
        },
        { kind: 'heading', text: 'From an idea to global publication' },
        {
          kind: 'paragraph',
          text: 'The team combined a Master’s student in Cybersecurity with five first-year Computer Science students.',
        },
        {
          kind: 'paragraph',
          text: 'Supervisors: Oleh Ilarionov, Olha Pronina and Olha Zahorodnya.',
        },
        {
          kind: 'quote',
          text: '“From an idea → to collaboration → to research → to global publication.”',
          author: '— VIRaTeC',
        },
        { kind: 'heading', text: 'Conclusion' },
        {
          kind: 'paragraph',
          text: 'The publication shows how Research-Based Learning turns students into researchers, creators and leaders.',
        },
      ],
      authors: 'A. Loban, K. Kravets, M. Tymoshenko, A. Mekshun, M. Artemenko, S. Vasylyeva',
      sourceLabel: 'Ukrainian peer-reviewed journal, category «B»',
    },
  },
  {
    slug: 'global-collaboration-framework-workshop',
    type: 'event',
    year: 2026,
    title: 'Author-led workshop by Dr. Kelly Tzoumis (JHU): Global Collaboration Framework',
    source: 'VIRaTeC',
    excerpt:
      'Global Collaboration Framework workshops with Dr. Kelly Tzoumis for 54 students and educators.',
    linkLabel: 'Read more →',
  },
  {
    slug: 'digital-narratives-2026',
    type: 'media',
    year: 2026,
    title: 'Digital Narratives: AI and IT in Multidisciplinary Research 2026',
    source: 'Conference · KNU, 8 June 2026',
    excerpt: 'Results of certified COIL modules 2025–2026.',
    linkLabel: 'Read more →',
  },
  {
    slug: 'learning-through-experience',
    type: 'news',
    year: 2026,
    title: 'Learning Through Experience: offshore wind farm negotiation with JHU',
    source: 'VIRaTeC',
    excerpt: 'Students from 6 countries negotiated an offshore wind farm.',
    linkLabel: 'Read more →',
  },
  {
    slug: 'global-minds-in-action',
    type: 'paper',
    year: 2026,
    title: 'Global Minds in Action: Foundations of NLP COIL module',
    source: 'E. Parkhomenko et al. · 200+ students, 7 universities',
    excerpt: '200+ students, 31 teams, 7 universities.',
    linkLabel: 'Read paper →',
  },
  {
    slug: 'from-student-ideas-to-global-research',
    type: 'event',
    year: 2026,
    title: 'From Student Ideas to Global Research (JHU × KNU)',
    source: 'Online · 15 Sep 2026',
    excerpt: 'Online · 15 Sep 2026',
    linkLabel: 'Read more →',
  },
];

export const findPublication = (slug: string | undefined) =>
  PUBLICATIONS.find((publication) => publication.slug === slug);
