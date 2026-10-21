export const BRAND_COLORS = {
  bg: '#03122e',
  cyan: '#03c5ea',
  lime: '#b5fa67',
  limeOnLight: '#5fae2e',
  inkOnLight: '#03122e',
} as const;

export const BRAND_MARK = {
  size: 48,
  vPath: 'M11 9.5 23 35.5 35 9.5',
  vStroke: 6.5,
  gradient: { x1: 9, x2: 37 },
  orbit: {
    cx: 23,
    cy: 30,
    rx: 21,
    ry: 7,
    rotate: -24,
    backOpacity: 0.3,
    backStroke: 2,
    frontStroke: 2.2,
  },
  node: { cx: 44, cy: 30, r: 3.2 },
} as const;

export const BRAND_WORDMARK = {
  width: 190,
  height: 48,
  textX: 57,
  baseline: 36.6,
  fontSize: 34.5,
  textLength: 131,
  fontFamily: "'Instrument Sans', 'DM Sans', ui-sans-serif, system-ui, sans-serif",
  fontWeight: 600,
  parts: ['VIR', 'a', 'TeC'],
} as const;
