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

/**
 * Get Sdk for SOURCE Vendure API
 */
export async function vendureExport(config: VendureSyncConfig) {

  /**
   * Make sure sourceDir is created
   */
  fs.mkdirSync(config.sourceDir, { recursive: true });

  await exportType(new VendureSyncZone(config));
  await exportType(new VendureSyncChannel(config));
  await exportType(new VendureSyncCountry(config));
  await exportType(new VendureSyncTaxCategory(config));
  await exportType(new VendureSyncTaxRate(config));
  await exportType(new VendureSyncPaymentMethod(config));
  await exportType(new VendureSyncShippingMethod(config));
  await exportType(new VendureSyncRole(config));
}


async function exportType<U, T extends VendureSyncAbstract<U>>(vendureSyncType: T) {
  const filePath = vendureSyncType.getFilePath();
  console.log(`Write ${vendureSyncType.name} to ${filePath}`);

  const result = await vendureSyncType.export();
  fs.writeFileSync(filePath, JSON.stringify(result, null, 4), "utf8");
}


  // // export config
  // await exportChannels(input);

  // const channels: Channel[] = require(path.join(DIRECTORY, 'channels.json'));

  // for (const channel of channels) {
  //   if (ignoreDefault && channel.code == '__default_channel__') {
  //     continue;
  //   }

  //   // change both vendure header and destination folder
  //   HEADERS['vendure-token'] = channel.token;
  //   DIRECTORY = path.join(destination, channel.code);

  //   // export catalog
  //   await exportAssets(input);
  //   await exportFacets();
  //   await exportCollections();
  //   await exportProducts();
  // }


  // async function exportCountries() {
  //   const {
  //     data: { countries },
  //   } = await SDK.Countries(undefined, HEADERS);
  //   _writeFile(TypeEnum.COUNTRIES, countries);
  // }

  // async function exportTaxCategories() {
  //   const {
  //     data: { taxCategories },
  //   } = await SDK.TaxCategories(undefined, HEADERS);
  //   _writeFile(TypeEnum.TAX_CATEGORIES, taxCategories);
  // }

  // async function exportTaxRates() {
  //   const {
  //     data: { taxRates },
  //   } = await SDK.TaxRates(undefined, HEADERS);
  //   _writeFile(TypeEnum.TAX_RATES, taxRates);
  // }

  // async function exportPaymentMethods() {
  //   const {
  //     data: { paymentMethods },
  //   } = await SDK.PaymentMethods(undefined, HEADERS);
  //   _writeFile(TypeEnum.PAYMENT_METHODS, paymentMethods);
  // }

  // async function exportShippingMethods() {
  //   const {
  //     data: { shippingMethods },
  //   } = await SDK.ShippingMethods(undefined, HEADERS);
  //   _writeFile(TypeEnum.SHIPPING_METHODS, shippingMethods);
  // }


  // async function exportFacets() {
  //   const {
  //     data: { facets },
  //   } = await SDK.Facets(undefined, HEADERS);
  //   _writeFile(TypeEnum.FACETS, facets);
  // }

  // async function exportProducts() {
  //   const {
  //     data: { products },
  //   } = await SDK.Products(undefined, HEADERS);
  //   _writeFile(TypeEnum.PRODUCTS, products);
  // }

  // async function exportCollections() {
  //   const {
  //     data: { collections },
  //   } = await SDK.Collections(undefined, HEADERS);
  //   _writeFile(TypeEnum.COLLECTIONS, collections);
  // }

  // async function exportRoles() {
  //   const {
  //     data: { roles },
  //   } = await SDK.Roles(undefined, HEADERS);
  //   _writeFile(TypeEnum.ROLES, roles);
  // }
