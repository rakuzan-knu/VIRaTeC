export interface HomePartner {
  name: string;
  logo: string;
  logoHeight: number;
  logoHeightLg: number;
  caption?: [string, string];
}

export interface NetworkPartner {
  code: string;
  name: string;
  location: string;
  logo?: string;
}
