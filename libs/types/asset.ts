import { EntityKey, VendureSyncAbstract } from './abstract';
import { Asset } from 'generated';

export class VendureSyncAsset
  extends VendureSyncAbstract<Asset>
{
  setName() {
    this.name = 'asset';
  }

  async export() {
    return (await this.config.sdk.Assets(undefined, this.config.headers)).data.assets.items;
  }

  async keys() {
    return (await this.config.sdk.AssetKeys(undefined, this.config.headers)).data.assets.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(asset: Asset): string {
    return asset.name;
  }
}
