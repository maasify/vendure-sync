import { EntityKey, VendureSyncAbstract } from './abstract';
import { Collection } from 'generated';

export class VendureSyncCollection extends VendureSyncAbstract<Collection> {
  setName() {
    this.name = 'collection';
  }

  async export() {
    return (await this.config.sdk().Collections(undefined, await this.config.headers())).data.collections
      .items;
  }

  async keys() {
    return (await this.config.sdk().CollectionKeys(undefined, await this.config.headers())).data.collections
      .items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(collection: Collection): string {
    return collection.slug;
  }
}
