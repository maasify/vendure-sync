import * as fs from 'fs';
import path from 'path';
import { GraphQLClient } from 'graphql-request';
import { Channel, getSdk, Sdk } from '../generated';
import { Fk } from './fk';
import { VendureSyncHeader } from './header.type';
const DEFAULT_CODE = '__default_channel__';

export type VendureSyncConfigInput = {
  /**
   * The directory where source json are stored.
   */
  sourceDir: string;
  /**
   * Base url to a Vendure instance
   */
  url: string;

  token: string;
};

/**
 * An interface for all services input.
 */
export class VendureSyncConfig {
  sourceDir: string;

  private _sdk: Sdk;

  /**
   * The header to use with sdk
   */
  private _headers: VendureSyncHeader;

  /**
   * A memory storage to associate existing uuids
   * with our unique column (sku, slug, code ...)
   */
  foreignKeys?: Fk;

  private _channels: Channel[];
  private _currentChannel?: Channel;
  private _token: string;

  DEFAULT_CODE = '__default_channel__';

  constructor(input: VendureSyncConfigInput) {
    this.sourceDir = input.sourceDir;

    const client = new GraphQLClient(
      input.url + (input.url.endsWith('/') ? '' : '/') + 'admin-api',
    );
    this._sdk = getSdk(client);

    this._token = input.token;
  }

  sdk(): Sdk {
    this._headers['vendure-token'] = this._currentChannel?.token;
    return this._sdk;
  }

  /**
   * Get list of channels.
   * Needs to have a valid export folder.
   */
  getChannels(): Channel[] {
    if (!this._channels) {
      this._channels = require(path.join(this.sourceDir, 'channel.json'));
    }
    return this._channels;
  }

  /**
   * After calling this, will set
   * channel in request's headers
   * and read the channel directory.
   */
  setChannel(channel: Channel): VendureSyncConfig {
    this._currentChannel = channel;
    return this;
  }

  /**
   * Come back to undefined vendure-token
   */
  unsetChannel(): VendureSyncConfig {
    this._currentChannel = undefined;
    return this;
  }

  isDefault(): Boolean {
    return !this._currentChannel || this._currentChannel.code === this.DEFAULT_CODE;
  }

  /**
   * Authenticate to Vendure Admin API
   */
  async authenticate(token: string): Promise<VendureSyncHeader> {
    const response = await this._sdk.Authenticate({ token: token });
    return {
      authorization: `Bearer ${response.headers.get('vendure-auth-token')}`,
    };
  }

  async headers(): Promise<VendureSyncHeader> {
    if (!this._headers) {
      this._headers = await this.authenticate(this._token);
    }
    return this._headers;
  }

  getFilePath(name: string): string {
    const baseSourceDir = path.join(this.sourceDir, this._currentChannel?.code ?? '');
    fs.mkdirSync(baseSourceDir, { recursive: true });

    return path.join(baseSourceDir, `${name}.json`);
  }

  readJson<T>(name: string): T[] {
    const filePath = this.getFilePath(name);
    try {
      return require(filePath);
    } catch (e) {
      throw `${filePath} not readable`;
    }
  }
}
