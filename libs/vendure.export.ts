import path from 'path';
import * as fs from 'fs';
import { VendureSyncConfig } from './config.interface';
import { VendureSyncZone } from './types/zone';
import { VendureSyncAbstract } from './types/abstract';
import { VendureSyncChannel } from './types/channel';
import { VendureSyncCountry } from './types/country';
import { VendureSyncPaymentMethod } from './types/paymentMethod';
import { VendureSyncRole } from './types/role';
import { VendureSyncShippingMethod } from './types/shippingMethod';
import { VendureSyncTaxCategory } from './types/taxCategory';
import { VendureSyncTaxRate } from './types/taxRate';
import { Channel } from 'generated';
import { VendureSyncAsset } from './types/asset';
import { VendureSyncCollection } from './types/collection';
import { VendureSyncFacet } from './types/facet';
import { VendureSyncProduct } from './types/product';

/**
 * Service for the export command
 */
export async function vendureExport(config: VendureSyncConfig) {
  /**
   * Make sure sourceDir is created
   */
  fs.mkdirSync(config.sourceDir, { recursive: true });

  /**
   * Export global settings
   */
  await exportType(new VendureSyncZone(config));
  await exportType(new VendureSyncChannel(config));
  await exportType(new VendureSyncCountry(config));
  await exportType(new VendureSyncTaxCategory(config));
  await exportType(new VendureSyncTaxRate(config));
  await exportType(new VendureSyncPaymentMethod(config));
  await exportType(new VendureSyncShippingMethod(config));
  await exportType(new VendureSyncRole(config));

  /**
   * Export all channels
   */
  const channels: Channel[] = require(path.join(config.sourceDir, 'channel.json'));

  const baseSourceDir = config.sourceDir;
  for (const channel of channels) {
    // if (ignoreDefault && channel.code == '__default_channel__') {
    //   continue;
    // }

    config.headers['vendure-token'] = channel.token;
    config.sourceDir = path.join(baseSourceDir, channel.code);
    /**
     * Make sure sourceDir is created
     */
    fs.mkdirSync(config.sourceDir, { recursive: true });

    // export catalog
    await exportType(new VendureSyncAsset(config));
    await exportType(new VendureSyncFacet(config));
    await exportType(new VendureSyncCollection(config));
    await exportType(new VendureSyncProduct(config));
  }
}

async function exportType<U, T extends VendureSyncAbstract<U>>(vendureSyncType: T) {
  const filePath = vendureSyncType.getFilePath();
  console.log(`Write ${vendureSyncType.name} to ${filePath}`);

  const result = await vendureSyncType.export();
  fs.writeFileSync(filePath, JSON.stringify(result, null, 4), 'utf8');
}
