import { VendureSyncAbstract } from './abstract';
import { TaxCategory } from 'generated';

export class VendureSyncTaxCategory
  extends VendureSyncAbstract<TaxCategory>
{
  setName() {
    this.name = 'taxCategory';
  }

  async export() {
    const {
      data: { taxCategories },
    } = await this.config.sdk.TaxCategories(undefined, this.config.headers);
    return taxCategories;
  }

  async keys() {
    return (await this.config.sdk.TaxCategoryKeys(undefined, this.config.headers)).data.taxCategories;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(taxCategory: TaxCategory): string {
    return taxCategory.name;
  }
}
