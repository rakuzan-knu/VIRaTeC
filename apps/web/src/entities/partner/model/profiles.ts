import type { Localized } from '@/shared/i18n';
import americanUniversityInTheEmirates from '@/shared/assets/partners/american-university-in-the-emirates.webp';
import campbellsvilleUniversity from '@/shared/assets/partners/campbellsville-university.webp';
import coventryUniversity from '@/shared/assets/partners/coventry-university.webp';
import ecoleNationalePolytechnique from '@/shared/assets/partners/ecole-nationale-polytechnique.webp';
import floridaInternationalUniversity from '@/shared/assets/partners/florida-international-university.webp';
import floridaStateUniversity from '@/shared/assets/partners/florida-state-university.webp';
import georgiaStateUniversity from '@/shared/assets/partners/georgia-state-university.webp';
import indianaUniversity from '@/shared/assets/partners/indiana-university.webp';
import johnsHopkinsUniversity from '@/shared/assets/partners/johns-hopkins-university.webp';
import karunyaInstitute from '@/shared/assets/partners/karunya-institute-of-technology-and-sciences.webp';
import lancasterUniversity from '@/shared/assets/partners/lancaster-university.webp';
import lutskNationalTechnicalUniversity from '@/shared/assets/partners/lutsk-national-technical-university.webp';
import manchesterMetropolitanUniversity from '@/shared/assets/partners/manchester-metropolitan-university.webp';
import pryazovskyiStateTechnicalUniversity from '@/shared/assets/partners/pryazovskyi-state-technical-university.webp';
import universidadCatolicaDeColombia from '@/shared/assets/partners/universidad-catolica-de-colombia.webp';
import universidadSantoTomas from '@/shared/assets/partners/universidad-santo-tomas.webp';
import universityOfCentralArkansas from '@/shared/assets/partners/university-of-central-arkansas.webp';
import universityOfFlorida from '@/shared/assets/partners/university-of-florida.webp';
import universityOfOxford from '@/shared/assets/partners/university-of-oxford.webp';
import type { PartnerProfile } from './types';

const text = (en: string, uk: string): Localized<string> => ({ en, uk });

