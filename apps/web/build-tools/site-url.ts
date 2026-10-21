const FALLBACK_SITE_URL = 'https://viratec.knu.ua';

export const resolveSiteUrl = (explicitUrl: string | undefined) => {
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = explicitUrl || (vercelDomain ? `https://${vercelDomain}` : FALLBACK_SITE_URL);
  return new URL(siteUrl).origin;
};
