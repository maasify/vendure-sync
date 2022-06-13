import { VendureSyncAbstract } from './abstract';
import { PaymentMethod } from 'generated';

export class VendureSyncPaymentMethod extends VendureSyncAbstract<PaymentMethod> {
  setName() {
    this.name = 'paymentMethod';
  }

  async export() {
    return (await this.config.sdk().PaymentMethods(undefined, await this.config.headers())).data
      .paymentMethods.items;
  }

  async keys() {
    return (await this.config.sdk().PaymentMethodKeys(undefined, await this.config.headers())).data
      .paymentMethods.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(paymentMethod: PaymentMethod): string {
    return paymentMethod.code;
  }

  async insert(paymentMethod: PaymentMethod) {
    return (
      await this.config.sdk().CreatePaymentMethod(
        {
          input: {
            name: paymentMethod.name,
            code: paymentMethod.code,
            description: paymentMethod.description,
            enabled: paymentMethod.enabled,
            checker: paymentMethod.checker
              ? {
                  code: paymentMethod.checker.code,
                  arguments: paymentMethod.checker.args,
                }
              : undefined,
            handler: {
              code: paymentMethod.handler?.code,
              arguments: paymentMethod.handler?.args,
            },
          },
        },
        await this.config.headers(),
      )
    ).data.createPaymentMethod.id;
  }
}
