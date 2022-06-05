import { VendureSyncAbstract } from './abstract';
import { TaxRate } from 'generated';
import { VendureSyncTaxCategory } from './taxCategory';
import { VendureSyncZone } from './zone';
import { VendureSyncConfig } from 'libs/config.interface';

export class VendureSyncTaxRate extends VendureSyncAbstract<TaxRate> {
  constructor(
    config: VendureSyncConfig,
    // Dependencies
    private taxCategory?: VendureSyncTaxCategory,
    private zone?: VendureSyncZone,
  ) {
    super(config);
  }

  setName() {
    this.name = 'taxRate';
  }

  async export() {
    return (await this.config.sdk.TaxRates(undefined, this.config.headers)).data.taxRates.items;
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

  async insert(taxRate: TaxRate) {
    if (this.taxCategory && this.zone) {
      return (
        await this.config.sdk.CreateTaxRate(
          {
            input: {
              name: taxRate.name,
              value: taxRate.value,
              enabled: taxRate.enabled,
              categoryId: await this.taxCategory.getUUid(taxRate.category),
              zoneId: await this.zone.getUUid(taxRate.zone),
            },
          },
          this.config.headers,
        )
      ).data.createTaxRate.id;
    } else {
      throw `Missing taxCategory and zone dependencies`
    }
  }
}
