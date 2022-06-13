import { VendureSyncAbstract } from './abstract';
import { TaxCategory } from 'generated';

export class VendureSyncTaxCategory extends VendureSyncAbstract<TaxCategory> {
  setName() {
    this.name = 'taxCategory';
  }

  async export() {
    return (await this.config.sdk().TaxCategories(undefined, await this.config.headers())).data.taxCategories;
  }

  async keys() {
    return (await this.config.sdk().TaxCategoryKeys(undefined, await this.config.headers())).data
      .taxCategories;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(taxCategory: TaxCategory): string {
    return taxCategory.name;
  }

  async insert(taxCategory: TaxCategory) {
    return (await this.config.sdk().CreateTaxCategory(
      {
        input: {
          name: taxCategory.name,
          isDefault: taxCategory.isDefault,
        },
      },
      await this.config.headers(),
    )).data.createTaxCategory.id;
  }
}
