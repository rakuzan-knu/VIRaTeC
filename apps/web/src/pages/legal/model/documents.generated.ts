import type { LegalDocument, LegalDocumentData } from './types';

export const LEGAL_DOCUMENT_DATA: Record<LegalDocument, LegalDocumentData> = {
  terms: {
    version: '1.1',
    updatedAt: '2026-10-26',
    content: {
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
              'You may stop using the Platform at any time and ask us to delete your account by writing to coil.knu@gmail.com.',
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
            summary:
              'If we change something important, we will let you know before it takes effect.',
            paragraphs: [
              'We may update these Terms from time to time. The date of the latest version is shown at the top of this page. For material changes we will notify registered users by email or on the Platform at least 14 days before they take effect. Continuing to use the Platform after that means you accept the updated Terms.',
            ],
          },
          {
            id: 'contact',
            title: 'Contact',
            summary: 'Questions? Write to us — a real person reads every message.',
            paragraphs: [
              'If you have any questions about these Terms, please contact us at coil.knu@gmail.com.',
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
              'Ви можете будь-коли припинити користуватися Платформою та попросити видалити обліковий запис, написавши на coil.knu@gmail.com.',
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
            summary:
              'Створене вами залишається вашим. Ви дозволяєте нам показувати це на Платформі.',
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
            summary:
              'Вхід через Google і зовнішні посилання працюють за правилами їхніх власників.',
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
            summary:
              'Діє право України. Спершу напишіть нам — більшість питань вирішується листом.',
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
            paragraphs: ['З питань щодо цих Умов звертайтеся на coil.knu@gmail.com.'],
          },
        ],
      },
    },
  },
  privacy: {
    version: '1.1',
    updatedAt: '2026-10-26',
    content: {
      en: {
        title: 'Privacy Policy',
        accent: 'Your data, explained plainly.',
        description:
          'We collect only what we need to run an academic community — no ads, no tracking, no selling. Here is exactly what we keep, why, and for how long.',
        sections: [
          {
            id: 'controller',
            title: 'Who is responsible',
            summary:
              'Taras Shevchenko National University of Kyiv is the controller of your personal data.',
            paragraphs: [
              'The controller of personal data processed through the VIRaTeC Platform is Taras Shevchenko National University of Kyiv, 60 Volodymyrska St, Kyiv, 01033, Ukraine, acting through the VIRaTeC initiative (“we”, “us”).',
              'We process personal data in accordance with the Law of Ukraine “On Personal Data Protection” and, where it applies to you, the EU General Data Protection Regulation (GDPR) and the UK GDPR. For any privacy question, write to coil.knu@gmail.com.',
            ],
          },
          {
            id: 'data-we-collect',
            title: 'What we collect',
            summary:
              'Account details you give us, content you publish, and minimal technical data needed to keep you signed in.',
            paragraphs: [
              'We only collect data that you provide to us or that is technically necessary:',
            ],
            table: {
              columns: ['Category', 'Examples', 'Source'],
              rows: [
                [
                  'Account data',
                  'Email address, name, password (stored only as an Argon2 hash), the date and version of the Terms you accepted',
                  'You, at registration',
                ],
                [
                  'Google sign-in data',
                  'Google account ID, verified email, name, profile picture',
                  'Google, when you choose “Continue with Google”',
                ],
                [
                  'Profile data',
                  'Role, faculty, department, bio, skills, photo, study level and year, institution, country, languages, academic profile links (ORCID, Scopus, etc.), collaboration preferences, profile visibility',
                  'You, optionally',
                ],
                ['Saved items', 'Publications and projects you bookmark', 'You'],
                [
                  'Your content',
                  'Research papers, projects, community posts, links you add',
                  'You',
                ],
                [
                  'Session data',
                  'Access and refresh tokens; for each signed-in device — browser and operating system (user agent), IP address, sign-in and last-activity time, shown to you under Security → Active sessions',
                  'Generated by the Platform when you sign in',
                ],
                [
                  'Technical data',
                  'IP address, browser type, request time in server logs',
                  'Your browser, automatically',
                ],
                ['Correspondence', 'Messages you send us by email', 'You'],
              ],
            },
            note: 'We do not ask for and do not want sensitive data (health, religion, political views, etc.). Please do not include it in your profile or posts.',
          },
          {
            id: 'purposes',
            title: 'Why we use it',
            summary:
              'To run your account, show your work to the community, keep the Platform secure and answer your messages.',
            paragraphs: ['Each use of your data has a clear purpose and legal basis:'],
            table: {
              columns: ['Purpose', 'Legal basis'],
              rows: [
                [
                  'Creating and running your account, signing you in',
                  'Performance of our agreement with you (Terms of Service); GDPR Art. 6(1)(b)',
                ],
                [
                  'Keeping a record that you accepted the Terms of Service and this Policy',
                  'Our legal obligation and legitimate interest in proving the agreement; GDPR Art. 6(1)(c) and (f)',
                ],
                [
                  'Publishing your profile, papers and projects to the community',
                  'Performance of our agreement; your choice to publish',
                ],
                [
                  'Keeping the Platform secure, preventing abuse, fixing errors',
                  'Our legitimate interest in a safe service; GDPR Art. 6(1)(f)',
                ],
                [
                  'Replying to your questions and partnership requests',
                  'Our legitimate interest; your request',
                ],
                [
                  'Sending important service notices (e.g. changes to terms)',
                  'Performance of our agreement; legal obligation',
                ],
                [
                  'Anything optional we may add later, such as newsletters',
                  'Your consent, which you can withdraw at any time; GDPR Art. 6(1)(a)',
                ],
              ],
            },
          },
          {
            id: 'what-we-dont-do',
            title: 'What we never do',
            summary: 'No selling, no advertising, no tracking pixels, no profiling.',
            paragraphs: [
              'Because VIRaTeC is a non-commercial academic project, we commit that we:',
            ],
            list: [
              'never sell or rent your personal data;',
              'do not show advertising or use advertising networks;',
              'do not use analytics trackers, tracking pixels or fingerprinting;',
              'do not make decisions about you based solely on automated processing or profiling.',
            ],
          },
          {
            id: 'sharing',
            title: 'Who we share it with',
            summary:
              'Only with services that help us run the Platform, partner universities you work with, or when the law requires.',
            paragraphs: ['We share personal data only when necessary and only with:'],
            list: [
              'Google — to verify your identity if you choose Google sign-in (Google acts as an independent controller under its own privacy policy);',
              'hosting and infrastructure providers that store and process data on our behalf under a data processing agreement: Vercel Inc. (website and API hosting, Frankfurt, Germany region) and Neon Inc. (database hosting, Frankfurt, Germany region);',
              'partner universities and project co-participants — only the profile information and content you make visible within a joint project;',
              'public authorities — only when we are legally required to do so.',
            ],
          },
          {
            id: 'transfers',
            title: 'International transfers',
            summary:
              'Some providers may process data outside Ukraine. We make sure it stays protected.',
            paragraphs: [
              'Our service providers and international partners may be located outside Ukraine, including in the EU, the UK and the USA. Where data is transferred, we rely on adequacy decisions, standard contractual clauses or other safeguards required by applicable law.',
            ],
          },
          {
            id: 'retention',
            title: 'How long we keep it',
            summary: 'Only for as long as it is useful — then we delete or anonymise it.',
            paragraphs: ['We keep data for the following periods:'],
            table: {
              columns: ['Data', 'Retention period'],
              rows: [
                [
                  'Account and profile data',
                  'While your account is active; deleted within 30 days of a deletion request',
                ],
                [
                  'Your content',
                  'While your account is active, or until you delete it; co-authored works may remain with your name removed',
                ],
                [
                  'Refresh tokens and device history (IP address, browser)',
                  'Expire after 7 days or when you sign out; expired records are erased at your next sign-in, and you can erase other devices at any time under Privacy',
                ],
                ['Server logs', 'Up to 90 days'],
                ['Email correspondence', 'Up to 3 years after the conversation ends'],
              ],
            },
          },
          {
            id: 'security',
            title: 'How we protect it',
            summary:
              'Hashed passwords, encrypted connections and access only for people who need it.',
            paragraphs: [
              'We use appropriate technical and organisational measures to protect your data, including encrypted HTTPS connections, password hashing with Argon2, short-lived access tokens and access restricted to authorised team members. No system is perfectly secure, so if you notice a vulnerability, please report it responsibly to coil.knu@gmail.com.',
            ],
          },
          {
            id: 'rights',
            title: 'Your rights',
            summary:
              'You can see, fix, export or delete your data — just ask. We answer within 30 days.',
            paragraphs: ['Depending on the law that applies to you, you have the right to:'],
            list: [
              'know what data we hold about you and get a copy of it;',
              'correct inaccurate or incomplete data;',
              'have your data deleted (“right to be forgotten”);',
              'restrict or object to certain processing;',
              'receive your data in a portable, machine-readable format;',
              'withdraw consent at any time, without affecting earlier processing;',
              'lodge a complaint with a supervisory authority — in Ukraine, the Ukrainian Parliament Commissioner for Human Rights, or the data protection authority in your EU/UK country of residence.',
            ],
            note: 'Most of this you can do yourself in your account: edit your profile, choose its visibility under Privacy, download a full copy of your data as JSON, delete specific data (photo, profile details, saved items, other devices’ sign-in history) or delete the whole account. For anything else, email coil.knu@gmail.com from the address linked to your account. We will respond within 30 days.',
          },
          {
            id: 'children',
            title: 'Children',
            summary: 'The Platform is for people aged 16+, or younger with a guardian’s consent.',
            paragraphs: [
              'We do not knowingly collect personal data from children under 16 without the consent of a parent or legal guardian. If you believe a child has given us data without such consent, contact us and we will delete it.',
            ],
          },
          {
            id: 'changes',
            title: 'Changes to this policy',
            summary: 'If anything important changes, you will hear from us first.',
            paragraphs: [
              'We may update this Privacy Policy as the Platform evolves. The date of the latest version is shown at the top of this page. We will notify registered users of material changes by email or on the Platform before they take effect.',
            ],
          },
        ],
      },
      uk: {
        title: 'Політика конфіденційності',
        accent: 'Про ваші дані — простими словами.',
        description:
          'Ми збираємо лише те, що потрібно для роботи академічної спільноти, — без реклами, стеження й продажу даних. Тут чесно описано, що ми зберігаємо, навіщо і як довго.',
        sections: [
          {
            id: 'controller',
            title: 'Хто відповідає за дані',
            summary:
              'Володільцем ваших персональних даних є Київський національний університет імені Тараса Шевченка.',
            paragraphs: [
              'Володільцем персональних даних, що обробляються через Платформу VIRaTeC, є Київський національний університет імені Тараса Шевченка, вул. Володимирська, 60, Київ, 01033, Україна, в особі ініціативи VIRaTeC («ми», «нас»).',
              'Ми обробляємо персональні дані відповідно до Закону України «Про захист персональних даних», а також — якщо це стосується вас — Загального регламенту ЄС про захист даних (GDPR) та UK GDPR. З будь-яких питань щодо приватності пишіть на coil.knu@gmail.com.',
            ],
          },
          {
            id: 'data-we-collect',
            title: 'Які дані ми збираємо',
            summary:
              'Дані облікового запису, які ви надаєте, ваш контент і мінімум технічних даних, щоб ви залишалися в системі.',
            paragraphs: [
              'Ми збираємо лише ті дані, які ви надаєте самі, або ті, що технічно необхідні:',
            ],
            table: {
              columns: ['Категорія', 'Приклади', 'Джерело'],
              rows: [
                [
                  'Дані облікового запису',
                  'Електронна пошта, ім’я, пароль (зберігається лише як хеш Argon2), дата та версія прийнятих Умов',
                  'Ви, під час реєстрації',
                ],
                [
                  'Дані входу через Google',
                  'Ідентифікатор Google, підтверджена пошта, ім’я, фото профілю',
                  'Google, якщо ви обираєте «Продовжити з Google»',
                ],
                [
                  'Дані профілю',
                  'Роль, факультет, кафедра, біографія, навички, фото, академічний статус і рік навчання, заклад, країна, мови, посилання на академічні профілі (ORCID, Scopus тощо), побажання щодо співпраці, видимість профілю',
                  'Ви, за бажанням',
                ],
                ['Збережене', 'Публікації та проєкти, які ви додаєте в закладки', 'Ви'],
                [
                  'Ваш контент',
                  'Наукові статті, проєкти, дописи у спільноті, додані посилання',
                  'Ви',
                ],
                [
                  'Дані сесії',
                  'Токени доступу та оновлення; для кожного пристрою, на якому ви увійшли, — браузер і операційна система (user agent), IP-адреса, час входу та останньої активності, які ви бачите в розділі «Безпека → Активні сеанси»',
                  'Створюються Платформою під час входу',
                ],
                [
                  'Технічні дані',
                  'IP-адреса, тип браузера, час запиту в серверних журналах',
                  'Ваш браузер, автоматично',
                ],
                ['Листування', 'Повідомлення, які ви надсилаєте нам електронною поштою', 'Ви'],
              ],
            },
            note: 'Ми не запитуємо й не хочемо отримувати чутливі дані (про здоров’я, релігію, політичні погляди тощо). Будь ласка, не вказуйте їх у профілі чи дописах.',
          },
          {
            id: 'purposes',
            title: 'Навіщо ми їх використовуємо',
            summary:
              'Щоб обслуговувати обліковий запис, показувати вашу роботу спільноті, захищати Платформу й відповідати на листи.',
            paragraphs: ['Кожне використання даних має чітку мету й правову підставу:'],
            table: {
              columns: ['Мета', 'Правова підстава'],
              rows: [
                [
                  'Створення й обслуговування облікового запису, вхід',
                  'Виконання угоди з вами (Умови використання); ст. 6(1)(b) GDPR',
                ],
                [
                  'Підтвердження того, що ви прийняли Умови використання та цю Політику',
                  'Наш юридичний обов’язок і законний інтерес у підтвердженні угоди; ст. 6(1)(c) і (f) GDPR',
                ],
                [
                  'Публікація профілю, статей і проєктів у спільноті',
                  'Виконання угоди; ваше рішення опублікувати',
                ],
                [
                  'Безпека Платформи, запобігання зловживанням, виправлення помилок',
                  'Наш законний інтерес у безпечному сервісі; ст. 6(1)(f) GDPR',
                ],
                [
                  'Відповіді на запитання та запити щодо партнерства',
                  'Наш законний інтерес; ваш запит',
                ],
                [
                  'Важливі сервісні повідомлення (наприклад, про зміни умов)',
                  'Виконання угоди; вимоги закону',
                ],
                [
                  'Необов’язкові функції, які можуть з’явитися, як-от розсилка',
                  'Ваша згода, яку можна будь-коли відкликати; ст. 6(1)(a) GDPR',
                ],
              ],
            },
          },
          {
            id: 'what-we-dont-do',
            title: 'Чого ми ніколи не робимо',
            summary: 'Жодного продажу даних, реклами, трекінгових пікселів чи профілювання.',
            paragraphs: ['Оскільки VIRaTeC — некомерційний академічний проєкт, ми зобов’язуємося:'],
            list: [
              'ніколи не продавати й не передавати в оренду ваші персональні дані;',
              'не показувати рекламу й не використовувати рекламні мережі;',
              'не використовувати аналітичні трекери, трекінгові пікселі чи фінгерпринтинг;',
              'не ухвалювати щодо вас рішень виключно на основі автоматизованої обробки чи профілювання.',
            ],
          },
          {
            id: 'sharing',
            title: 'Кому ми передаємо дані',
            summary:
              'Лише сервісам, які допомагають працювати Платформі, університетам-партнерам у ваших проєктах або коли цього вимагає закон.',
            paragraphs: ['Ми передаємо персональні дані лише за потреби й лише таким отримувачам:'],
            list: [
              'Google — для перевірки особи, якщо ви обираєте вхід через Google (Google діє як самостійний володілець даних згідно з власною політикою конфіденційності);',
              'постачальникам хостингу та інфраструктури, які зберігають і обробляють дані від нашого імені на підставі договору про обробку даних: Vercel Inc. (хостинг сайту та API, регіон Франкфурт, Німеччина) і Neon Inc. (хостинг бази даних, регіон Франкфурт, Німеччина);',
              'університетам-партнерам і учасникам спільних проєктів — лише ту інформацію профілю та контент, які ви робите видимими в межах проєкту;',
              'державним органам — лише у випадках, передбачених законом.',
            ],
          },
          {
            id: 'transfers',
            title: 'Міжнародна передача даних',
            summary:
              'Деякі постачальники можуть обробляти дані за межами України. Ми дбаємо, щоб вони залишалися захищеними.',
            paragraphs: [
              'Наші постачальники послуг і міжнародні партнери можуть перебувати за межами України, зокрема в ЄС, Великій Британії та США. У разі передачі даних ми спираємося на рішення про адекватність захисту, стандартні договірні положення чи інші гарантії, передбачені законодавством.',
            ],
          },
          {
            id: 'retention',
            title: 'Скільки ми зберігаємо дані',
            summary: 'Лише доки вони потрібні — потім ми їх видаляємо або знеособлюємо.',
            paragraphs: ['Ми зберігаємо дані протягом таких строків:'],
            table: {
              columns: ['Дані', 'Строк зберігання'],
              rows: [
                [
                  'Дані облікового запису та профілю',
                  'Доки обліковий запис активний; видаляються протягом 30 днів після запиту',
                ],
                [
                  'Ваш контент',
                  'Доки обліковий запис активний або доки ви його не видалите; спільні роботи можуть залишитися без вашого імені',
                ],
                [
                  'Токени оновлення та історія пристроїв (IP-адреса, браузер)',
                  'Спливають через 7 днів або після виходу; прострочені записи стираються під час наступного входу, а дані інших пристроїв можна стерти будь-коли в розділі «Приватність»',
                ],
                ['Серверні журнали', 'До 90 днів'],
                ['Листування', 'До 3 років після завершення спілкування'],
              ],
            },
          },
          {
            id: 'security',
            title: 'Як ми захищаємо дані',
            summary:
              'Хешовані паролі, шифровані з’єднання й доступ лише для тих, кому він справді потрібен.',
            paragraphs: [
              'Ми застосовуємо належні технічні та організаційні заходи захисту, зокрема шифроване з’єднання HTTPS, хешування паролів за допомогою Argon2, короткочасні токени доступу та обмежений доступ уповноважених членів команди. Жодна система не є абсолютно захищеною, тож якщо ви помітили вразливість, будь ласка, відповідально повідомте про неї на coil.knu@gmail.com.',
            ],
          },
          {
            id: 'rights',
            title: 'Ваші права',
            summary:
              'Ви можете переглянути, виправити, експортувати чи видалити свої дані — просто напишіть. Відповідаємо протягом 30 днів.',
            paragraphs: ['Залежно від застосовного права ви маєте право:'],
            list: [
              'знати, які дані про вас ми зберігаємо, та отримати їхню копію;',
              'виправити неточні чи неповні дані;',
              'вимагати видалення даних («право на забуття»);',
              'обмежити певну обробку або заперечити проти неї;',
              'отримати свої дані в портативному машинозчитуваному форматі;',
              'будь-коли відкликати згоду — це не впливає на законність попередньої обробки;',
              'подати скаргу до наглядового органу — в Україні це Уповноважений Верховної Ради України з прав людини, або орган захисту даних у вашій країні ЄС чи Великій Британії.',
            ],
            note: 'Більшість цього можна зробити самостійно в обліковому записі: змінити профіль, обрати його видимість у розділі «Приватність», завантажити повну копію своїх даних у форматі JSON, видалити окремі дані (фото, дані профілю, збережене, історію входів з інших пристроїв) або видалити весь обліковий запис. В інших випадках напишіть на coil.knu@gmail.com з адреси, прив’язаної до облікового запису. Ми відповімо протягом 30 днів.',
          },
          {
            id: 'children',
            title: 'Діти',
            summary:
              'Платформа призначена для осіб від 16 років або молодших за згоди батьків чи опікунів.',
            paragraphs: [
              'Ми свідомо не збираємо персональні дані дітей до 16 років без згоди одного з батьків чи законного представника. Якщо ви вважаєте, що дитина надала нам дані без такої згоди, зв’яжіться з нами — і ми їх видалимо.',
            ],
          },
          {
            id: 'changes',
            title: 'Зміни до політики',
            summary: 'Про важливі зміни ви дізнаєтеся від нас першими.',
            paragraphs: [
              'Ми можемо оновлювати цю Політику конфіденційності в міру розвитку Платформи. Дата останньої редакції вказана вгорі сторінки. Про суттєві зміни ми повідомимо зареєстрованих користувачів електронною поштою або на Платформі до набрання ними чинності.',
            ],
          },
        ],
      },
    },
  },
  cookies: {
    version: '1.1',
    updatedAt: '2026-10-26',
    content: {
      en: {
        title: 'Cookie Policy',
        accent: 'Only the cookies that keep you signed in.',
        description:
          'VIRaTeC does not track you. We use a few strictly necessary cookies to keep your sign-in secure, and a few small notes in your browser for your language and accounts.',
        sections: [
          {
            id: 'short-answer',
            title: 'The short answer',
            summary:
              'Only strictly necessary sign-in and security cookies. No analytics, no ads, no tracking — that is why you never see a cookie banner here.',
            paragraphs: [
              'Cookies are small text files that websites store in your browser. Many sites use them to track visitors across the web. We do not.',
              'The VIRaTeC Platform sets only first-party cookies that are strictly necessary to sign you in and protect your account. They cannot be read by JavaScript, are sent only to VIRaTeC over HTTPS and are never used for analytics, advertising or tracking. Strictly necessary cookies do not require consent, so no banner is shown.',
            ],
            table: {
              columns: ['Cookie', 'Purpose', 'Type', 'Kept until'],
              rows: [
                [
                  'vt_at (__Host-vt_at)',
                  'Short-lived proof that you are signed in',
                  'Authentication, strictly necessary',
                  '15 minutes or until you sign out',
                ],
                [
                  'vt_rt (__Secure-vt_rt)',
                  'Renews your sign-in without asking for the password again',
                  'Authentication, strictly necessary',
                  '7 days or until you sign out',
                ],
                [
                  'vt_csrf (__Host-vt_csrf)',
                  'Protects your account from forged requests sent by other websites',
                  'Security, strictly necessary',
                  'You close the browser',
                ],
                [
                  'vt_mfa (__Secure-vt_mfa)',
                  'Links the two steps of sign-in when two-step verification is on',
                  'Security, strictly necessary',
                  '5 minutes',
                ],
              ],
            },
          },
          {
            id: 'local-storage',
            title: 'What we store in your browser',
            summary:
              'Three entries in your browser’s local storage and one in session storage. They never leave your device.',
            paragraphs: [
              'We use your browser’s local and session storage — similar technologies that stay on your device and are not sent with every request. Here is the full list:',
            ],
            table: {
              columns: ['Key', 'Purpose', 'Type', 'Kept until'],
              rows: [
                [
                  'viratec_locale',
                  'Remembers whether you chose English or Ukrainian',
                  'Preference, strictly necessary',
                  'You change the language or clear site data',
                ],
                [
                  'viratec_session',
                  'A yes/no note that you are signed in, so the site knows to restore your session (not a password or token)',
                  'Authentication, strictly necessary',
                  'You sign out or clear site data',
                ],
                [
                  'viratec_known_accounts',
                  'Names and emails of accounts used on this device, for quick account switching (no passwords)',
                  'Preference, functional',
                  'You remove the account from the list or clear site data',
                ],
                [
                  'viratec_stale_chunk_reload (session storage)',
                  'The time of the last automatic reload after a site update, so the page never reloads in a loop',
                  'Technical, strictly necessary',
                  'You close the tab',
                ],
              ],
            },
          },
          {
            id: 'third-party',
            title: 'Third-party cookies',
            summary: 'Only Google, and only if you click “Continue with Google”.',
            paragraphs: [
              'If you choose to sign in with Google, the Google Identity Services script is loaded from accounts.google.com. Google may then set its own cookies to authenticate you and protect against fraud. These cookies are controlled by Google and described in Google’s privacy and cookie policies.',
              'If you register or sign in with email and password, no third-party cookies are involved.',
            ],
          },
          {
            id: 'external-links',
            title: 'External links',
            summary: 'Sites we link to, like LinkedIn or ORCID, have their own cookie rules.',
            paragraphs: [
              'Our pages link to external websites such as LinkedIn, Facebook, ORCID, Google Scholar and partner universities. Once you follow a link, that website’s own cookie policy applies.',
            ],
          },
          {
            id: 'control',
            title: 'Your control',
            summary: 'Clear everything with one click below, or through your browser settings.',
            paragraphs: [
              'You can remove the data we store at any time using the button on this page, or by clearing site data for this website in your browser settings. Clearing it will sign you out and reset your language preference — nothing else will break.',
              'You can also block third-party cookies in your browser; in that case Google sign-in may not work, but email sign-in will.',
            ],
          },
          {
            id: 'changes',
            title: 'If this ever changes',
            summary: 'Before we add any non-essential cookie, we will ask you first.',
            paragraphs: [
              'If we ever introduce analytics or other non-essential cookies, we will update this policy and ask for your consent before setting them. Questions? Write to coil.knu@gmail.com.',
            ],
          },
        ],
      },
      uk: {
        title: 'Політика щодо cookie',
        accent: 'Лише cookie, що зберігають ваш вхід.',
        description:
          'VIRaTeC не стежить за вами. Ми використовуємо кілька суворо необхідних cookie, щоб ваш вхід був захищеним, і кілька невеликих нотаток у браузері для мови та облікових записів.',
        sections: [
          {
            id: 'short-answer',
            title: 'Коротка відповідь',
            summary:
              'Лише суворо необхідні cookie для входу та безпеки. Жодної аналітики, реклами чи стеження — тому ви й не бачите тут банера cookie.',
            paragraphs: [
              'Cookie — це невеликі текстові файли, які сайти зберігають у вашому браузері. Багато сайтів використовують їх, щоб відстежувати відвідувачів в інтернеті. Ми — ні.',
              'Платформа VIRaTeC встановлює лише власні cookie, суворо необхідні для входу та захисту облікового запису. JavaScript не може їх прочитати, вони надсилаються лише до VIRaTeC через HTTPS і ніколи не використовуються для аналітики, реклами чи стеження. Суворо необхідні cookie не потребують згоди, тому банер не показується.',
            ],
            table: {
              columns: ['Cookie', 'Призначення', 'Тип', 'Зберігається до'],
              rows: [
                [
                  'vt_at (__Host-vt_at)',
                  'Короткочасне підтвердження того, що ви увійшли',
                  'Автентифікація, суворо необхідне',
                  '15 хвилин або до виходу',
                ],
                [
                  'vt_rt (__Secure-vt_rt)',
                  'Оновлює вхід, не запитуючи пароль повторно',
                  'Автентифікація, суворо необхідне',
                  '7 днів або до виходу',
                ],
                [
                  'vt_csrf (__Host-vt_csrf)',
                  'Захищає обліковий запис від підроблених запитів з інших сайтів',
                  'Безпека, суворо необхідне',
                  'Закриття браузера',
                ],
                [
                  'vt_mfa (__Secure-vt_mfa)',
                  'Пов’язує два кроки входу, коли ввімкнено двоетапну перевірку',
                  'Безпека, суворо необхідне',
                  '5 хвилин',
                ],
              ],
            },
          },
          {
            id: 'local-storage',
            title: 'Що ми зберігаємо в браузері',
            summary:
              'Три записи в локальному сховищі браузера й один у сховищі сеансу. Вони не залишають ваш пристрій.',
            paragraphs: [
              'Ми використовуємо локальне сховище (local storage) і сховище сеансу (session storage) браузера — схожі технології, дані яких залишаються на вашому пристрої та не надсилаються з кожним запитом. Ось повний перелік:',
            ],
            table: {
              columns: ['Ключ', 'Призначення', 'Тип', 'Зберігається до'],
              rows: [
                [
                  'viratec_locale',
                  'Запам’ятовує, яку мову ви обрали — англійську чи українську',
                  'Налаштування, суворо необхідне',
                  'Зміни мови або очищення даних сайту',
                ],
                [
                  'viratec_session',
                  'Позначка «так/ні» про те, що ви увійшли, щоб сайт відновив сеанс (не пароль і не токен)',
                  'Автентифікація, суворо необхідне',
                  'Виходу з облікового запису або очищення даних сайту',
                ],
                [
                  'viratec_known_accounts',
                  'Імена та адреси облікових записів, використаних на цьому пристрої, для швидкого перемикання (без паролів)',
                  'Налаштування, функціональне',
                  'Видалення запису зі списку або очищення даних сайту',
                ],
                [
                  'viratec_stale_chunk_reload (session storage)',
                  'Час останнього автоматичного перезавантаження після оновлення сайту, щоб сторінка не перезавантажувалася по колу',
                  'Технічне, суворо необхідне',
                  'Закриття вкладки',
                ],
              ],
            },
          },
          {
            id: 'third-party',
            title: 'Сторонні cookie',
            summary: 'Лише Google — і лише якщо ви натиснете «Продовжити з Google».',
            paragraphs: [
              'Якщо ви обираєте вхід через Google, з accounts.google.com завантажується скрипт Google Identity Services. Google може встановити власні cookie для автентифікації та захисту від шахрайства. Ці cookie контролює Google, їх описано в політиках конфіденційності та cookie Google.',
              'Якщо ви реєструєтеся чи входите за допомогою пошти й пароля, сторонні cookie не використовуються.',
            ],
          },
          {
            id: 'external-links',
            title: 'Зовнішні посилання',
            summary:
              'Сайти, на які ми посилаємося, як-от LinkedIn чи ORCID, мають власні правила щодо cookie.',
            paragraphs: [
              'Наші сторінки містять посилання на зовнішні сайти — LinkedIn, Facebook, ORCID, Google Scholar, сайти університетів-партнерів. Щойно ви переходите за посиланням, діє політика cookie відповідного сайту.',
            ],
          },
          {
            id: 'control',
            title: 'Ваш контроль',
            summary: 'Очистіть усе однією кнопкою нижче або в налаштуваннях браузера.',
            paragraphs: [
              'Ви можете будь-коли видалити збережені нами дані кнопкою на цій сторінці або очистивши дані цього сайту в налаштуваннях браузера. Після цього ви вийдете з облікового запису, а мова повернеться до типової — більше нічого не зламається.',
              'Ви також можете заблокувати сторонні cookie в браузері; тоді вхід через Google може не працювати, але вхід через пошту працюватиме.',
            ],
          },
          {
            id: 'changes',
            title: 'Якщо щось зміниться',
            summary: 'Перш ніж додати будь-які необов’язкові cookie, ми спершу запитаємо вас.',
            paragraphs: [
              'Якщо ми колись запровадимо аналітику чи інші необов’язкові cookie, ми оновимо цю політику та попросимо вашої згоди до їх встановлення. Маєте питання? Пишіть на coil.knu@gmail.com.',
            ],
          },
        ],
      },
    },
  },
  guidelines: {
    version: '1.1',
    updatedAt: '2026-10-26',
    content: {
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
            summary:
              'Cite your sources, credit your co-authors, and be open about how you used AI.',
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
              'Do not attempt to break, scan or bypass the security of the Platform or other users’ accounts. If you discover a vulnerability, report it privately to coil.knu@gmail.com and give us reasonable time to fix it before disclosing it. We appreciate and will credit responsible reports.',
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
              'If you see content or behaviour that breaks these guidelines, report it to coil.knu@gmail.com with a link and a short description. Moderators review reports confidentially.',
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
            summary:
              'Припускайте добрі наміри, залишайтеся допитливими й дайте місце кожному голосу.',
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
              'Не намагайтеся зламати, просканувати чи обійти захист Платформи або облікових записів інших користувачів. Якщо ви знайшли вразливість, повідомте про неї конфіденційно на coil.knu@gmail.com і дайте нам розумний час на виправлення перед розголошенням. Ми цінуємо відповідальні звіти й обов’язково зазначимо ваш внесок.',
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
              'Якщо ви бачите контент чи поведінку, що порушують ці правила, надішліть на coil.knu@gmail.com посилання й короткий опис. Модератори розглядають скарги конфіденційно.',
              'Залежно від серйозності порушення ми можемо попросити відредагувати контент, видалити його, винести попередження, тимчасово обмежити обліковий запис або закрити його в разі серйозних чи повторних порушень. Якщо ви вважаєте рішення помилковим, дайте відповідь на наш лист — і його перегляне інший член команди.',
            ],
          },
        ],
      },
    },
  },
};
