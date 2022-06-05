import { VendureSyncAbstract } from './abstract';
import { Role } from 'generated';

export class VendureSyncRole
  extends VendureSyncAbstract<Role>
{
  setName() {
    this.name = 'role';
  }

  async export() {
    return (await this.config.sdk.Roles(undefined, this.config.headers)).data.roles.items;
  }

  async keys() {
    return (await this.config.sdk.RoleKeys(undefined, this.config.headers)).data.roles.items;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(role: Role): string {
    return role.code;
  }
}
