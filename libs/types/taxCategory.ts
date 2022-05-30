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
}
