import type { Localized } from '@/shared/i18n/model/types';
import type { HomePartner, NetworkPartner } from './types';
import asset_partner_logo_american_university_in_the_emirates from '@/shared/assets/contentful/partner-logo-american-university-in-the-emirates.webp';
import asset_partner_logo_campbellsville_university from '@/shared/assets/contentful/partner-logo-campbellsville-university.webp';
import asset_partner_logo_coventry_university from '@/shared/assets/contentful/partner-logo-coventry-university.webp';
import asset_partner_logo_ecole_nationale_polytechnique from '@/shared/assets/contentful/partner-logo-ecole-nationale-polytechnique.webp';
import asset_partner_logo_florida_international_university from '@/shared/assets/contentful/partner-logo-florida-international-university.webp';
import asset_partner_logo_florida_state_university from '@/shared/assets/contentful/partner-logo-florida-state-university.webp';
import asset_partner_logo_georgia_state_university from '@/shared/assets/contentful/partner-logo-georgia-state-university.webp';
import asset_partner_logo_indiana_university from '@/shared/assets/contentful/partner-logo-indiana-university.webp';
import asset_partner_logo_johns_hopkins_university from '@/shared/assets/contentful/partner-logo-johns-hopkins-university.webp';
import asset_partner_logo_karunya_institute_of_technology_and_sciences from '@/shared/assets/contentful/partner-logo-karunya-institute-of-technology-and-sciences.webp';
import asset_partner_logo_lancaster_university from '@/shared/assets/contentful/partner-logo-lancaster-university.webp';
import asset_partner_logo_lutsk_national_technical_university from '@/shared/assets/contentful/partner-logo-lutsk-national-technical-university.webp';
import asset_partner_logo_manchester_metropolitan_university from '@/shared/assets/contentful/partner-logo-manchester-metropolitan-university.webp';
import asset_partner_logo_pryazovskyi_state_technical_university from '@/shared/assets/contentful/partner-logo-pryazovskyi-state-technical-university.webp';
import asset_partner_logo_universidad_catolica_de_colombia from '@/shared/assets/contentful/partner-logo-universidad-catolica-de-colombia.webp';
import asset_partner_logo_universidad_santo_tomas from '@/shared/assets/contentful/partner-logo-universidad-santo-tomas.webp';
import asset_partner_logo_university_of_central_arkansas from '@/shared/assets/contentful/partner-logo-university-of-central-arkansas.webp';
import asset_partner_logo_university_of_florida from '@/shared/assets/contentful/partner-logo-university-of-florida.webp';
import asset_partner_logo_university_of_oxford from '@/shared/assets/contentful/partner-logo-university-of-oxford.webp';

export const HOME_PARTNERS: Localized<HomePartner[]> = {
  en: [
    {
      name: 'Johns Hopkins University',
      logo: asset_partner_logo_johns_hopkins_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'Coventry University',
      logo: asset_partner_logo_coventry_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'Georgia State University',
      logo: asset_partner_logo_georgia_state_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'University of Florida',
      logo: asset_partner_logo_university_of_florida,
      logoHeight: 30,
      logoHeightLg: 34,
    },
    {
      name: 'Karunya Institute of Technology and Sciences',
      logo: asset_partner_logo_karunya_institute_of_technology_and_sciences,
      logoHeight: 40,
      logoHeightLg: 52,
      caption: ['Karunya Institute', 'of Technology'],
    },
    {
      name: 'École Nationale Polytechnique',
      logo: asset_partner_logo_ecole_nationale_polytechnique,
      logoHeight: 46,
      logoHeightLg: 50,
    },
  ],
  uk: [
    {
      name: 'Університет Джонса Гопкінса',
      logo: asset_partner_logo_johns_hopkins_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'Університет Ковентрі',
      logo: asset_partner_logo_coventry_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'Університет штату Джорджія',
      logo: asset_partner_logo_georgia_state_university,
      logoHeight: 52,
      logoHeightLg: 56,
    },
    {
      name: 'University of Florida',
      logo: asset_partner_logo_university_of_florida,
      logoHeight: 30,
      logoHeightLg: 34,
    },
    {
      name: 'Karunya Institute of Technology and Sciences',
      logo: asset_partner_logo_karunya_institute_of_technology_and_sciences,
      logoHeight: 40,
      logoHeightLg: 52,
      caption: ['Karunya Institute', 'of Technology'],
    },
    {
      name: 'École Nationale Polytechnique',
      logo: asset_partner_logo_ecole_nationale_polytechnique,
      logoHeight: 46,
      logoHeightLg: 50,
    },
  ],
};

