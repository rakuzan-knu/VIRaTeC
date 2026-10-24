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
}

function buildSrcSet(src: string, format: ResponsiveImageFormat) {
  if (import.meta.env.DEV) return undefined;
  const base = src.match(RESPONSIVE_IMAGE_SOURCE)?.[1];
  if (!base) return undefined;
  return RESPONSIVE_IMAGE_WIDTHS.map(
    (width) => `${responsiveImageVariant(base, width, format)} ${width}w`,
  ).join(', ');
}

export function ResponsiveImage({ src, sizes, alt, ...imageProps }: ResponsiveImageProps) {
  const avifSrcSet = buildSrcSet(src, 'avif');
  const webpSrcSet = buildSrcSet(src, 'webp');

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
