import { VendureSyncAbstract, EntityKey } from './abstract';
import { Zone } from 'generated';

export class VendureSyncZone extends VendureSyncAbstract<Zone> {
  setName() {
    this.name = 'zone';
  }

  async export(): Promise<Partial<Zone>[]> {
    const {
      data: { zones },
    } = await this.config.sdk.Zones(undefined, this.config.headers);
    return zones;
  }

  async keys() {
    return (await this.config.sdk.ZoneKeys(undefined, this.config.headers)).data.zones;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(zone: Zone): string {
    return zone.name;
  }

  async insert(zone: Zone) {
    return await this.config.sdk.CreateZone(
      {
        input: {
          name: zone.name,
        },
      },
      this.config.headers,
    );
  }
}
