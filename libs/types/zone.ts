import { VendureSyncAbstract } from './abstract';
import { Zone } from 'generated';

export class VendureSyncZone
  extends VendureSyncAbstract<Zone>
{
  setName() {
    this.name = 'zone';
  }

  async export(): Promise<Partial<Zone>[]> {
    const {
      data: { zones },
    } = await this.config.sdk.Zones(undefined, this.config.headers);
    return zones;
  }
}