export const PARTNER_PROFILES: PartnerProfile[] = [
  {
    aliases: ['University of Oxford', 'Оксфордський університет'],
    logo: universityOfOxford,
    website: 'https://www.ox.ac.uk/',
    founded: text('c. 1096', 'бл. 1096'),
    place: text('Oxford, England', 'Оксфорд, Англія'),
    kind: text('Collegiate research university', 'Колегіальний дослідницький університет'),
    summary: text(
      'The oldest university in the English-speaking world, with evidence of teaching as early as 1096.',
      'Найстаріший університет англомовного світу: перші свідчення про викладання тут датовані 1096 роком.',
    ),
  },
  {
    aliases: ['Lancaster University', 'Ланкастерський університет'],
    logo: lancasterUniversity,
    website: 'https://www.lancaster.ac.uk/',
    founded: text('1964', '1964'),
    place: text('Lancaster, England', 'Ланкастер, Англія'),
    kind: text(
      'Public collegiate research university',
      'Державний колегіальний дослідницький університет',
    ),
    summary: text(
      'Established by royal charter in 1964 as one of the new universities of the 1960s.',
      'Заснований королівською хартією 1964 року як один із нових університетів 1960-х.',
    ),
  },
  {
    aliases: ['Coventry University', 'Університет Ковентрі'],
    logo: coventryUniversity,
    website: 'https://www.coventry.ac.uk/',
    founded: text('1992', '1992'),
    place: text('Coventry, England', 'Ковентрі, Англія'),
    kind: text('Public research university', 'Державний дослідницький університет'),
    summary: text(
      'Traces its origins to the Coventry School of Design of 1843 and gained university status in 1992.',
      'Веде свою історію від Ковентрійської школи дизайну 1843 року, статус університету отримав 1992 року.',
    ),
  },
  {
    aliases: ['Manchester Metropolitan University', 'Манчестерський столичний університет'],
    logo: manchesterMetropolitanUniversity,
    website: 'https://www.mmu.ac.uk/',
    founded: text('1992', '1992'),
    place: text('Manchester, England', 'Манчестер, Англія'),
    kind: text('Public university', 'Державний університет'),
    summary: text(
      'The successor to Manchester Polytechnic, which gained university status in 1992.',
      'Наступник Манчестерського політехнічного інституту, що отримав статус університету 1992 року.',
    ),
  },
  {
    aliases: ['Johns Hopkins University', 'Університет Джонса Гопкінса'],
    logo: johnsHopkinsUniversity,
    website: 'https://www.jhu.edu/',
    founded: text('1876', '1876'),
    place: text('Baltimore, Maryland, USA', 'Балтимор, Меріленд, США'),
    kind: text('Private research university', 'Приватний дослідницький університет'),
    summary: text(
      'Opened in 1876 and modelled on the European research institution.',
      'Відкритий 1876 року за моделлю європейського дослідницького закладу.',
    ),
  },
  {
    aliases: ['Indiana University', 'Університет Індіани'],
    logo: indianaUniversity,
    website: 'https://www.iu.edu/',
    founded: text('1820', '1820'),
    place: text(
      'Bloomington and Indianapolis, Indiana, USA',
      'Блумінгтон та Індіанаполіс, Індіана, США',
    ),
    kind: text('Public university system', 'Система державних університетів'),
    summary: text(
      'A system of public universities with two core campuses and five regional campuses.',
      'Система державних університетів із двома основними та п’ятьма регіональними кампусами.',
    ),
  },
  {
    aliases: ['Florida International University', 'Міжнародний університет Флориди'],
    logo: floridaInternationalUniversity,
    website: 'https://www.fiu.edu/',
    founded: text('1965', '1965'),
    place: text('Westchester, Florida, USA', 'Вестчестер, Флорида, США'),
    kind: text('Public research university', 'Державний дослідницький університет'),
    summary: text(
      'Founded by the Florida Legislature in 1965, it opened to students in 1972.',
      'Заснований законодавчими зборами Флориди 1965 року, перших студентів прийняв 1972 року.',
    ),
  },
  {
    aliases: ['Florida State University', 'Університет штату Флорида'],
    logo: floridaStateUniversity,
    website: 'https://www.fsu.edu/',
    founded: text('1851', '1851'),
    place: text('Tallahassee, Florida, USA', 'Таллахассі, Флорида, США'),
    kind: text('Public research university', 'Державний дослідницький університет'),
    summary: text(
      'Chartered in 1851 and a senior member of the State University System of Florida.',
      'Отримав статут 1851 року, один із провідних закладів Системи державних університетів Флориди.',
    ),
  },
  {
    aliases: ['University of Central Arkansas', 'Університет Центрального Арканзасу'],
    logo: universityOfCentralArkansas,
    website: 'https://uca.edu/',
    founded: text('1907', '1907'),
    place: text('Conway, Arkansas, USA', 'Конвей, Арканзас, США'),
    kind: text('Public university', 'Державний університет'),
    summary: text(
      'Founded in 1907 and one of the oldest universities in Arkansas.',
      'Заснований 1907 року, один із найстаріших університетів Арканзасу.',
    ),
  },
  {
    aliases: ['Georgia State University', 'Університет штату Джорджія'],
    logo: georgiaStateUniversity,
    website: 'https://www.gsu.edu/',
    founded: text('1913', '1913'),
    place: text('Atlanta, Georgia, USA', 'Атланта, Джорджія, США'),
    kind: text('Public research university', 'Державний дослідницький університет'),
    summary: text(
      'One of the four research universities of the University System of Georgia. Its Perimeter College serves suburban Atlanta.',
      'Один із чотирьох дослідницьких університетів Системи університетів Джорджії. Його Perimeter College працює в передмісті Атланти.',
    ),
  },
  {
    aliases: ['Campbellsville University', 'Університет Кемпбеллсвілла'],
    logo: campbellsvilleUniversity,
    website: 'https://www.campbellsville.edu/',
    founded: text('1906', '1906'),
    place: text('Campbellsville, Kentucky, USA', 'Кемпбеллсвілл, Кентуккі, США'),
    kind: text('Private Christian university', 'Приватний християнський університет'),
    summary: text(
      'Founded as Russell Creek Academy, it now offers associate, bachelor’s and master’s degrees.',
      'Заснований як Академія Рассел-Крік, нині надає ступені асоціата, бакалавра та магістра.',
    ),
  },
  {
    aliases: ['Universidad Católica de Colombia'],
    logo: universidadCatolicaDeColombia,
    website: 'https://www.ucatolica.edu.co/',
    founded: text('1970', '1970'),
    place: text('Bogotá, Colombia', 'Богота, Колумбія'),
    kind: text('Private university', 'Приватний університет'),
    summary: text(
      'Founded on 3 March 1970 by a group of professors, with teaching grounded in Catholic principles.',
      'Заснований групою викладачів 3 березня 1970 року, навчання спирається на засади католицизму.',
    ),
  },
  {
    aliases: ['Universidad Santo Tomás'],
    logo: universidadSantoTomas,
    website: 'https://www.ust.cl/',
    founded: text('1988', '1988'),
    place: text('Santiago, Chile', 'Сантьяго, Чилі'),
    kind: text('Private non-profit university', 'Приватний некомерційний університет'),
    summary: text(
      'Inspired by Thomist thought, with its central campus in Santiago and 12 regional campuses from Arica to Puerto Montt.',
      'Натхненний томістською думкою: головний кампус у Сантьяго та 12 регіональних від Арики до Пуерто-Монта.',
    ),
  },
  {
    aliases: ['École Nationale Polytechnique'],
    logo: ecoleNationalePolytechnique,
    website: 'https://www.enp.edu.dz/',
    founded: text('1925', '1925'),
    place: text('El Harrach, Algiers, Algeria', 'Ель-Харраш, м. Алжир, Алжир'),
    kind: text('Engineering school', 'Інженерна школа'),
    summary: text(
      'An engineering school founded in 1925, teaching in Arabic, French and English.',
      'Інженерна школа, заснована 1925 року, з викладанням арабською, французькою та англійською.',
    ),
  },
  {
    aliases: ['American University in the Emirates', 'Американський університет в Еміратах'],
    logo: americanUniversityInTheEmirates,
    website: 'https://www.aue.ae/',
    founded: text('2006', '2006'),
    place: text('Dubai, United Arab Emirates', 'Дубай, ОАЕ'),
    kind: text('Private university', 'Приватний університет'),
    summary: text(
      'A private university in Dubai International Academic City, founded in 2006.',
      'Приватний університет у Міжнародному академічному місті Дубая, заснований 2006 року.',
    ),
  },
  {
    aliases: ['Karunya Institute of Technology and Sciences'],
    logo: karunyaInstitute,
    website: 'https://www.karunya.edu/',
    founded: text('1986', '1986'),
    place: text('Coimbatore, Tamil Nadu, India', 'Коїмбатур, Таміл Наду, Індія'),
    kind: text('Private deemed university', 'Приватний університет зі статусом deemed'),
    summary: text(
      'Formerly Karunya University, founded by D. G. S. Dhinakaran and his son Paul Dhinakaran.',
      'Колишній Університет Каруньї, заснований Д. Г. С. Дінакараном та його сином Полом Дінакараном.',
    ),
  },
  {
    aliases: ['Lutsk National Technical University', 'Луцький національний технічний університет'],
    logo: lutskNationalTechnicalUniversity,
    website: 'https://lntu.edu.ua/',
    founded: text('1966', '1966'),
    place: text('Lutsk, Ukraine', 'Луцьк, Україна'),
    kind: text('State technical university', 'Державний технічний університет'),
    summary: text(
      'A state technical university in Lutsk, founded in 1966.',
      'Державний технічний заклад вищої освіти в Луцьку, заснований 1966 року.',
    ),
  },
  {
    aliases: [
      'Pryazovskyi State Technical University',
      'Приазовський державний технічний університет',
    ],
    logo: pryazovskyiStateTechnicalUniversity,
    website: 'https://pstu.edu/',
    founded: text('1930', '1930'),
    place: text('Dnipro, Ukraine', 'Дніпро, Україна'),
    kind: text('State technical university', 'Державний технічний університет'),
    summary: text(
      'One of the oldest universities of the Donetsk region, now operating from Dnipro.',
      'Один із найстаріших університетів Донеччини, нині працює у Дніпрі.',
    ),
  },
  {
    aliases: ['University of Florida'],
    logo: universityOfFlorida,
    website: 'https://www.ufl.edu/',
    founded: text('1853', '1853'),
    place: text('Gainesville, Florida, USA', 'Гейнсвілл, Флорида, США'),
    kind: text('Public land-grant research university', 'Державний дослідницький університет'),
    summary: text(
      'A senior member of the State University System of Florida, tracing its origins to 1853.',
      'Один із провідних закладів Системи державних університетів Флориди, веде історію від 1853 року.',
    ),
  },
];
