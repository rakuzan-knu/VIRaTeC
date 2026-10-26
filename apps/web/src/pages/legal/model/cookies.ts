import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { defineMessages } from '@/shared/i18n';
import type { LegalDocumentContent } from './types';

export const COOKIES_CONTENT = defineMessages<LegalDocumentContent>({
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
          `If we ever introduce analytics or other non-essential cookies, we will update this policy and ask for your consent before setting them. Questions? Write to ${CONTACT_EMAIL}.`,
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
          `Якщо ми колись запровадимо аналітику чи інші необов’язкові cookie, ми оновимо цю політику та попросимо вашої згоди до їх встановлення. Маєте питання? Пишіть на ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
});
