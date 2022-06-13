import { VendureSyncAbstract } from './abstract';
import { ShippingMethod } from 'generated';

export class VendureSyncShippingMethod extends VendureSyncAbstract<ShippingMethod> {
  setName() {
    this.name = 'shippingMethod';
  }

  async export() {
    return (await this.config.sdk().ShippingMethods(undefined, await this.config.headers())).data
      .shippingMethods.items;
  }

  async keys() {
    return (await this.config.sdk().ShippingMethodKeys(undefined, await this.config.headers())).data
      .shippingMethods.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(sm: ShippingMethod): string {
    return sm.code;
  }

  async insert(shippingMethod: ShippingMethod) {
    return (
      await this.config.sdk().CreateShippingMethod(
        {
          input: {
            code: shippingMethod.code,
            translations: shippingMethod.translations,
            fulfillmentHandler: shippingMethod.fulfillmentHandlerCode,
            checker: {
              code: shippingMethod.checker.code,
              arguments: shippingMethod.checker.args,
            },
            calculator: {
              code: shippingMethod.calculator.code,
              arguments: shippingMethod.calculator.args,
            },
          },
        },
        await this.config.headers(),
      )
    ).data.createShippingMethod.id;
  }
}
