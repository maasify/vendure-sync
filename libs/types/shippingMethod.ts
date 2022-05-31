import { VendureSyncAbstract } from './abstract';
import { ShippingMethod } from 'generated';

export class VendureSyncShippingMethod
  extends VendureSyncAbstract<ShippingMethod>
{
  setName() {
    this.name = 'shippingMethod';
  }

  async export() {
    const {
      data: { shippingMethods },
    } = await this.config.sdk.ShippingMethods(undefined, this.config.headers);
    return shippingMethods;
  }

  async keys() {
    return (await this.config.sdk.ShippingMethodKeys(undefined, this.config.headers)).data.shippingMethods.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(sm: ShippingMethod): string {
    return sm.code;
  }
}
