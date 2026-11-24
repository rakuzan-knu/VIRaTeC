import { toPartnerSlug } from '@/entities/partner';

export interface City {
  lat: number;
  lon: number;
}

export interface Partner extends City {
  name: string;
  country: string;
  timeZone: string;
  hasArc?: boolean;
}

interface Link {
  from: City;
  to: Partner;
}

export const HUB: City = { lat: 50.4419, lon: 30.5113 };

export const PARTNERS: Partner[] = [
  {
    name: 'University of Oxford',
    country: 'UK',
    timeZone: 'Europe/London',
    lat: 51.755,
    lon: -1.255,
  },
  {
    name: 'Lancaster University',
    country: 'UK',
    timeZone: 'Europe/London',
    lat: 54.0103,
    lon: -2.7856,
  },
  {
    name: 'Coventry University',
    country: 'UK',
    timeZone: 'Europe/London',
    lat: 52.4081,
    lon: -1.5056,
    hasArc: true,
  },
  {
    name: 'Manchester Metropolitan University',
    country: 'UK',
    timeZone: 'Europe/London',
    lat: 53.47,
    lon: -2.24,
  },
  {
    name: 'Johns Hopkins University',
    country: 'US',
    timeZone: 'America/New_York',
    lat: 39.3289,
    lon: -76.6203,
    hasArc: true,
  },
  {
    name: 'Indiana University',
    country: 'US',
    timeZone: 'America/Indiana/Indianapolis',
    lat: 39.1672,
    lon: -86.5214,
  },
  {
    name: 'Florida International University',
    country: 'US',
    timeZone: 'America/New_York',
    lat: 25.757,
    lon: -80.374,
  },
  {
    name: 'Florida State University',
    country: 'US',
    timeZone: 'America/New_York',
    lat: 30.442,
    lon: -84.298,
  },
  {
    name: 'University of Central Arkansas',
    country: 'US',
    timeZone: 'America/Chicago',
    lat: 35.0776,
    lon: -92.4577,
  },
  {
    name: 'Georgia State University',
    country: 'US',
    timeZone: 'America/New_York',
    lat: 33.7536,
    lon: -84.3854,
  },
  {
    name: 'Campbellsville University',
    country: 'US',
    timeZone: 'America/New_York',
    lat: 37.3432,
    lon: -85.3506,
  },
  {
    name: 'Universidad Católica de Colombia',
    country: 'CO',
    timeZone: 'America/Bogota',
    lat: 4.6352,
    lon: -74.0688,
    hasArc: true,
  },
  {
    name: 'Universidad Santo Tomás',
    country: 'CL',
    timeZone: 'America/Santiago',
    lat: -33.4489,
    lon: -70.6605,
    hasArc: true,
  },
  {
    name: 'École Nationale Polytechnique',
    country: 'DZ',
    timeZone: 'Africa/Algiers',
    lat: 36.7232,
    lon: 3.1508,
    hasArc: true,
  },
  {
    name: 'American University in the Emirates',
    country: 'AE',
    timeZone: 'Asia/Dubai',
    lat: 25.1248,
    lon: 55.4097,
    hasArc: true,
  },
  {
    name: 'Karunya Institute of Technology and Sciences',
    country: 'IN',
    timeZone: 'Asia/Kolkata',
    lat: 10.9359,
    lon: 76.7442,
    hasArc: true,
  },
  {
    name: 'Lutsk National Technical University',
    country: 'UA',
    timeZone: 'Europe/Kyiv',
    lat: 50.7257,
    lon: 25.2976,
  },
  {
    name: 'Pryazovskyi State Technical University',
    country: 'UA',
    timeZone: 'Europe/Kyiv',
    lat: 48.455,
    lon: 35.0511,
  },
];

export const ARC_TARGETS = PARTNERS.filter((partner) => partner.hasArc);

export const LINKS: Link[] = PARTNERS.filter((partner) => !partner.hasArc).map((partner) => ({
  from: ARC_TARGETS.find((gateway) => gateway.country === partner.country) ?? HUB,
  to: partner,
}));

export function gatewayOf(partner: Partner): Partner | undefined {
  return partner.hasArc
    ? partner
    : ARC_TARGETS.find((gateway) => gateway.country === partner.country);
}

export const findPartnerIndex = (slug: string | null): number | null => {
  const index = PARTNERS.findIndex((partner) => toPartnerSlug(partner.name) === slug);
  return index === -1 ? null : index;
};

export const isOnGlobe = (slug: string): boolean => findPartnerIndex(slug) !== null;
