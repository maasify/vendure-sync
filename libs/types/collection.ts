import { VendureSyncAbstract } from './abstract';
import { Collection } from 'generated';

export class VendureSyncCollection
  extends VendureSyncAbstract<Collection>
{
  setName() {
    this.name = 'collection';
  }

  async export() {
    const {
      data: { collections },
    } = await this.config.sdk.Collections(undefined, this.config.headers);
    return collections;
  }
}

