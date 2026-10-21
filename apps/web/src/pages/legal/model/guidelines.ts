import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { defineMessages } from '@/shared/i18n';
import type { LegalDocumentContent } from './types';

export const GUIDELINES_CONTENT = defineMessages<LegalDocumentContent>({
  en: {
    title: 'Community Guidelines',
    accent: 'How we work together.',
    description:
      'VIRaTeC brings together students and researchers from many countries, cultures and disciplines. These guidelines keep the community curious, honest and safe for everyone.',
    sections: [
      {
        id: 'spirit',
        title: 'The spirit of VIRaTeC',
        summary: 'Assume good intent, stay curious, and make room for every voice.',
        paragraphs: [
          'Our community is built on intercultural competence, academic integrity and student leadership. We expect every member — students, researchers, mentors and partners — to contribute in that spirit, online and in joint projects.',
        ],
      },
      {
        id: 'respect',
        title: 'Be respectful',
        summary: 'Disagree with ideas, not with people.',
        paragraphs: ['Healthy debate is welcome. To keep it healthy:'],
        list: [
          'treat others with courtesy, regardless of nationality, language, gender, age, religion, disability or background;',
          'remember that many members write in a second or third language — be patient with mistakes;',
          'give constructive feedback: specific, kind and focused on the work;',
          'never harass, threaten, bully or demean anyone.',
        ],
      },
      {
        id: 'integrity',
        title: 'Keep it honest',
        summary: 'Cite your sources, credit your co-authors, and be open about how you used AI.',
        paragraphs: ['Academic integrity is non-negotiable:'],
        list: [
          'publish only work you created or have the right to share, and cite sources properly;',
          'list all co-authors and contributors, and get their agreement before publishing;',
          'never fabricate or manipulate data or results;',
          'disclose meaningful use of AI tools in research or writing, as you would any other method.',
        ],
      },
      {
        id: 'research-ethics',
        title: 'Research with care',
        summary:
          'If people took part in your study, protect their privacy and respect their consent.',
        paragraphs: [
          'When you share research that involves human participants, make sure it has the necessary ethical approval and informed consent, and remove or anonymise personal data before publishing.',
        ],
      },
      {
        id: 'privacy',
        title: 'Protect privacy',
        summary: 'Do not share anyone’s personal details without their permission.',
        paragraphs: [
          'Do not post other people’s contact details, photos, documents or private messages without their consent. Share only what you are comfortable making visible to the whole community.',
        ],
      },
      {
        id: 'security',
        title: 'Hack responsibly',
        summary:
          'Cybersecurity is one of our research areas — but never test this Platform without permission.',
        paragraphs: [
          `Do not attempt to break, scan or bypass the security of the Platform or other users’ accounts. If you discover a vulnerability, report it privately to ${CONTACT_EMAIL} and give us reasonable time to fix it before disclosing it. We appreciate and will credit responsible reports.`,
          'Never share malware, exploits targeting real systems, or instructions intended to cause harm.',
        ],
      },
      {
        id: 'not-allowed',
        title: 'What is not allowed',
        summary: 'Anything illegal, hateful, deceptive or commercial spam.',
        paragraphs: ['The following content will be removed:'],
        list: [
          'hate speech, discrimination, harassment or threats;',
          'sexually explicit or violent content;',
          'plagiarism, copyright infringement or fake authorship;',
          'disinformation and deliberately misleading content;',
          'spam, advertising or unsolicited commercial offers;',
          'content that glorifies or justifies aggression, war crimes or terrorism.',
        ],
      },
      {
        id: 'moderation',
        title: 'Reporting and moderation',
        summary: 'See something wrong? Tell us. We review every report and respond fairly.',
        paragraphs: [
          `If you see content or behaviour that breaks these guidelines, report it to ${CONTACT_EMAIL} with a link and a short description. Moderators review reports confidentially.`,
          'Depending on severity, we may: ask you to edit the content, remove it, issue a warning, temporarily restrict your account, or close it for serious or repeated violations. If you think a decision was wrong, reply to our message and a different team member will review it.',
        ],
      },
    ],
  },
  uk: {
    title: 'Правила спільноти',
    accent: 'Як ми працюємо разом.',
    description:
      'VIRaTeC об’єднує студентів і дослідників із різних країн, культур і дисциплін. Ці правила допомагають зберігати спільноту допитливою, чесною та безпечною для всіх.',
    sections: [
      {
        id: 'spirit',
        title: 'Дух VIRaTeC',
        summary: 'Припускайте добрі наміри, залишайтеся допитливими й дайте місце кожному голосу.',
        paragraphs: [
          'Наша спільнота спирається на міжкультурну компетентність, академічну доброчесність і студентське лідерство. Ми очікуємо, що кожен учасник — студенти, дослідники, ментори та партнери — діятиме в цьому дусі як онлайн, так і в спільних проєктах.',
        ],
      },
      {
        id: 'respect',
        title: 'Будьте шанобливими',
        summary: 'Сперечайтеся з ідеями, а не з людьми.',
        paragraphs: ['Здорова дискусія вітається. Щоб вона такою й залишалася:'],
        list: [
          'ставтеся до інших чемно незалежно від національності, мови, статі, віку, релігії, інвалідності чи походження;',
          'пам’ятайте, що багато учасників пишуть другою чи третьою мовою, — будьте терплячими до помилок;',
          'давайте конструктивний відгук: конкретний, доброзичливий і щодо роботи;',
          'ніколи не цькуйте, не погрожуйте й не принижуйте нікого.',
        ],
      },
      {
        id: 'integrity',
        title: 'Будьте чесними',
        summary:
          'Посилайтеся на джерела, зазначайте співавторів і відкрито кажіть, як використовували ШІ.',
        paragraphs: ['Академічна доброчесність — обов’язкова:'],
        list: [
          'публікуйте лише роботи, які створили самі або маєте право поширювати, і коректно посилайтеся на джерела;',
          'зазначайте всіх співавторів і учасників та отримуйте їхню згоду перед публікацією;',
          'ніколи не фабрикуйте й не фальсифікуйте дані чи результати;',
          'розкривайте суттєве використання інструментів ШІ в дослідженні чи тексті, як і будь-якого іншого методу.',
        ],
      },
      {
        id: 'research-ethics',
        title: 'Досліджуйте відповідально',
        summary:
          'Якщо у вашому дослідженні брали участь люди, захистіть їхню приватність і поважайте їхню згоду.',
        paragraphs: [
          'Поширюючи дослідження за участю людей, переконайтеся, що воно має необхідне етичне схвалення й поінформовану згоду учасників, а перед публікацією видаліть або знеособте персональні дані.',
        ],
      },
      {
        id: 'privacy',
        title: 'Захищайте приватність',
        summary: 'Не поширюйте чужих особистих даних без дозволу.',
        paragraphs: [
          'Не публікуйте контактні дані, фото, документи чи приватні повідомлення інших людей без їхньої згоди. Діліться лише тим, що готові показати всій спільноті.',
        ],
      },
      {
        id: 'security',
        title: 'Етичний хакінг',
        summary:
          'Кібербезпека — один із наших напрямів досліджень, але ніколи не тестуйте Платформу без дозволу.',
        paragraphs: [
          `Не намагайтеся зламати, просканувати чи обійти захист Платформи або облікових записів інших користувачів. Якщо ви знайшли вразливість, повідомте про неї конфіденційно на ${CONTACT_EMAIL} і дайте нам розумний час на виправлення перед розголошенням. Ми цінуємо відповідальні звіти й обов’язково зазначимо ваш внесок.`,
          'Ніколи не поширюйте шкідливе ПЗ, експлойти проти реальних систем чи інструкції, спрямовані на заподіяння шкоди.',
        ],
      },
      {
        id: 'not-allowed',
        title: 'Що заборонено',
        summary: 'Усе незаконне, ненависницьке, оманливе чи комерційний спам.',
        paragraphs: ['Такий контент буде видалено:'],
        list: [
          'мова ворожнечі, дискримінація, переслідування чи погрози;',
          'відверто сексуальний чи насильницький контент;',
          'плагіат, порушення авторських прав чи фіктивне авторство;',
          'дезінформація та свідомо оманливий контент;',
          'спам, реклама чи небажані комерційні пропозиції;',
          'контент, що прославляє чи виправдовує агресію, воєнні злочини чи тероризм.',
        ],
      },
      {
        id: 'moderation',
        title: 'Скарги та модерація',
        summary:
          'Помітили порушення? Повідомте нас. Ми розглядаємо кожну скаргу й реагуємо справедливо.',
        paragraphs: [
          `Якщо ви бачите контент чи поведінку, що порушують ці правила, надішліть на ${CONTACT_EMAIL} посилання й короткий опис. Модератори розглядають скарги конфіденційно.`,
          'Залежно від серйозності порушення ми можемо попросити відредагувати контент, видалити його, винести попередження, тимчасово обмежити обліковий запис або закрити його в разі серйозних чи повторних порушень. Якщо ви вважаєте рішення помилковим, дайте відповідь на наш лист — і його перегляне інший член команди.',
        ],
      },
    ],
  },
});
