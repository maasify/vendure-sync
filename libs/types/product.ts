import { VendureSyncAbstract } from './abstract';
import { Product } from 'generated';

export class VendureSyncProduct
  extends VendureSyncAbstract<Product>
{
  setName() {
    this.name = 'product';
  }

  async export() {
    const {
      data: { products },
    } = await this.config.sdk.Products(undefined, this.config.headers);
    return products;
  }
}

