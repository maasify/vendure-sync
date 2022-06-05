import { EntityKey, VendureSyncAbstract } from './abstract';
import { Channel } from 'generated';

export class VendureSyncChannel
  extends VendureSyncAbstract<Channel>
{
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
}
