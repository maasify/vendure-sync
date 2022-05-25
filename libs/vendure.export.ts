/* tslint:disable:no-console */
import fs from 'fs';
import path from 'path';
import { Channel } from '../generated';
import { COMMON, getToken, authenticate } from './common';
import { InstanceEnum } from './instance.enum';
import { TypeEnum } from './type.enum';

/**
 * Get Sdk for SOURCE Vendure API
 */
export async function vendureExport(
  destination: string,
  ignoreDefault = false,
) {
  let DIRECTORY = destination;
  /**
   * Get Sdk for SOURCE Vendure API
   */
  const SDK = COMMON[InstanceEnum.SOURCE].sdk();
  const token = await getToken(InstanceEnum.SOURCE);
  const HEADERS = await authenticate(SDK, token);

  // export config
  await exportZones();
  await exportChannels();
  await exportCountries();
  await exportTaxCategories();
  await exportTaxRates();
  await exportPaymentMethods();
  await exportShippingMethods();
  await exportRoles();

  const channels: Channel[] = require(path.join(DIRECTORY, 'channels.json'));

  for (const channel of channels) {
    if (ignoreDefault && channel.code == '__default_channel__') {
      continue;
    }

    // change both vendure header and destination folder
    HEADERS['vendure-token'] = channel.token;
    DIRECTORY = path.join(destination, channel.code);

    // export catalog
    await exportAssets();
    await exportFacets();
    await exportCollections();
    await exportProducts();
  }

  async function exportZones() {
    const {
      data: { zones },
    } = await SDK.Zones(undefined, HEADERS);
    _writeFile(TypeEnum.ZONES, zones);
  }

  async function exportChannels() {
    const {
      data: { channels },
    } = await SDK.Channels(undefined, HEADERS);
    _writeFile(TypeEnum.CHANNELS, channels);
  }

  async function exportCountries() {
    const {
      data: { countries },
    } = await SDK.Countries(undefined, HEADERS);
    _writeFile(TypeEnum.COUNTRIES, countries);
  }

  async function exportTaxCategories() {
    const {
      data: { taxCategories },
    } = await SDK.TaxCategories(undefined, HEADERS);
    _writeFile(TypeEnum.TAX_CATEGORIES, taxCategories);
  }

  async function exportTaxRates() {
    const {
      data: { taxRates },
    } = await SDK.TaxRates(undefined, HEADERS);
    _writeFile(TypeEnum.TAX_RATES, taxRates);
  }

  async function exportPaymentMethods() {
    const {
      data: { paymentMethods },
    } = await SDK.PaymentMethods(undefined, HEADERS);
    _writeFile(TypeEnum.PAYMENT_METHODS, paymentMethods);
  }

  async function exportShippingMethods() {
    const {
      data: { shippingMethods },
    } = await SDK.ShippingMethods(undefined, HEADERS);
    _writeFile(TypeEnum.SHIPPING_METHODS, shippingMethods);
  }

  async function exportAssets() {
    const {
      data: { assets },
    } = await SDK.Assets(undefined, HEADERS);
    _writeFile(TypeEnum.ASSETS, assets);
  }

  async function exportFacets() {
    const {
      data: { facets },
    } = await SDK.Facets(undefined, HEADERS);
    _writeFile(TypeEnum.FACETS, facets);
  }

  async function exportProducts() {
    const {
      data: { products },
    } = await SDK.Products(undefined, HEADERS);
    _writeFile(TypeEnum.PRODUCTS, products);
  }

  async function exportCollections() {
    const {
      data: { collections },
    } = await SDK.Collections(undefined, HEADERS);
    _writeFile(TypeEnum.COLLECTIONS, collections);
  }

  async function exportRoles() {
    const {
      data: { roles },
    } = await SDK.Roles(undefined, HEADERS);
    _writeFile(TypeEnum.ROLES, roles);
  }

  /**
   * Write in export/$filenameType, data as JSON string.
   *
   * @param filenameType
   * @param data
   */
  async function _writeFile(type: TypeEnum, data: any) {
    fs.mkdirSync(DIRECTORY, { recursive: true });

    const file = path.join(DIRECTORY, `${type}.json`);

    console.log(`Write ${type} to ${file}`);
    fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
  }
}
