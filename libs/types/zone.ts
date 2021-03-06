import { VendureSyncAbstract, EntityKey } from './abstract';
import { Zone } from 'generated';

export class VendureSyncZone extends VendureSyncAbstract<Zone> {
  setName() {
    this.name = 'zone';
  }

  async export() {
    return (await this.config.sdk().Zones(undefined, await this.config.headers())).data.zones;
  }

  async keys() {
    return (await this.config.sdk().ZoneKeys(undefined, await this.config.headers())).data.zones;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(zone: Zone): string {
    return zone.name;
  }

  async insert(zone: Zone) {
    return (await this.config.sdk().CreateZone(
      {
        input: {
          name: zone.name,
        },
      },
      await this.config.headers(),
    )).data.createZone.id;
  }
}
