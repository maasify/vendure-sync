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

  async keys() {
    return (await this.config.sdk.TaxRates(undefined, this.config.headers)).data.taxRates.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(taxRate: TaxRate): string {
    return taxRate.name;
  }  
}
