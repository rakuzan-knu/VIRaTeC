import type { HtmlTagDescriptor, Plugin } from 'vite';

const CRITICAL_FONTS = [
  /\/dm-sans-latin-400-normal-[^/]+\.woff2$/,
  /\/instrument-sans-latin-500-normal-[^/]+\.woff2$/,
];

export function fontPreloadPlugin(): Plugin {
  return {
    name: 'viratec-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_, ctx) {
        if (!ctx.bundle) return [];
        const files = Object.keys(ctx.bundle).map((fileName) => `/${fileName}`);

        return CRITICAL_FONTS.flatMap((pattern) => files.filter((file) => pattern.test(file))).map(
          (href): HtmlTagDescriptor => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' },
            injectTo: 'head-prepend',
          }),
        );
      },
    },
  };
}
