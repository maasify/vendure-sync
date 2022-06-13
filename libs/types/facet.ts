import { EntityKey, VendureSyncAbstract } from './abstract';
import { Facet } from 'generated';

export class VendureSyncFacet
  extends VendureSyncAbstract<Facet>
{
  setName() {
    this.name = 'facet';
  }

  async export() {
    return (await this.config.sdk().Facets(undefined, await this.config.headers())).data.facets.items;
  }

  async keys() {
    return (await this.config.sdk().FacetKeys(undefined, await this.config.headers())).data.facets.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(facet: Facet): string {
    return facet.code;
  }
}
