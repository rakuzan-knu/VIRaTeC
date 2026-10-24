import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';
import { BRAND_COLORS, BRAND_MARK, BRAND_WORDMARK } from '../src/shared/config/brand.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FONT_DIR = path.join(ROOT, 'node_modules/@fontsource');

const BRAND = {
  bg: BRAND_COLORS.bg,
  lime: BRAND_COLORS.lime,
  cyan: BRAND_COLORS.cyan,
  muted: '#b8becf',
} as const;

interface FontFace {
  family: string;
  weight: number;
  file: string;
  range: string;
}

const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F';
const CYRILLIC_RANGE = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';

const FONTS: FontFace[] = [
  {
    family: 'Instrument Sans',
    weight: 600,
    file: 'instrument-sans/files/instrument-sans-latin-600-normal.woff2',
    range: LATIN_RANGE,
  },
  {
    family: 'DM Sans',
    weight: 500,
    file: 'dm-sans/files/dm-sans-latin-500-normal.woff2',
    range: LATIN_RANGE,
  },
  {
    family: 'DM Sans',
    weight: 600,
    file: 'dm-sans/files/dm-sans-latin-600-normal.woff2',
    range: LATIN_RANGE,
  },
  {
    family: 'DM Sans',
    weight: 500,
    file: '../@fontsource/inter/files/inter-cyrillic-500-normal.woff2',
    range: CYRILLIC_RANGE,
  },
  {
    family: 'DM Sans',
    weight: 600,
    file: '../@fontsource/inter/files/inter-cyrillic-600-normal.woff2',
    range: CYRILLIC_RANGE,
  },
];

const dataUri = async (file: string, mime: string) =>
  `data:${mime};base64,${(await readFile(file)).toString('base64')}`;

const buildFontCss = async () => {
  const faces = await Promise.all(
    FONTS.map(
      async ({ family, weight, file, range }) =>
        `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;unicode-range:${range};src:url(${await dataUri(path.join(FONT_DIR, file), 'font/woff2')}) format('woff2');}`,
    ),
  );
  return faces.join('');
};

const buildMarkShapes = () => {
  const { orbit, node, gradient } = BRAND_MARK;
  const tilt = `rotate(${orbit.rotate} ${orbit.cx} ${orbit.cy})`;
  const ellipse = `cx="${orbit.cx}" cy="${orbit.cy}" rx="${orbit.rx}" ry="${orbit.ry}" fill="none" stroke="#ffffff"`;

  return `<defs>
      <linearGradient id="mark-v" x1="${gradient.x1}" y1="0" x2="${gradient.x2}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${BRAND.cyan}"/><stop offset="1" stop-color="${BRAND.lime}"/></linearGradient>
      <clipPath id="mark-front"><rect x="0" y="${orbit.cy}" width="${BRAND_MARK.size}" height="${orbit.ry + orbit.frontStroke * 2}"/></clipPath>
    </defs>
    <ellipse ${ellipse} transform="${tilt}" stroke-opacity="${orbit.backOpacity}" stroke-width="${orbit.backStroke}"/>
    <path d="${BRAND_MARK.vPath}" fill="none" stroke="url(#mark-v)" stroke-width="${BRAND_MARK.vStroke}" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="${tilt}">
      <ellipse ${ellipse} stroke-width="${orbit.frontStroke}" clip-path="url(#mark-front)"/>
      <circle cx="${node.cx}" cy="${node.cy}" r="${node.r}" fill="${BRAND.lime}"/>
    </g>`;
};

const buildLogoHtml = () => {
  const [before, accent, after] = BRAND_WORDMARK.parts;
  return `<svg class="logo" viewBox="0 0 ${BRAND_WORDMARK.width} ${BRAND_WORDMARK.height}">
    ${buildMarkShapes()}
    <text x="${BRAND_WORDMARK.textX}" y="${BRAND_WORDMARK.baseline}" textLength="${BRAND_WORDMARK.textLength}" lengthAdjust="spacingAndGlyphs" font-family="${BRAND_WORDMARK.fontFamily}" font-weight="${BRAND_WORDMARK.fontWeight}" font-size="${BRAND_WORDMARK.fontSize}" fill="#ffffff">${before}<tspan fill="${BRAND.lime}">${accent}</tspan>${after}</text>
  </svg>`;
};

