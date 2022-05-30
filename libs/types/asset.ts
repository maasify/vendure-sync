import { VendureSyncAbstract } from './abstract';
import { Asset } from 'generated';

export class VendureSyncAsset
  extends VendureSyncAbstract<Asset>
{
  setName() {
    this.name = 'asset';
  }

  async export() {
    const {
      data: { assets },
    } = await this.config.sdk.Assets(undefined, this.config.headers);
    return assets;
  }
}
