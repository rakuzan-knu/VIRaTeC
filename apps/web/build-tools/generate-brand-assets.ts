import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LOGO_DIR = path.join(ROOT, 'src/shared/assets/logo');
const FONT_DIR = path.join(ROOT, 'node_modules/@fontsource');

const BRAND = {
  bg: '#03122e',
  lime: '#b5fa67',
  cyan: '#03c5ea',
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

const readVectorInsets = async () => {
  const source = await readFile(path.join(ROOT, 'src/shared/ui/logo.tsx'), 'utf8');
  const block = /VECTOR_INSETS = \[([\s\S]*?)\] as const/.exec(source)?.[1];
  if (!block) throw new Error('VECTOR_INSETS not found in logo.tsx');
  return [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);
};

const buildFontCss = async () => {
  const faces = await Promise.all(
    FONTS.map(
      async ({ family, weight, file, range }) =>
        `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;unicode-range:${range};src:url(${await dataUri(path.join(FONT_DIR, file), 'font/woff2')}) format('woff2');}`,
    ),
  );
  return faces.join('');
};

const buildLogoHtml = async () => {
  const insets = await readVectorInsets();
  const globe = await dataUri(path.join(LOGO_DIR, 'globe.webp'), 'image/webp');
  const vectors = await Promise.all(
    insets.map(async (inset, index) => {
      const src = await dataUri(path.join(LOGO_DIR, `vector-${index}.svg`), 'image/svg+xml');
      return `<span style="position:absolute;inset:${inset}"><img src="${src}" style="position:absolute;inset:0;width:100%;height:100%"></span>`;
    }),
  );

  return `<span class="logo">
    <span style="position:absolute;top:-17.65%;left:1.98%;height:96.47%;width:32.14%;overflow:hidden">
      <img src="${globe}" style="position:absolute;top:-5%;left:-5%;height:125%;width:250%;max-width:none">
    </span>
    ${vectors.join('')}
  </span>`;
};

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

const GLOBE_SCAN_WIDTH = 250;

const measureGlobe = async (page: Page, src: string): Promise<Box> => {
  await page.setContent('<!doctype html><html><body></body></html>');
  return page.evaluate(
    async ({ src, scanWidth }) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas 2D context is unavailable');
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, scanWidth, image.naturalHeight);

      let minX = scanWidth;
      let minY = image.naturalHeight;
      let maxX = 0;
      let maxY = 0;
      for (let y = 0; y < image.naturalHeight; y += 1) {
        for (let x = 0; x < scanWidth; x += 1) {
          if (data[(y * scanWidth + x) * 4 + 3] > 24) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      };
    },
    { src, scanWidth: GLOBE_SCAN_WIDTH },
  );
};

const buildGlobeHtml = (src: string, box: Box, size: number) => {
  const scale = size / Math.max(box.width, box.height);
  const left = -box.x * scale + (size - box.width * scale) / 2;
  const top = -box.y * scale + (size - box.height * scale) / 2;
  return `<span class="globe"><img src="${src}" style="left:${left}px;top:${top}px;width:${box.naturalWidth * scale}px;height:${box.naturalHeight * scale}px"></span>`;
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
    .logo{position:relative;display:block;width:312px;aspect-ratio:252/85}
    .logo img{display:block;max-width:none}
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
      ${await buildLogoHtml()}
      <p class="eyebrow">Virtual Innovative Research &amp; Technology Community</p>
      <h1>Where ambitious minds <span>move research forward.</span></h1>
      <div class="footer">
        <p class="org"><b>КНУ імені Тараса Шевченка</b> · ФІТ + ННІФ · AI, EdTech, COIL</p>
        <p class="url">viratec.knu.ua</p>
      </div>
    </div>
  </body></html>`;
};

interface GlobeSource {
  src: string;
  box: Box;
}

const buildIconHtml = ({ src, box }: GlobeSource, size: number, padding: number, radius: number) =>
  `<!doctype html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;background:transparent;overflow:hidden}
    .tile{width:${size}px;height:${size}px;border-radius:${radius}px;background:radial-gradient(circle at 30% 25%,#0b2a5c 0%,${BRAND.bg} 70%);display:flex;align-items:center;justify-content:center}
    .globe{position:relative;display:block;width:${size - padding * 2}px;height:${size - padding * 2}px;overflow:hidden}
    .globe img{position:absolute;max-width:none}
  </style></head><body><div class="tile">${buildGlobeHtml(src, box, size - padding * 2)}</div></body></html>`;

const render = async (page: Page, html: string, width: number, height: number) => {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page.screenshot({ type: 'png', omitBackground: true });
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
      path.join(PUBLIC_DIR, 'og-image.png'),
      await render(page, await buildOgHtml(), 1200, 630),
    );

    const src = await dataUri(path.join(LOGO_DIR, 'globe.webp'), 'image/webp');
    const globe: GlobeSource = { src, box: await measureGlobe(page, src) };

    for (const { file, size, padding, radius } of ICONS) {
      await writeFile(
        path.join(PUBLIC_DIR, file),
        await render(page, buildIconHtml(globe, size, padding, radius), size, size),
      );
    }

    const icoImages = [];
    for (const size of ICO_SIZES) {
      const padding = Math.max(1, Math.round(size / 16));
      const radius = Math.round(size * 0.22);
      icoImages.push({
        size,
        png: await render(page, buildIconHtml(globe, size, padding, radius), size, size),
      });
    }
    await writeFile(path.join(PUBLIC_DIR, 'favicon.ico'), buildIco(icoImages));
  } finally {
    await browser.close();
  }
};

await main();
