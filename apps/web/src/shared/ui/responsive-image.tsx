import type { ComponentProps } from 'react';
import {
  RESPONSIVE_IMAGE_SOURCE,
  RESPONSIVE_IMAGE_WIDTHS,
  responsiveImageVariant,
  type ResponsiveImageFormat,
} from '@/shared/config/responsiveImages';

interface ResponsiveImageProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  sizes: string;
  faceCrop?: number;
}

const CONTENTFUL_IMAGE_HOST = 'images.ctfassets.net';

function buildContentfulSrcSet(url: URL, format: ResponsiveImageFormat, faceCrop?: number) {
  if (url.pathname.endsWith('.svg')) return undefined;
  return RESPONSIVE_IMAGE_WIDTHS.map((width) => {
    const variant = new URL(url);
    variant.searchParams.set('fm', format);
    variant.searchParams.set('w', String(width));
    if (faceCrop) {
      variant.searchParams.set('h', String(Math.round(width / faceCrop)));
      variant.searchParams.set('fit', 'fill');
      variant.searchParams.set('f', 'face');
    }
    return `${variant.toString()} ${width}w`;
  }).join(', ');
}

function buildSrcSet(src: string, format: ResponsiveImageFormat, faceCrop?: number) {
  if (src.startsWith(`https://${CONTENTFUL_IMAGE_HOST}/`)) {
    return buildContentfulSrcSet(new URL(src), format, faceCrop);
  }
  if (import.meta.env.DEV) return undefined;
  const base = src.match(RESPONSIVE_IMAGE_SOURCE)?.[1];
  if (!base) return undefined;
  return RESPONSIVE_IMAGE_WIDTHS.map(
    (width) => `${responsiveImageVariant(base, width, format)} ${width}w`,
  ).join(', ');
}

export function ResponsiveImage({
  src,
  sizes,
  alt,
  faceCrop,
  ...imageProps
}: ResponsiveImageProps) {
  const avifSrcSet = buildSrcSet(src, 'avif', faceCrop);
  const webpSrcSet = buildSrcSet(src, 'webp', faceCrop);

  if (!avifSrcSet || !webpSrcSet) {
    return <img src={src} alt={alt} {...imageProps} />;
  }

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <img src={src} srcSet={webpSrcSet} sizes={sizes} alt={alt} {...imageProps} />
    </picture>
  );
}
