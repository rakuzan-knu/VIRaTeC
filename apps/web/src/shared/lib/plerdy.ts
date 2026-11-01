const PLERDY_SCRIPT_SRC = 'https://a.plerdy.com/public/js/click/main.js';
const PLERDY_SITE_HASH = '283a8269a8c090006b3d71920306319f';
const PLERDY_SITE_ID = 82719;

declare global {
  interface Window {
    __plerdyCode?: number;
    _protocol?: string;
    _site_hash_code?: string;
    _suid?: number;
  }
}

export function loadPlerdy() {
  if (!import.meta.env.PROD || window.__plerdyCode) return;

  window.__plerdyCode = 1;
  window._protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
  window._site_hash_code = PLERDY_SITE_HASH;
  window._suid = PLERDY_SITE_ID;

  const script = document.createElement('script');
  script.async = true;
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  script.src = `${PLERDY_SCRIPT_SRC}?v=${Math.random()}`;
  document.head.appendChild(script);
}
