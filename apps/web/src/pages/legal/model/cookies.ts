import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { defineMessages } from '@/shared/i18n';
import type { LegalDocumentContent } from './types';

export const COOKIES_CONTENT = defineMessages<LegalDocumentContent>({
  en: {
    title: 'Cookie Policy',
    accent: 'Spoiler: no cookies here.',
    description:
      'VIRaTeC does not set its own cookies and does not track you. We keep just two small notes in your browser so the site remembers your language and your sign-in.',
    sections: [
      {
        id: 'short-answer',
        title: 'The short answer',
        summary:
          'No first-party cookies, no analytics, no ads. That is why you never see a cookie banner here.',
        paragraphs: [
          'Cookies are small text files that websites store in your browser. Many sites use them to track visitors across the web. We do not.',
          'The VIRaTeC Platform does not set any first-party cookies and does not use analytics, advertising or social media tracking cookies. Because we only use storage that is strictly necessary for features you request, no consent banner is required.',
        ],
      },
      {
        id: 'local-storage',
        title: 'What we store instead',
        summary:
          'Two entries in your browser’s local storage. They never leave your device except to sign you in.',
        paragraphs: [
          'We use your browser’s local storage — a similar technology that stays on your device and is not sent with every request. Here is the full list:',
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
              'viratec_token',
              'Keeps you signed in after you log in',
              'Authentication, strictly necessary',
              'You sign out or clear site data',
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
    accent: 'Спойлер: cookie тут немає.',
    description:
      'VIRaTeC не встановлює власних cookie та не стежить за вами. Ми зберігаємо у вашому браузері лише дві невеликі нотатки, щоб сайт пам’ятав мову та ваш вхід.',
    sections: [
      {
        id: 'short-answer',
        title: 'Коротка відповідь',
        summary:
          'Жодних власних cookie, аналітики чи реклами. Тому ви й не бачите тут банера cookie.',
        paragraphs: [
          'Cookie — це невеликі текстові файли, які сайти зберігають у вашому браузері. Багато сайтів використовують їх, щоб відстежувати відвідувачів в інтернеті. Ми — ні.',
          'Платформа VIRaTeC не встановлює власних cookie і не використовує аналітичних, рекламних чи соціальних трекінгових cookie. Оскільки ми використовуємо лише сховище, суворо необхідне для функцій, які ви самі запитуєте, банер згоди не потрібен.',
        ],
      },
      {
        id: 'local-storage',
        title: 'Що ми зберігаємо натомість',
        summary:
          'Два записи в локальному сховищі браузера. Вони не залишають ваш пристрій, окрім як для входу.',
        paragraphs: [
          'Ми використовуємо локальне сховище браузера (local storage) — схожу технологію, дані якої залишаються на вашому пристрої та не надсилаються з кожним запитом. Ось повний перелік:',
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
              'viratec_token',
              'Зберігає вхід після авторизації',
              'Автентифікація, суворо необхідне',
              'Виходу з облікового запису або очищення даних сайту',
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
