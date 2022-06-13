import * as fs from 'fs';
import { Channel } from 'generated';
import { VendureSyncConfig } from './config';
import { VendureSyncZone } from './types/zone';
import { VendureSyncAbstract } from './types/abstract';
import { VendureSyncChannel } from './types/channel';
import { VendureSyncCountry } from './types/country';
import { VendureSyncPaymentMethod } from './types/paymentMethod';
import { VendureSyncRole } from './types/role';
import { VendureSyncShippingMethod } from './types/shippingMethod';
import { VendureSyncTaxCategory } from './types/taxCategory';
import { VendureSyncTaxRate } from './types/taxRate';
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
//  fs.mkdirSync(config.sourceDir, { recursive: true });

  /**
   * Export global settings
   */
  await exportType(new VendureSyncChannel(config));
  await exportType(new VendureSyncZone(config));
  await exportType(new VendureSyncCountry(config));
  await exportType(new VendureSyncTaxCategory(config));
  await exportType(new VendureSyncTaxRate(config));
  await exportType(new VendureSyncRole(config));

  /**
   * Read the generated channel list
   */
//  const baseSourceDir = config.sourceDir;
  for (const channel of config.getChannels()) {
    config.setChannel(channel);

    await exportType(new VendureSyncAsset(config));
    await exportType(new VendureSyncFacet(config));
    await exportType(new VendureSyncCollection(config));
    await exportType(new VendureSyncProduct(config));
    await exportType(new VendureSyncPaymentMethod(config));
    await exportType(new VendureSyncShippingMethod(config));
  }
}

async function exportType<U, T extends VendureSyncAbstract<U>>(vendureSyncType: T) {
  const filePath = vendureSyncType.config.getFilePath(vendureSyncType.name);
  console.log(`Write ${vendureSyncType.name} to ${filePath}`);

  const result = await vendureSyncType.export();
  fs.writeFileSync(filePath, JSON.stringify(result, null, 4), 'utf8');
}
