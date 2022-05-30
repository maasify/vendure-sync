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
}
