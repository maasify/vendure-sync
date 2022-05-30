import path from 'path';
import { VendureSyncConfig } from 'libs/config.interface';

export abstract class VendureSyncAbstract<T> {

  /**
   * A Vendure sync type has access to config
   */
  public config: VendureSyncConfig;

  /**
   * And has a name.
   */
  public name: string;

  constructor(config: VendureSyncConfig) {
    this.config = config;
    this.setName();
  }

  /**
   * Please implement with :
   * this.name = 'zone or whatever';
   */
  abstract setName(): void;

  getFilePath(): string {
    return path.join(this.config.sourceDir, `${this.name}.json`);
  }


  async export(): Promise<any> {
    console.log(`Export not yet implemented for ${this.name}`);
    return [];
  }
}

