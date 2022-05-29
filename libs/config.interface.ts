import { Sdk } from '../generated';
import { Fk } from './fk';
import { VendureSyncHeader } from './header.type';

/**
 * An interface for all services input.
 */
export interface VendureSyncConfig {
  /**
   * The directory where source json are stored.
   */
  sourceDir: string;

  /**
   * The graphql SDK to talk with Vendure APIs
   */
  sdk: Sdk;

  /**
   * The header to use with sdk
   */
  headers: VendureSyncHeader;

  /**
   * A memory storage to associate existing uuids
   * with our unique column (sku, slug, code ...)
   */
   foreignKeys?: Fk;
}
