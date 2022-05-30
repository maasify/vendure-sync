import { VendureSyncAbstract } from './abstract';
import { TaxRate } from 'generated';

export class VendureSyncTaxRate
  extends VendureSyncAbstract<TaxRate>
{
  setName() {
    this.name = 'taxRate';
  }

  async export() {
    const {
      data: { taxRates },
    } = await this.config.sdk.TaxRates(undefined, this.config.headers);
    return taxRates;
  }
}
