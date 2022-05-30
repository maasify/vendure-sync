import { VendureSyncAbstract } from './abstract';
import { Channel } from 'generated';

export class VendureSyncChannel
  extends VendureSyncAbstract<Channel>
{
  setName() {
    this.name = 'channel';
  }

  async export() {
    const {
      data: { channels },
    } = await this.config.sdk.Channels(undefined, this.config.headers);
    return channels;
  }
}
