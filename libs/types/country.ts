import { EntityKey, VendureSyncAbstract } from './abstract';
import { Country } from 'generated';

export class VendureSyncCountry extends VendureSyncAbstract<Country> {
  setName() {
    this.name = 'country';
  }

  async export() {
    return (await this.config.sdk.Countries(undefined, this.config.headers)).data.countries.items;
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

  async insert(country: Country) {
    return (
      await this.config.sdk.CreateCountry(
        {
          input: {
            code: country.code,
            translations: country.translations,
            enabled: country.enabled,
          },
        },
        this.config.headers,
      )
    ).data.createCountry.id;
  }
}