const buildOgHtml = async () => {
  const background = await dataUri(
    path.join(ROOT, 'src/pages/home/assets/hero-background.webp'),
    'image/webp',
  );

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${await buildFontCss()}
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1200px;height:630px;overflow:hidden;background:${BRAND.bg};font-family:'DM Sans',sans-serif;color:#fff}
    .bg{position:absolute;inset:0;background:url(${background}) center/cover no-repeat;filter:saturate(1.25) brightness(1.35)}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,18,46,.94) 0%,rgba(3,18,46,.8) 42%,rgba(3,18,46,.25) 75%,rgba(3,18,46,0) 100%),linear-gradient(0deg,rgba(3,18,46,.75) 0%,rgba(3,18,46,0) 38%)}
    .content{position:absolute;inset:0;padding:60px 72px 64px;display:flex;flex-direction:column}
    .logo{display:block;width:300px;height:auto;aspect-ratio:${BRAND_WORDMARK.width}/${BRAND_WORDMARK.height}}
    .eyebrow{margin-top:auto;display:flex;align-items:center;gap:16px;color:${BRAND.lime};font-size:22px;font-weight:600;letter-spacing:.01em}
    .eyebrow::before{content:'';width:40px;height:2px;background:${BRAND.lime}}
    h1{margin-top:22px;font-family:'Instrument Sans','DM Sans',sans-serif;font-weight:600;font-size:76px;line-height:1.02;letter-spacing:-.03em;max-width:860px}
    h1 span{color:${BRAND.lime}}
    .footer{margin-top:40px;display:flex;align-items:center;justify-content:space-between;gap:24px}
    .org{font-size:22px;font-weight:500;color:${BRAND.muted}}
    .org b{color:#fff;font-weight:600}
    .url{padding:12px 22px;border:1.5px solid rgba(3,197,234,.55);border-radius:999px;font-size:20px;font-weight:600;color:${BRAND.cyan};background:rgba(3,18,46,.55)}
  </style></head><body>
    <div class="bg"></div><div class="shade"></div>
    <div class="content">
      ${buildLogoHtml()}
      <p class="eyebrow">Virtual Innovative Research &amp; Technology Community</p>
      <h1>Where ambitious minds <span>move research forward.</span></h1>
      <div class="footer">
        <p class="org"><b>КНУ імені Тараса Шевченка</b> · ФІТ + ННІФ · AI, EdTech, COIL</p>
        <p class="url">viratec.knu.ua</p>
      </div>
    </div>
  </body></html>`;
};

const buildIconHtml = (size: number, padding: number, radius: number) =>
  `<!doctype html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:transparent;overflow:hidden}
    .tile{width:${size}px;height:${size}px;border-radius:${radius}px;background:radial-gradient(circle at 30% 25%,#0b2a5c 0%,${BRAND.bg} 70%);display:flex;align-items:center;justify-content:center}
    .mark{display:block;width:${size - padding * 2}px;height:${size - padding * 2}px}
  </style></head><body><div class="tile"><svg class="mark" viewBox="0 0 ${BRAND_MARK.size} ${BRAND_MARK.size}">${buildMarkShapes()}</svg></div></body></html>`;

const render = async (
  page: Page,
  html: string,
  width: number,
  height: number,
  type: 'png' | 'jpeg' = 'png',
) => {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return type === 'jpeg'
    ? page.screenshot({ type, quality: 85 })
    : page.screenshot({ type, omitBackground: true });
};

const buildIco = (images: { size: number; png: Buffer }[]) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
};

const ICONS = [
  { file: 'apple-touch-icon.png', size: 180, padding: 22, radius: 0 },
  { file: 'icon-192.png', size: 192, padding: 24, radius: 40 },
  { file: 'icon-512.png', size: 512, padding: 64, radius: 108 },
  { file: 'icon-maskable-512.png', size: 512, padding: 112, radius: 0 },
  { file: 'favicon-32x32.png', size: 32, padding: 2, radius: 7 },
] as const;

const ICO_SIZES = [16, 32, 48] as const;

const main = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  try {
    await writeFile(
      path.join(PUBLIC_DIR, 'og-image.jpg'),
      await render(page, await buildOgHtml(), 1200, 630, 'jpeg'),
    );

    for (const { file, size, padding, radius } of ICONS) {
      await writeFile(
        path.join(PUBLIC_DIR, file),
        await render(page, buildIconHtml(size, padding, radius), size, size),
      );
    }

    const icoImages = [];
    for (const size of ICO_SIZES) {
      const padding = Math.max(1, Math.round(size / 16));
      const radius = Math.round(size * 0.22);
      icoImages.push({
        size,
        png: await render(page, buildIconHtml(size, padding, radius), size, size),
      });
    }
    await writeFile(path.join(PUBLIC_DIR, 'favicon.ico'), buildIco(icoImages));
  } finally {
    await browser.close();
  }
};

await main();
