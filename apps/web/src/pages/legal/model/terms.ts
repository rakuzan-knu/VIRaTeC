import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { defineMessages } from '@/shared/i18n';
import type { LegalDocumentContent } from './types';

export const TERMS_CONTENT = defineMessages<LegalDocumentContent>({
  en: {
    title: 'Terms of Service',
    accent: 'The rules of the room.',
    description:
      'VIRaTeC is a shared space for students, researchers and partner universities. These terms explain what you can expect from us and what we expect from you.',
    sections: [
      {
        id: 'agreement',
        title: 'About these terms',
        summary:
          'Using VIRaTeC means you accept these terms. If you disagree, please do not use it.',
        paragraphs: [
          'These Terms of Service (the “Terms”) govern your access to and use of the VIRaTeC website, platform and related services (together, the “Platform”).',
          'By opening the Platform, creating an account or signing in with Google, you confirm that you have read and accept these Terms, our Privacy Policy, our Cookie Policy and our Community Guidelines. If you do not agree, please do not use the Platform.',
        ],
      },
      {
        id: 'who-we-are',
        title: 'Who we are',
        summary:
          'A non-commercial academic initiative of Taras Shevchenko National University of Kyiv.',
        paragraphs: [
          'VIRaTeC (Virtual Innovative Research & Technology Community) is an international educational and research initiative based at the Faculty of Information Technology and the Educational and Scientific Institute of Philology of Taras Shevchenko National University of Kyiv, 60 Volodymyrska St, Kyiv, 01033, Ukraine (“we”, “us”, “VIRaTeC”).',
          'The Platform is provided free of charge for educational, research and collaboration purposes.',
        ],
      },
      {
        id: 'eligibility',
        title: 'Who can use the Platform',
        summary:
          'Anyone can browse. To create an account you must be 16+ or have a guardian’s consent.',
        paragraphs: [
          'Public pages are open to everyone. To register an account you must be at least 16 years old, or have the consent of a parent or legal guardian, and be able to enter into a binding agreement under the law that applies to you.',
          'Some features, such as joining projects or publishing research, may be limited to students, staff and invited partners of participating universities.',
        ],
      },
      {
        id: 'account',
        title: 'Your account',
        summary:
          'Keep your details accurate and your password secret. You are responsible for what happens in your account.',
        paragraphs: [
          'You can register with an email address and password or with your Google account. You agree to provide accurate information and keep it up to date.',
          'You are responsible for keeping your credentials confidential and for all activity under your account. If you suspect unauthorised access, change your password and contact us immediately.',
          `You may stop using the Platform at any time and ask us to delete your account by writing to ${CONTACT_EMAIL}.`,
        ],
      },
      {
        id: 'acceptable-use',
        title: 'Acceptable use',
        summary:
          'Be respectful, be honest, and do not break things — the Community Guidelines spell it out.',
        paragraphs: [
          'You agree to use the Platform lawfully and in line with our Community Guidelines. In particular, you must not:',
        ],
        list: [
          'post content that is unlawful, hateful, harassing, discriminatory or that violates anyone’s privacy;',
          'submit plagiarised work or misrepresent authorship, data or research results;',
          'upload malware, or attempt to probe, scan, overload or gain unauthorised access to the Platform or other users’ accounts;',
          'scrape or bulk-collect data, including personal data of other users;',
          'use the Platform for advertising, spam or commercial activity without our written permission;',
          'impersonate any person or institution.',
        ],
      },
      {
        id: 'your-content',
        title: 'Your content',
        summary:
          'What you create stays yours. You let us display it on the Platform so others can see it.',
        paragraphs: [
          'You keep all rights to the papers, projects, posts, profile information and other material you submit (“Your Content”).',
          'By submitting Your Content you grant VIRaTeC a non-exclusive, royalty-free, worldwide licence to host, store, reproduce, display and distribute it on the Platform and in related academic communications (for example, a project showcase or a newsletter), only for as long as it remains on the Platform and only for non-commercial educational and research purposes.',
          'You confirm that you have the right to share Your Content, that co-authors agree to its publication, and that it does not infringe anyone else’s rights.',
        ],
      },
      {
        id: 'our-content',
        title: 'Our content',
        summary:
          'Texts, design and branding belong to VIRaTeC and its authors. Quote freely with attribution, non-commercially.',
        paragraphs: [
          'The VIRaTeC name, logo, design, texts, photos and other materials created by us are protected by intellectual property laws and belong to VIRaTeC, the University or the respective authors.',
          'You may quote and share our materials for non-commercial educational and research purposes, provided you give clear attribution and a link to the source. Any other use requires our prior written permission.',
        ],
      },
      {
        id: 'third-parties',
        title: 'Third-party services and links',
        summary: 'Google sign-in and external links are run by others under their own rules.',
        paragraphs: [
          'The Platform may let you sign in with Google and may link to external websites such as LinkedIn, ORCID, Google Scholar or partner university pages. These services are operated by third parties under their own terms and privacy policies, and we are not responsible for them.',
        ],
      },
      {
        id: 'availability',
        title: 'Availability and changes',
        summary:
          'This is an academic project. We do our best, but cannot promise it will always be online.',
        paragraphs: [
          'We work to keep the Platform available and secure, but we provide it on an “as is” and “as available” basis. We may change, suspend or discontinue features at any time, for example for maintenance, security or as the initiative evolves.',
        ],
      },
      {
        id: 'termination',
        title: 'Suspension and termination',
        summary:
          'Serious or repeated rule-breaking can lead to content removal or account suspension.',
        paragraphs: [
          'We may remove content or suspend or close an account that violates these Terms or the Community Guidelines, endangers other users or the Platform, or where we are required to do so by law. Where reasonable, we will tell you why and give you an opportunity to respond.',
        ],
      },
      {
        id: 'liability',
        title: 'Disclaimers and liability',
        summary:
          'We are not liable for indirect losses or for content posted by others — within what the law allows.',
        paragraphs: [
          'Content on the Platform, including research materials posted by users, is provided for information and educational purposes and does not constitute professional advice.',
          'To the maximum extent permitted by law, VIRaTeC and the University are not liable for any indirect or consequential damage, loss of data or loss of opportunity arising from use of the Platform, or for content created by other users. Nothing in these Terms limits any liability that cannot be limited under applicable law.',
        ],
      },
      {
        id: 'law',
        title: 'Governing law',
        summary: 'Ukrainian law applies. Let’s talk first — most issues are solved by email.',
        paragraphs: [
          'These Terms are governed by the laws of Ukraine. Before going to court, we ask you to contact us so we can try to resolve the issue amicably. Disputes that cannot be resolved this way will be heard by the competent courts of Kyiv, Ukraine, without prejudice to any mandatory consumer protection rights you have in your country of residence.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        summary: 'If we change something important, we will let you know before it takes effect.',
        paragraphs: [
          'We may update these Terms from time to time. The date of the latest version is shown at the top of this page. For material changes we will notify registered users by email or on the Platform at least 14 days before they take effect. Continuing to use the Platform after that means you accept the updated Terms.',
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        summary: 'Questions? Write to us — a real person reads every message.',
        paragraphs: [
          `If you have any questions about these Terms, please contact us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  uk: {
    title: 'Умови використання',
    accent: 'Правила спільного простору.',
    description:
      'VIRaTeC — спільний простір для студентів, дослідників та університетів-партнерів. Ці умови пояснюють, чого ви можете очікувати від нас і чого ми очікуємо від вас.',
    sections: [
      {
        id: 'agreement',
        title: 'Про ці умови',
        summary:
          'Користуючись VIRaTeC, ви приймаєте ці умови. Якщо не погоджуєтеся — будь ласка, не користуйтеся платформою.',
        paragraphs: [
          'Ці Умови використання («Умови») регулюють доступ до вебсайту, платформи та пов’язаних сервісів VIRaTeC (разом — «Платформа») і їх використання.',
          'Відкриваючи Платформу, створюючи обліковий запис або входячи через Google, ви підтверджуєте, що ознайомилися та погоджуєтеся з цими Умовами, Політикою конфіденційності, Політикою щодо cookie та Правилами спільноти. Якщо ви не погоджуєтеся, будь ласка, не користуйтеся Платформою.',
        ],
      },
      {
        id: 'who-we-are',
        title: 'Хто ми',
        summary:
          'Некомерційна академічна ініціатива Київського національного університету імені Тараса Шевченка.',
        paragraphs: [
          'VIRaTeC (Virtual Innovative Research & Technology Community) — міжнародна освітня та дослідницька ініціатива, що діє на базі Факультету інформаційних технологій та Навчально-наукового інституту філології Київського національного університету імені Тараса Шевченка, вул. Володимирська, 60, Київ, 01033, Україна («ми», «нас», «VIRaTeC»).',
          'Платформа надається безоплатно для освітніх, наукових цілей і співпраці.',
        ],
      },
      {
        id: 'eligibility',
        title: 'Хто може користуватися Платформою',
        summary:
          'Переглядати може кожен. Для реєстрації потрібно мати 16+ або згоду батьків чи опікунів.',
        paragraphs: [
          'Публічні сторінки відкриті для всіх. Щоб зареєструвати обліковий запис, вам має бути щонайменше 16 років або ви повинні мати згоду одного з батьків чи законного представника, а також бути здатними укладати обов’язкові угоди відповідно до права, що до вас застосовується.',
          'Деякі функції, як-от участь у проєктах чи публікація досліджень, можуть бути доступні лише студентам, працівникам і запрошеним партнерам університетів-учасників.',
        ],
      },
      {
        id: 'account',
        title: 'Ваш обліковий запис',
        summary:
          'Вказуйте правдиві дані й нікому не повідомляйте пароль. Ви відповідаєте за дії у своєму обліковому записі.',
        paragraphs: [
          'Зареєструватися можна за допомогою електронної пошти й пароля або облікового запису Google. Ви погоджуєтеся надавати достовірну інформацію та оновлювати її.',
          'Ви відповідаєте за конфіденційність своїх облікових даних і за всі дії у вашому обліковому записі. Якщо підозрюєте несанкціонований доступ, змініть пароль і негайно зв’яжіться з нами.',
          `Ви можете будь-коли припинити користуватися Платформою та попросити видалити обліковий запис, написавши на ${CONTACT_EMAIL}.`,
        ],
      },
      {
        id: 'acceptable-use',
        title: 'Допустиме використання',
        summary:
          'Поважайте інших, будьте чесними й нічого не ламайте — докладніше в Правилах спільноти.',
        paragraphs: [
          'Ви погоджуєтеся користуватися Платформою законно та відповідно до Правил спільноти. Зокрема, заборонено:',
        ],
        list: [
          'публікувати незаконний, образливий, дискримінаційний контент, контент, що містить мову ворожнечі, переслідування або порушує чиюсь приватність;',
          'подавати плагіат або неправдиво вказувати авторство, дані чи результати досліджень;',
          'завантажувати шкідливе програмне забезпечення, намагатися сканувати, перевантажувати Платформу або отримати несанкціонований доступ до неї чи облікових записів інших користувачів;',
          'автоматично збирати дані, зокрема персональні дані інших користувачів;',
          'використовувати Платформу для реклами, спаму чи комерційної діяльності без нашого письмового дозволу;',
          'видавати себе за іншу особу чи установу.',
        ],
      },
      {
        id: 'your-content',
        title: 'Ваш контент',
        summary: 'Створене вами залишається вашим. Ви дозволяєте нам показувати це на Платформі.',
        paragraphs: [
          'Вам належать усі права на статті, проєкти, дописи, інформацію профілю та інші матеріали, які ви подаєте («Ваш контент»).',
          'Подаючи Ваш контент, ви надаєте VIRaTeC невиключну, безоплатну, всесвітню ліцензію на його розміщення, зберігання, відтворення, показ і поширення на Платформі та в пов’язаних академічних комунікаціях (наприклад, у вітрині проєктів чи розсилці) — лише доки він залишається на Платформі та лише для некомерційних освітніх і наукових цілей.',
          'Ви підтверджуєте, що маєте право поширювати Ваш контент, що співавтори погоджуються на його публікацію і що він не порушує чужих прав.',
        ],
      },
      {
        id: 'our-content',
        title: 'Наш контент',
        summary:
          'Тексти, дизайн і бренд належать VIRaTeC та авторам. Цитуйте з посиланням, некомерційно.',
        paragraphs: [
          'Назва та логотип VIRaTeC, дизайн, тексти, фото й інші створені нами матеріали охороняються законодавством про інтелектуальну власність і належать VIRaTeC, Університету або відповідним авторам.',
          'Ви можете цитувати й поширювати наші матеріали для некомерційних освітніх і наукових цілей за умови чіткого зазначення авторства та посилання на джерело. Будь-яке інше використання потребує нашого попереднього письмового дозволу.',
        ],
      },
      {
        id: 'third-parties',
        title: 'Сторонні сервіси та посилання',
        summary: 'Вхід через Google і зовнішні посилання працюють за правилами їхніх власників.',
        paragraphs: [
          'Платформа може дозволяти вхід через Google і містити посилання на зовнішні сайти, як-от LinkedIn, ORCID, Google Scholar чи сторінки університетів-партнерів. Ці сервіси працюють за власними умовами та політиками конфіденційності, і ми за них не відповідаємо.',
        ],
      },
      {
        id: 'availability',
        title: 'Доступність і зміни',
        summary:
          'Це академічний проєкт. Ми стараємося, але не можемо гарантувати безперервну роботу.',
        paragraphs: [
          'Ми дбаємо про доступність і безпеку Платформи, проте надаємо її «як є» та «в міру доступності». Ми можемо змінювати, призупиняти чи припиняти роботу функцій у будь-який час — наприклад, для технічного обслуговування, з міркувань безпеки або в міру розвитку ініціативи.',
        ],
      },
      {
        id: 'termination',
        title: 'Призупинення та припинення доступу',
        summary:
          'Серйозні чи повторні порушення можуть призвести до видалення контенту або блокування облікового запису.',
        paragraphs: [
          'Ми можемо видалити контент, призупинити чи закрити обліковий запис, якщо він порушує ці Умови або Правила спільноти, становить загрозу для інших користувачів чи Платформи, або якщо цього вимагає закон. За можливості ми пояснимо причину й дамо змогу відповісти.',
        ],
      },
      {
        id: 'liability',
        title: 'Застереження та відповідальність',
        summary:
          'Ми не відповідаємо за непрямі збитки чи контент інших користувачів — у межах, дозволених законом.',
        paragraphs: [
          'Контент на Платформі, зокрема дослідницькі матеріали користувачів, надається з інформаційною та освітньою метою і не є професійною консультацією.',
          'У максимально дозволених законом межах VIRaTeC та Університет не несуть відповідальності за будь-які непрямі збитки, втрату даних чи можливостей, пов’язані з використанням Платформи, а також за контент, створений іншими користувачами. Ніщо в цих Умовах не обмежує відповідальності, яку не можна обмежити згідно із законом.',
        ],
      },
      {
        id: 'law',
        title: 'Застосовне право',
        summary: 'Діє право України. Спершу напишіть нам — більшість питань вирішується листом.',
        paragraphs: [
          'Ці Умови регулюються законодавством України. Перш ніж звертатися до суду, просимо зв’язатися з нами, щоб спробувати врегулювати питання мирно. Спори, які не вдалося так вирішити, розглядаються компетентними судами міста Києва, Україна, без обмеження обов’язкових прав споживачів, які ви маєте у країні проживання.',
        ],
      },
      {
        id: 'changes',
        title: 'Зміни до умов',
        summary: 'Про важливі зміни ми повідомимо заздалегідь.',
        paragraphs: [
          'Ми можемо час від часу оновлювати ці Умови. Дата останньої редакції вказана вгорі сторінки. Про суттєві зміни ми повідомимо зареєстрованих користувачів електронною поштою або на Платформі щонайменше за 14 днів до набрання ними чинності. Подальше використання Платформи означає згоду з оновленими Умовами.',
        ],
      },
      {
        id: 'contact',
        title: 'Контакти',
        summary: 'Маєте питання? Напишіть нам — кожен лист читає жива людина.',
        paragraphs: [`З питань щодо цих Умов звертайтеся на ${CONTACT_EMAIL}.`],
      },
    ],
  },
});
