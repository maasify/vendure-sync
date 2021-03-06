import path from 'path';
import { VendureSyncConfig } from 'libs/config';

export type EntityKey = {
  id: string;
  key: string;
};

enum ImportResult {
  UPDATE = 'Update',
  INSERT = 'Insert'
}
export abstract class VendureSyncAbstract<T> {
  /**
   * A Vendure sync type has access to config
   */
  public config: VendureSyncConfig;

  /**
   * And has a name.
   */
  public name: string;

  /**
   * Store cache for entity keys.
   */
  protected _cacheKeys: EntityKey[];

  constructor(config: VendureSyncConfig) {
    this.config = config;
    this.setName();
  }

  /**
   * Please implement with :
   * this.name = 'zone or whatever';
   */
  abstract setName(): void;

  /**
   * Should query for all existing entities in admin-api
   * and return a pair of uuid / key.
   * The key is a semantic identifier (slug, sku, code ...)
   *
   * @see/gql/[type]/keys
   */
  abstract keys(): Promise<any[]>;

  /**
   * Should return the semantic identifier from type
   */
  abstract key(type: T): string;

  /**
   * The type is often read from exported json file.
   *
   * The function will ask for keys in admin-api
   * And search for uuid. If found, the entity exists.
   */
  async getUUid(type: T): Promise<string> {
    if (!this._cacheKeys) {
      this._cacheKeys = await this._initCacheKeys();
    }

    const key = this.key(type);

    const result = this._cacheKeys.find((entity) => entity.key === key);
    if (!result) {
      throw `${this.name} ${key} not found...`
    }
    return result.id;
  }

  async _initCacheKeys(): Promise<EntityKey[]> {
    const entityKeys = await this.keys();
    return entityKeys.map((entity) => ({
      id: entity.id,
      key: this.key(entity),
    }));
  }

  async getUUidOrUndefined(type: T): Promise<string|undefined> {
    try {
      return await this.getUUid(type);
    } catch(e) {}
  }

  /**
   * Should query to list all this type entities.
   *
   * @returns The query response (can be an array or a type)
   * @see gql/[type]/export
   */
  abstract export(): Promise<any[]>;

  async update(id: string, type: T): Promise<string> {
    throw `Update not yet implemented`;
  }

  async insert(type: T): Promise<string> {
    throw `Insert not yet implemented`;
  }

  /**
   * Generic import function.
   * 1. Get uuid for given entity
   * 2. If found, update entity and update cache key for uuid
   * 3. If not found, insert entity and add uuid in cache
   */
  async import(entity: T): Promise<ImportResult> {
    const key = this.key(entity);

    const id = await this.getUUidOrUndefined(entity);

    if (id) {
      await this.update(id, entity);

      const index = this._cacheKeys.findIndex((entity) => entity.id === id)!;
      this._cacheKeys[index].key = key;

      return ImportResult.UPDATE;
    } else {
      const newId = await this.insert(entity);

      this._cacheKeys.push({
        id: newId,
        key,
      });

      return ImportResult.INSERT;

    }
  }
}
