import { EntityKey, VendureSyncAbstract } from './abstract';
import { Country } from 'generated';

export class VendureSyncCountry
  extends VendureSyncAbstract<Country>
{
  setName() {
    this.name = 'country';
  }

  async export() {
    const {
      data: { countries },
    } = await this.config.sdk.Countries(undefined, this.config.headers);
    return countries;
  }

  async keys() {
    return (await this.config.sdk.CountryKeys(undefined, this.config.headers)).data.countries.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(country: Country): string {
    return country.code;
  }
}
