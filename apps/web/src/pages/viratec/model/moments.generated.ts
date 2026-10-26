import type { Localized } from '@/shared/i18n/model/types';
import type { MomentItem } from './types';
import asset_moment_alliance_photo from '@/shared/assets/contentful/moment-alliance-photo.webp';
import asset_moment_certificateceremony_photo from '@/shared/assets/contentful/moment-certificateceremony-photo.webp';
import asset_moment_certificatesparticipants_photo from '@/shared/assets/contentful/moment-certificatesparticipants-photo.webp';
import asset_moment_coilseriestalk_photo from '@/shared/assets/contentful/moment-coilseriestalk-photo.webp';
import asset_moment_community_photo from '@/shared/assets/contentful/moment-community-photo.webp';
import asset_moment_intercultural_photo from '@/shared/assets/contentful/moment-intercultural-photo.webp';
import asset_moment_ivec_photo from '@/shared/assets/contentful/moment-ivec-photo.webp';
import asset_moment_jhuroleplay_photo from '@/shared/assets/contentful/moment-jhuroleplay-photo.webp';
import asset_moment_karunya_photo from '@/shared/assets/contentful/moment-karunya-photo.webp';
import asset_moment_oxford_photo from '@/shared/assets/contentful/moment-oxford-photo.webp';
import asset_moment_studentsfaculty_photo from '@/shared/assets/contentful/moment-studentsfaculty-photo.webp';
import asset_moment_studentspeaker_photo from '@/shared/assets/contentful/moment-studentspeaker-photo.webp';

export const MOMENTS: Localized<MomentItem[]> = {
  en: [
    {
      image: asset_moment_certificateceremony_photo,
      caption: 'Certificate ceremony of the 2025 VIRaTeC COIL Series, KNU',
    },
    {
      image: asset_moment_coilseriestalk_photo,
      caption: 'Implementing COIL modules: a talk at the VIRaTeC COIL Series 2025',
    },
    {
      image: asset_moment_oxford_photo,
      caption: 'Presenting at the University of Oxford, Saïd Business School',
    },
    {
      image: asset_moment_ivec_photo,
      caption: 'International Virtual Exchange Conference IVEC 2025, Heraklion',
    },
    {
      image: asset_moment_jhuroleplay_photo,
      caption: 'Offshore wind farm negotiation with Johns Hopkins University, online',
    },
    {
      image: asset_moment_alliance_photo,
      caption: 'With the Alliance of Ukrainian Universities at KNU',
    },
    { image: asset_moment_studentspeaker_photo, caption: 'A student takes the floor at KNU' },
    {
      image: asset_moment_karunya_photo,
      caption: 'Online session with Karunya Institute of Technology and Sciences',
    },
    {
      image: asset_moment_certificatesparticipants_photo,
      caption: 'Module participants with their certificates',
    },
    { image: asset_moment_intercultural_photo, caption: 'Intercultural exchange at KNU' },
    { image: asset_moment_community_photo, caption: 'The VIRaTeC community at KNU' },
    { image: asset_moment_studentsfaculty_photo, caption: 'Students and faculty at KNU' },
  ],
  uk: [
    {
      image: asset_moment_certificateceremony_photo,
      caption: 'Церемонія вручення сертифікатів VIRaTeC COIL Series 2025, КНУ',
    },
    {
      image: asset_moment_coilseriestalk_photo,
      caption: 'Доповідь про впровадження COIL-модулів на VIRaTeC COIL Series 2025',
    },
    {
      image: asset_moment_oxford_photo,
      caption: 'Виступ в Оксфордському університеті, Saïd Business School',
    },
    {
      image: asset_moment_ivec_photo,
      caption: 'Міжнародна конференція з віртуального обміну IVEC 2025, Іракліон',
    },
    {
      image: asset_moment_jhuroleplay_photo,
      caption:
        'Переговори щодо офшорної вітрової електростанції з Університетом Джонса Гопкінса, онлайн',
    },
    {
      image: asset_moment_alliance_photo,
      caption: 'Разом з Альянсом українських університетів у КНУ',
    },
    { image: asset_moment_studentspeaker_photo, caption: 'Виступ студентки в КНУ' },
    {
      image: asset_moment_karunya_photo,
      caption: 'Онлайн-сесія з Karunya Institute of Technology and Sciences',
    },
    {
      image: asset_moment_certificatesparticipants_photo,
      caption: 'Учасники модулів із сертифікатами',
    },
    { image: asset_moment_intercultural_photo, caption: 'Міжкультурний обмін у КНУ' },
    { image: asset_moment_community_photo, caption: 'Спільнота VIRaTeC у КНУ' },
    { image: asset_moment_studentsfaculty_photo, caption: 'Студенти й викладачі в КНУ' },
  ],
};
