export const RESPONSIVE_IMAGE_WIDTHS = [480, 800, 1200, 1920] as const;

export const RESPONSIVE_IMAGE_FORMATS = ['avif', 'webp'] as const;

export type ResponsiveImageFormat = (typeof RESPONSIVE_IMAGE_FORMATS)[number];

export const RESPONSIVE_IMAGE_SOURCE = /^(\/?assets\/.+)\.webp$/;

export const responsiveImageVariant = (
  base: string,
  width: number,
  format: ResponsiveImageFormat,
) => `${base}-${width}w.${format}`;
