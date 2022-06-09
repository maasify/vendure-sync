import { EntityKey, VendureSyncAbstract } from './abstract';
import { Channel, CreateChannelInput } from 'generated';
import { VendureSyncConfig } from 'libs/config.interface';
import { VendureSyncZone } from './zone';

export class VendureSyncChannel extends VendureSyncAbstract<Channel> {
  constructor(
    config: VendureSyncConfig,
    // Dependencies
    private zone?: VendureSyncZone,
  ) {
    super(config);
  }

  setName() {
    this.name = 'channel';
  }

  async export() {
    return (await this.config.sdk.Channels(undefined, this.config.headers)).data.channels;
  }

  async keys() {
    return (await this.config.sdk.ChannelKeys(undefined, this.config.headers)).data.channels;
  }

  /**
   * Should return the semantic identifier from type
   */
  key(channel: Channel): string {
    return channel.code;
  }

  async insert(channel: Channel) {
    const input = await this.getInsertUpdateInput(channel);

    const response = (await this.config.sdk.CreateChannel({ input }, this.config.headers)).data
      .createChannel;

    if ('message' in response) {
      throw response.message;
    }
    return response.id;
  }

  async update(id: string, channel: Channel) {
    const input = await this.getInsertUpdateInput(channel);

    const response = (
      await this.config.sdk.UpdateChannel({ input: { ...input, id } }, this.config.headers)
    ).data.updateChannel;

    if ('message' in response) {
      throw response.message;
    }
    return response.id;
  }

  async getInsertUpdateInput(channel: Channel): Promise<CreateChannelInput> {
    if (!this.zone) {
      throw `Missing zone dependency`;
    }
    if (!channel.defaultTaxZone) {
      throw `Can not copy channel ... has no defaultTaxZone`;
    }
    if (!channel.defaultShippingZone) {
      throw `Can not copy channel ... has no defaultShippingZone`;
    }

    return {
      code: channel.code,
      token: channel.token,
      defaultLanguageCode: channel.defaultLanguageCode,
      pricesIncludeTax: channel.pricesIncludeTax,
      currencyCode: channel.currencyCode,
      defaultTaxZoneId: await this.zone.getUUid(channel.defaultTaxZone),
      defaultShippingZoneId: await this.zone.getUUid(channel.defaultShippingZone),
    };
  }
}
