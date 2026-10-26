export interface City {
  lat: number;
  lon: number;
}

export interface Partner extends City {
  name: string;
  country: string;
  hasArc?: boolean;
}

interface Link {
  from: City;
  to: Partner;
}

export const HUB: City = { lat: 50.45, lon: 30.52 };

export const PARTNERS: Partner[] = [
  { name: 'University of Oxford', country: 'UK', lat: 51.75, lon: -1.26 },
  { name: 'Lancaster University', country: 'UK', lat: 54.01, lon: -2.79 },
  { name: 'Coventry University', country: 'UK', lat: 52.41, lon: -1.51, hasArc: true },
  { name: 'Manchester Metropolitan University', country: 'UK', lat: 53.47, lon: -2.24 },
  { name: 'Johns Hopkins University', country: 'US', lat: 39.33, lon: -76.62, hasArc: true },
  { name: 'Indiana University', country: 'US', lat: 39.17, lon: -86.52 },
  { name: 'Florida International University', country: 'US', lat: 25.76, lon: -80.37 },
  { name: 'Florida State University', country: 'US', lat: 30.44, lon: -84.3 },
  { name: 'University of Central Arkansas', country: 'US', lat: 35.08, lon: -92.46 },
  { name: 'Georgia State University', country: 'US', lat: 33.75, lon: -84.39 },
  { name: 'Campbellsville University', country: 'US', lat: 37.34, lon: -85.34 },
  { name: 'Universidad Católica de Colombia', country: 'CO', lat: 4.64, lon: -74.07, hasArc: true },
  { name: 'Universidad Santo Tomás', country: 'CL', lat: -33.45, lon: -70.66, hasArc: true },
  { name: 'École Nationale Polytechnique', country: 'DZ', lat: 36.72, lon: 3.18, hasArc: true },
  {
    name: 'American University in the Emirates',
    country: 'AE',
    lat: 25.1,
    lon: 55.17,
    hasArc: true,
  },
  {
    name: 'Karunya Institute of Technology and Sciences',
    country: 'IN',
    lat: 10.94,
    lon: 76.74,
    hasArc: true,
  },
  { name: 'Lutsk National Technical University', country: 'UA', lat: 50.75, lon: 25.34 },
  { name: 'Pryazovskyi State Technical University', country: 'UA', lat: 48.46, lon: 35.04 },
];

export const ARC_TARGETS = PARTNERS.filter((partner) => partner.hasArc);

export const LINKS: Link[] = PARTNERS.filter((partner) => !partner.hasArc).map((partner) => ({
  from: ARC_TARGETS.find((gateway) => gateway.country === partner.country) ?? HUB,
  to: partner,
}));
