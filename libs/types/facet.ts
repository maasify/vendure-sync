import { VendureSyncAbstract } from './abstract';
import { Facet } from 'generated';

export class VendureSyncFacet
  extends VendureSyncAbstract<Facet>
{
  setName() {
    this.name = 'facet';
  }

  async export() {
    const {
      data: { facets },
    } = await this.config.sdk.Facets(undefined, this.config.headers);
    return facets;
  }
}
