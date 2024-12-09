// types/country-region-data.d.ts

declare module "country-region-data/dist/data-umd" {
  export interface Region {
    name: string;
    shortCode: string;
  }

  export interface CountryRegion {
    countryName: string;
    countryShortCode: string;
    regions: Region[];
  }

  const data: CountryRegion[];
  export default data;
}
