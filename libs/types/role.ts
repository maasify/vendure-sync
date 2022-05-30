import { VendureSyncAbstract } from './abstract';
import { Role } from 'generated';

export class VendureSyncRole
  extends VendureSyncAbstract<Role>
{
  setName() {
    this.name = 'role';
  }

  async export() {
    const {
      data: { roles },
    } = await this.config.sdk.Roles(undefined, this.config.headers);
    return roles;
  }
}
