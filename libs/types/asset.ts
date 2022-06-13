import { VendureSyncAbstract } from './abstract';
import { Asset } from 'generated';

export class VendureSyncAsset
  extends VendureSyncAbstract<Asset>
{
  setName() {
    this.name = 'asset';
  }

  async export() {
    return (await this.config.sdk().Assets(undefined, await this.config.headers())).data.assets.items;
  }

  async keys() {
    return (await this.config.sdk().AssetKeys(undefined, await this.config.headers())).data.assets.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(asset: Asset): string {
    return asset.name;
  }

  async insert(taxRate: Asset) {
    return (
      await this.config.sdk().CreateTaxRate(
        {
          input: {
            name: taxRate.name,
            value: taxRate.value,
            enabled: taxRate.enabled,
            categoryId: await this.taxCategorySync.getUUid(taxRate.category),
            zoneId: await this.zoneSync.getUUid(taxRate.zone),
          },
        },
        await this.config.headers(),
      )
    ).data.createTaxRate.id;
  }  
}
