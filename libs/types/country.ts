import { VendureSyncAbstract } from './abstract';
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
}
