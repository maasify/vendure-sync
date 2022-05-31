import { VendureSyncAbstract } from './abstract';
import { PaymentMethod } from 'generated';

export class VendureSyncPaymentMethod
  extends VendureSyncAbstract<PaymentMethod>
{
  setName() {
    this.name = 'paymentMethod';
  }

  async export() {
    const {
      data: { paymentMethods },
    } = await this.config.sdk.PaymentMethods(undefined, this.config.headers);
    return paymentMethods;
  }
  
  async keys() {
    return (await this.config.sdk.PaymentMethodKeys(undefined, this.config.headers)).data.paymentMethods.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(paymentMethod: PaymentMethod): string {
    return paymentMethod.code;
  }
}
