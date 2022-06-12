import { VendureSyncAbstract } from './abstract';
import { TaxRate } from 'generated';
import { VendureSyncTaxCategory } from './taxCategory';
import { VendureSyncZone } from './zone';
import { VendureSyncConfig } from 'libs/config.interface';

export class VendureSyncTaxRate extends VendureSyncAbstract<TaxRate> {
  constructor(
    config: VendureSyncConfig,
    // Dependencies
    private taxCategorySync?: VendureSyncTaxCategory,
    private zoneSync?: VendureSyncZone,
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
    return (await this.config.sdk.TaxRateKeys(undefined, this.config.headers)).data.taxRates.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(taxRate: TaxRate): string {
    return taxRate.name;
  }

  async insert(taxRate: TaxRate) {
    if (!this.taxCategorySync || !this.zoneSync) {
      throw `Missing taxCategory or zone dependencies`;
    }

    return (
      await this.config.sdk.CreateTaxRate(
        {
          input: {
            name: taxRate.name,
            value: taxRate.value,
            enabled: taxRate.enabled,
            categoryId: await this.taxCategorySync.getUUid(taxRate.category),
            zoneId: await this.zoneSync.getUUid(taxRate.zone),
          },
        },
        this.config.headers,
      )
    ).data.createTaxRate.id;
  }
}
