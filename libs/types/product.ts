import { VendureSyncAbstract } from './abstract';
import { Product } from 'generated';

export class VendureSyncProduct
  extends VendureSyncAbstract<Product>
{
  setName() {
    this.name = 'product';
  }

  async export() {
    return (await this.config.sdk().Products(undefined, await this.config.headers())).data.products.items;
  }

  async keys() {
    return (await this.config.sdk().ProductKeys(undefined, await this.config.headers())).data.products.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(product: Product): string {
    return product.slug;
  }
}

