import { VendureSyncAbstract } from './abstract';
import { Channel, CreateRoleInput, Role } from 'generated';
import { VendureSyncChannel } from './channel';
import { VendureSyncConfig } from 'libs/config.interface';

export class VendureSyncRole extends VendureSyncAbstract<Role> {
  constructor(
    config: VendureSyncConfig,
    // Dependencies
    private channelSync?: VendureSyncChannel,
  ) {
    super(config);
  }

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

  async insert(role: Role) {
    const input = await this.getInsertUpdateInput(role);

    return (await this.config.sdk.CreateRole({ input }, this.config.headers)).data.createRole.id;
  }

  async update(id: string, role: Role) {
    const input = await this.getInsertUpdateInput(role);

    return (await this.config.sdk.UpdateRole({ input: { ...input, id } }, this.config.headers)).data
      .updateRole.id;
  }

  async getInsertUpdateInput(role: Role): Promise<CreateRoleInput> {
    if (!this.channelSync) {
      throw `Missing channel dependency`;
    }

    // List all existing channels
    const channelIds = (
      await Promise.all(
        role.channels.map(async (channel) => this.channelSync?.getUUidOrUndefined(channel)),
      )
    ).filter((id) => typeof id == 'string') as string[];

    return {
      code: role.code,
      description: role.description,
      permissions: role.permissions,
      channelIds,
    };
  }
}