export const NETWORK_PARTNERS: Localized<NetworkPartner[]> = {
  en: [
    {
      code: 'UK',
      name: 'University of Oxford',
      location: 'United Kingdom',
      logo: asset_partner_logo_university_of_oxford,
    },
    {
      code: 'UK',
      name: 'Lancaster University',
      location: 'United Kingdom',
      logo: asset_partner_logo_lancaster_university,
    },
    {
      code: 'UK',
      name: 'Coventry University',
      location: 'United Kingdom',
      logo: asset_partner_logo_coventry_university,
    },
    {
      code: 'UK',
      name: 'Manchester Metropolitan University',
      location: 'United Kingdom',
      logo: asset_partner_logo_manchester_metropolitan_university,
    },
    {
      code: 'US',
      name: 'Johns Hopkins University',
      location: 'USA',
      logo: asset_partner_logo_johns_hopkins_university,
    },
    {
      code: 'US',
      name: 'Indiana University',
      location: 'USA',
      logo: asset_partner_logo_indiana_university,
    },
    {
      code: 'US',
      name: 'Florida International University',
      location: 'USA',
      logo: asset_partner_logo_florida_international_university,
    },
    {
      code: 'US',
      name: 'Florida State University',
      location: 'USA',
      logo: asset_partner_logo_florida_state_university,
    },
    {
      code: 'US',
      name: 'University of Central Arkansas',
      location: 'USA',
      logo: asset_partner_logo_university_of_central_arkansas,
    },
    {
      code: 'US',
      name: 'Georgia State University',
      location: 'USA · Perimeter College',
      logo: asset_partner_logo_georgia_state_university,
    },
    {
      code: 'US',
      name: 'Campbellsville University',
      location: 'USA',
      logo: asset_partner_logo_campbellsville_university,
    },
    {
      code: 'CO',
      name: 'Universidad Católica de Colombia',
      location: 'Colombia',
      logo: asset_partner_logo_universidad_catolica_de_colombia,
    },
    {
      code: 'CL',
      name: 'Universidad Santo Tomás',
      location: 'Chile',
      logo: asset_partner_logo_universidad_santo_tomas,
    },
    {
      code: 'DZ',
      name: 'École Nationale Polytechnique',
      location: 'Algeria · Algiers',
      logo: asset_partner_logo_ecole_nationale_polytechnique,
    },
    {
      code: 'AE',
      name: 'American University in the Emirates',
      location: 'UAE',
      logo: asset_partner_logo_american_university_in_the_emirates,
    },
    {
      code: 'IN',
      name: 'Karunya Institute of Technology and Sciences',
      location: 'India',
      logo: asset_partner_logo_karunya_institute_of_technology_and_sciences,
    },
    {
      code: 'UA',
      name: 'Lutsk National Technical University',
      location: 'Ukraine',
      logo: asset_partner_logo_lutsk_national_technical_university,
    },
    {
      code: 'UA',
      name: 'Pryazovskyi State Technical University',
      location: 'Ukraine',
      logo: asset_partner_logo_pryazovskyi_state_technical_university,
    },
  ],
  uk: [
    {
      code: 'UK',
      name: 'Оксфордський університет',
      location: 'Велика Британія',
      logo: asset_partner_logo_university_of_oxford,
    },
    {
      code: 'UK',
      name: 'Ланкастерський університет',
      location: 'Велика Британія',
      logo: asset_partner_logo_lancaster_university,
    },
    {
      code: 'UK',
      name: 'Університет Ковентрі',
      location: 'Велика Британія',
      logo: asset_partner_logo_coventry_university,
    },
    {
      code: 'UK',
      name: 'Манчестерський столичний університет',
      location: 'Велика Британія',
      logo: asset_partner_logo_manchester_metropolitan_university,
    },
    {
      code: 'US',
      name: 'Університет Джонса Гопкінса',
      location: 'США',
      logo: asset_partner_logo_johns_hopkins_university,
    },
    {
      code: 'US',
      name: 'Університет Індіани',
      location: 'США',
      logo: asset_partner_logo_indiana_university,
    },
    {
      code: 'US',
      name: 'Міжнародний університет Флориди',
      location: 'США',
      logo: asset_partner_logo_florida_international_university,
    },
    {
      code: 'US',
      name: 'Університет штату Флорида',
      location: 'США',
      logo: asset_partner_logo_florida_state_university,
    },
    {
      code: 'US',
      name: 'Університет Центрального Арканзасу',
      location: 'США',
      logo: asset_partner_logo_university_of_central_arkansas,
    },
    {
      code: 'US',
      name: 'Університет штату Джорджія',
      location: 'США · Perimeter College',
      logo: asset_partner_logo_georgia_state_university,
    },
    {
      code: 'US',
      name: 'Університет Кемпбеллсвілла',
      location: 'США',
      logo: asset_partner_logo_campbellsville_university,
    },
    {
      code: 'CO',
      name: 'Universidad Católica de Colombia',
      location: 'Колумбія',
      logo: asset_partner_logo_universidad_catolica_de_colombia,
    },
    {
      code: 'CL',
      name: 'Universidad Santo Tomás',
      location: 'Чилі',
      logo: asset_partner_logo_universidad_santo_tomas,
    },
    {
      code: 'DZ',
      name: 'École Nationale Polytechnique',
      location: 'Алжир · м. Алжир',
      logo: asset_partner_logo_ecole_nationale_polytechnique,
    },
    {
      code: 'AE',
      name: 'Американський університет в Еміратах',
      location: 'ОАЕ',
      logo: asset_partner_logo_american_university_in_the_emirates,
    },
    {
      code: 'IN',
      name: 'Karunya Institute of Technology and Sciences',
      location: 'Індія',
      logo: asset_partner_logo_karunya_institute_of_technology_and_sciences,
    },
    {
      code: 'UA',
      name: 'Луцький національний технічний університет',
      location: 'Україна',
      logo: asset_partner_logo_lutsk_national_technical_university,
    },
    {
      code: 'UA',
      name: 'Приазовський державний технічний університет',
      location: 'Україна',
      logo: asset_partner_logo_pryazovskyi_state_technical_university,
    },
  ],
};
