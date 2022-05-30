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
}
