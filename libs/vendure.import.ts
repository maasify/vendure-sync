import path from 'path';
import { VendureSyncConfig } from './config.interface';
import { VendureSyncAbstract } from './types/abstract';
import { VendureSyncZone } from './types/zone';
import { VendureSyncCountry } from './types/country';
import { VendureSyncPaymentMethod } from './types/paymentMethod';
import { VendureSyncRole } from './types/role';
import { VendureSyncShippingMethod } from './types/shippingMethod';
import { VendureSyncTaxCategory } from './types/taxCategory';
import { VendureSyncTaxRate } from './types/taxRate';
import { Channel } from 'generated';
import { VendureSyncChannel } from './types/channel';

const DEFAULT = 'default';
const DEFAULT_CODE = '__default_channel__';

export async function vendureImport(config: VendureSyncConfig) {
  /**
   * Import global settings
   */
  const zone = await importType(new VendureSyncZone(config));
  await importType(new VendureSyncCountry(config));
  const taxCategory = await importType(new VendureSyncTaxCategory(config));
  // taxRate has dependencies on taxCategory and zone
  await importType(new VendureSyncTaxRate(config, taxCategory, zone));

  /**
   * Read the channels list
   */
  const channels: Channel[] = require(path.join(config.sourceDir, 'channel.json'));

  const baseSourceDir = config.sourceDir;
  for (const channel of channels) {
    config.headers['vendure-token'] = channel.token;
    config.sourceDir = path.join(baseSourceDir, channel.code);
    
    await importType(new VendureSyncChannel(config));
    await importType(new VendureSyncPaymentMethod(config)); // assign
    await importType(new VendureSyncShippingMethod(config)); //assign
    //await importType(new VendureSyncRole(config));
  }
}

/**
 * This function will
 * - read the exported json
 * - iterate over entities
 *   - call the VendureSync.import method for each entity
 * - return the VendureSync
 *
 * @param vendureSyncType VendureSyncAbstract
 * @returns VendureSyncAbstract
 */
async function importType<U, T extends VendureSyncAbstract<U>>(vendureSyncType: T): Promise<T> {
  const filePath = vendureSyncType.getFilePath();
  console.log(`Import ${filePath}`);

  const types: U[] = await vendureSyncType.readJson();
  for (const type of types) {
    const displayString = `${vendureSyncType.name} ${vendureSyncType.key(type)}`;

    try {
      const result = await vendureSyncType.import(type);
      console.log(`${result} ${displayString}`);
    } catch (e) {
      console.log(`Error for ${displayString} : ${e}`);
    }
  }
  return vendureSyncType;
}

//   let DIRECTORY = source;
//   /**
//    * Get Sdk for DESTINATION Vendure API
//    */
//   const SDK = COMMON[InstanceEnum.DESTINATION].sdk();
//   const token = await getToken(InstanceEnum.DESTINATION);
//   let HEADERS = await authenticate(SDK, token);

//   /**
//    * Get Foreign keys class
//    */
//   const FK = new Fk(SDK);
//   FK.setHeaders(HEADERS);
//   // Read channel in local json files
//   const channel = await readChannel(
//     channelCode === DEFAULT ? DEFAULT_CODE : channelCode,
//   );

//   if (!channel) {
//     throw `Invalid channel ${channelCode}`;
//   }

//   if (channel.code === DEFAULT_CODE) {
//     // no need to set token in header
//     await importDefaultChannel(channel);
//   } else {
//     // Update directory where json are
//     DIRECTORY = path.join(source, channel.code);
//     channel.id = await insertOrFindChannel(channel);

//     // Todo : if channel is inserted, reauthentify user on it !
//     HEADERS = await authenticate(SDK, token);
//     // Set channel in headers
//     HEADERS['vendure-token'] = channel.token;

//     await importChannel(channel);
//   }

//   async function importDefaultChannel(channel: Channel) {
//   }

//   async function importChannel(channel: Channel) {
//     // Catalog
//     await importAssets(channel); // assign
//     await importFacets(); // copy
//     await importCollections(); // copy
//     await importProducts(channel); // assign
//     await importProductOptionGroups(); // assign
//     await importProductVariants(); // assign
//   }

//   async function readChannel(channelCode: string) {
//     const channels: Channel[] = readJson(TypeEnum.CHANNELS);

//     return channels.find((channel) => channel.code === channelCode);
//   }

//   async function updateChannel(channel: Channel) {
//     try {
//       const id = await FK.getChannelId(channel);

//       if (id) {
//         const input = {
//           code: channel.code,
//           token: channel.token,
//           defaultLanguageCode: channel.defaultLanguageCode,
//           pricesIncludeTax: channel.pricesIncludeTax,
//           currencyCode: channel.currencyCode,
//           defaultTaxZoneId: channel.defaultTaxZone
//             ? await FK.getZoneId(channel.defaultTaxZone)
//             : 'undefined', // should raise an exception
//           defaultShippingZoneId: channel.defaultShippingZone
//             ? await FK.getZoneId(channel.defaultShippingZone)
//             : 'undefined', // should raise an exception
//         };

//         await SDK.UpdateChannel(
//           {
//             input: { ...input, ...{ id: id } },
//           },
//           HEADERS,
//         );
//       } else {
//         throw `Does not exist ...`;
//       }
//     } catch (e) {
//       console.log(`Error to update channel ${channel.code} : ${e}`);
//     }
//     FK.reset(TypeEnum.CHANNELS);
//   }

//   async function insertOrFindChannel(channel: Channel): Promise<string> {
//     let channelId = 'NOT_FOUND';
//     try {
//       const id = await FK.getChannelId(channel);

//       if (!id) {
//         if (channel.defaultTaxZone && channel.defaultShippingZone) {
//           const input = {
//             code: channel.code,
//             token: channel.token,
//             defaultLanguageCode: channel.defaultLanguageCode,
//             pricesIncludeTax: channel.pricesIncludeTax,
//             currencyCode: channel.currencyCode,
//             defaultTaxZoneId: await FK.getZoneId(channel.defaultTaxZone),
//             defaultShippingZoneId: await FK.getZoneId(
//               channel.defaultShippingZone,
//             ),
//           };

//           const response = await SDK.CreateChannel(
//             {
//               input: input as Required<CreateChannelInput>,
//             },
//             // Channel create is only done from default channel
//             getHeadersForDefaultChannel(HEADERS),
//           );
//           channelId = (response.data.createChannel as Channel).id;
//           console.log(`Insert channel ${channelId}`);
//         } else {
//           throw `Missing defaultTaxZone or defaultShippingZone`;
//         }
//       } else {
//         console.log(`Find channel ${id}`);
//         channelId = id;
//       }
//     } catch (e) {
//       console.log(`Error to insert channel ${channel.code} : ${e}`);
//     }
//     FK.reset(TypeEnum.CHANNELS);

//     return channelId;
//   }

//   /**
//    * Todo : import association between countries and zones
//    */
//   async function importCountries() {
//     const countries: CountryList = readJson(TypeEnum.COUNTRIES);

//     for (const country of countries.items) {
//       try {
//         const id = await FK.getCountryId(country);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreateCountry(
//             {
//               input: {
//                 code: country.code,
//                 translations: country.translations,
//                 enabled: country.enabled,
//               },
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for country ${country.code} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.COUNTRIES);
//   }

//   async function importTaxCategories() {
//     const taxCategories: TaxCategory[] = readJson(TypeEnum.TAX_CATEGORIES);

//     for (const taxCategory of taxCategories) {
//       try {
//         const id = await FK.getTaxCategoryId(taxCategory);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreateTaxCategory(
//             {
//               input: {
//                 name: taxCategory.name,
//                 isDefault: taxCategory.isDefault,
//               },
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for taxCategory ${taxCategory.name} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.TAX_CATEGORIES);
//   }

//   async function importTaxRates() {
//     const taxRates: TaxRateList = readJson(TypeEnum.TAX_RATES);

//     for (const taxRate of taxRates.items) {
//       try {
//         const id = await FK.getTaxRateId(taxRate);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           const input = {
//             name: taxRate.name,
//             value: taxRate.value,
//             categoryId: await FK.getTaxCategoryIdOrDie(taxRate.category),
//             enabled: taxRate.enabled,
//             zoneId: await FK.getZoneIdOrDie(taxRate.zone),
//           };

//           await SDK.CreateTaxRate(
//             {
//               input,
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for taxRate ${taxRate.name} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.TAX_RATES);
//   }

//   async function importPaymentMethods() {
//     const paymentMethods: PaymentMethodList = readJson(
//       TypeEnum.PAYMENT_METHODS,
//     );

//     for (const paymentMethod of paymentMethods.items) {
//       try {
//         const id = await FK.getPaymentMethodId(paymentMethod);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreatePaymentMethod(
//             {
//               input: {
//                 name: paymentMethod.name,
//                 code: paymentMethod.code,
//                 description: paymentMethod.description,
//                 enabled: paymentMethod.enabled,
//                 checker: paymentMethod.checker
//                   ? {
//                       code: paymentMethod.checker.code,
//                       arguments: paymentMethod.checker.args,
//                     }
//                   : undefined,
//                 handler: {
//                   code: paymentMethod.handler?.code,
//                   arguments: paymentMethod.handler?.args,
//                 },
//               },
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for paymentMethod ${paymentMethod.name} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.PAYMENT_METHODS);
//   }

//   async function importShippingMethods() {
//     const shippingMethods: ShippingMethodList = readJson(
//       TypeEnum.SHIPPING_METHODS,
//     );

//     for (const shippingMethod of shippingMethods.items) {
//       try {
//         const id = await FK.getShippingMethodId(shippingMethod);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreateShippingMethod(
//             {
//               input: {
//                 code: shippingMethod.code,
//                 translations: shippingMethod.translations,
//                 fulfillmentHandler: shippingMethod.fulfillmentHandlerCode,
//                 checker: {
//                   code: shippingMethod.checker.code,
//                   arguments: shippingMethod.checker.args,
//                 },
//                 calculator: {
//                   code: shippingMethod.calculator.code,
//                   arguments: shippingMethod.calculator.args,
//                 },
//               },
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for shippingMethod ${shippingMethod.name} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.SHIPPING_METHODS);
//   }

//   async function importRoles() {
//     const roles: RoleList = readJson(TypeEnum.ROLES);

//     for (const role of roles.items) {
//       try {
//         const id = await FK.getRoleId(role);

//         // List all existing channels
//         const channelIds = (
//           await Promise.all(
//             role.channels.map(async (channel) => FK.getChannelId(channel)),
//           )
//         ).filter((id) => typeof id == 'string') as string[];

//         if (channelIds.length) {
//           const input = {
//             code: role.code,
//             description: role.description,
//             permissions: role.permissions,
//             channelIds: channelIds,
//           };

//           if (id) {
//             await SDK.UpdateRole(
//               {
//                 input: { ...input, id },
//               },
//               HEADERS,
//             );
//           } else {
//             await SDK.CreateRole(
//               {
//                 input,
//               },
//               HEADERS,
//             );
//           }
//         } else {
//           console.log(
//             `Role ${role.code} ignored as no channels found in ${role.channels
//               .map((channel) => channel.code)
//               .join(', ')}`,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for role ${role.code} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.ROLES);
//   }

//   async function importAssets(channel: Channel) {
//     const assets: AssetList = readJson(TypeEnum.ASSETS);

//     for (const asset of assets.items) {
//       try {
//         const id = await FK.getAssetId(asset);

//         if (id) {
//           if (channel.code !== DEFAULT_CODE) {
//             const response = await SDK.AssignAssetsToChannel(
//               {
//                 input: {
//                   assetIds: [id],
//                   channelId: channel.id,
//                 },
//               },
//               getHeadersForDefaultChannel(HEADERS),
//             );
//             console.log(`Asset ${asset.name} assigned to channel`);
//           }
//           // Todo update
//         } else {
//           await createAsset(asset);
//           console.log(`Asset ${asset.name} inserted`);
//         }
//       } catch (e) {
//         console.log(`Error for asset ${asset.name} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.ASSETS);
//   }

//   async function createAsset(asset: Asset) {
//     const url = asset.source;
//     const pathname = path.join(DIRECTORY, new URL(url).pathname);

//     // Create directories in DIRECTORY
//     fs.mkdirSync(path.dirname(pathname), {
//       recursive: true,
//     });
//     // download asset
//     await download.image({
//       url,
//       dest: pathname,
//     });
//     // upload it
//     const input = {
//       file: await fs.createReadStream(pathname),
//       tags: asset.tags ? asset.tags.map((tag) => tag.value) : [],
//     };
//     await SDK.CreateAssets({ input }, HEADERS);
//   }

//   async function importFacets() {
//     const facets: FacetList = readJson(TypeEnum.FACETS);

//     for (const facet of facets.items) {
//       try {
//         const id = await FK.getFacetId(facet);

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreateFacet(
//             {
//               input: {
//                 code: facet.code,
//                 isPrivate: facet.isPrivate,
//                 translations: facet.translations,
//                 values: facet.values.map((value) => ({
//                   code: value.code,
//                   translations: value.translations,
//                 })),
//               },
//             },
//             HEADERS,
//           );
//         }
//         console.log(`Facet ${facet.code} inserted`);
//       } catch (e) {
//         console.log(`Error for facet ${facet.code} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.FACETS);
//   }

//   async function importCollections() {
//     const collections: CollectionList = readJson(TypeEnum.COLLECTIONS);

//     for (const collection of collections.items) {
//       try {
//         const id = await FK.getCollectionId(collection);

//         const input: CreateCollectionInput = {
//           isPrivate: collection.isPrivate,
//           translations: collection.translations,
//           filters: collection.filters
//             ? await Promise.all(
//                 collection.filters.map(await toConfigurableOperationInput),
//               )
//             : [],
//         };

//         input.assetIds = await Promise.all(
//           collection.assets.map(async (asset) =>
//             FK.getAssetIdOrDie(asset, HEADERS),
//           ),
//         );

//         if (collection.parent) {
//           input.parentId = await FK.getCollectionId(collection.parent);
//         }

//         if (collection.featuredAsset) {
//           input.featuredAssetId = await FK.getAssetId(
//             collection.featuredAsset,
//             HEADERS,
//           );
//         }

//         if (id) {
//           throw `Update not yet implemented`;
//         } else {
//           await SDK.CreateCollection(
//             {
//               input,
//             },
//             HEADERS,
//           );
//         }
//       } catch (e) {
//         console.log(`Error for collection ${collection.slug} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.COLLECTIONS);
//   }

//   async function importProducts(channel: Channel) {
//     const products: ProductList = readJson(TypeEnum.PRODUCTS);

//     console.log(`Import ${products.items.length} products ...`);

//     for (const product of products.items) {
//       try {
//         // Create Product input
//         const input: CreateProductInput | UpdateProductInput = {
//           enabled: product.enabled,
//           translations: product.translations,
//           customFields: product.customFields,
//         };

//         input.assetIds = await Promise.all(
//           product.assets.map(async (asset) =>
//             FK.getAssetIdOrDie(asset, HEADERS),
//           ),
//         );

//         input.facetValueIds = product.facetValues
//           ? await Promise.all(
//               product.facetValues.map(async (fv) =>
//                 FK.getFacetValueIdOrDie(fv),
//               ),
//             )
//           : [];

//         if (product.featuredAsset) {
//           input.featuredAssetId = await FK.getAssetIdOrDie(
//             product.featuredAsset,
//             HEADERS,
//           );
//         }

//         // Check if product exists on slug.
//         const id = await FK.getProductId(product);
//         if (id) {
//           if (channel.code !== DEFAULT_CODE) {
//             await SDK.AssignProductsToChannel(
//               {
//                 input: {
//                   productIds: [id],
//                   channelId: channel?.id,
//                   priceFactor: 1,
//                 },
//               },
//               /**
//                * Assign to channel must be set from default channel
//                */
//               getHeadersForDefaultChannel(HEADERS),
//             );
//             console.log(`Product ${product.slug} assigned to channel`);
//           }

//           await SDK.UpdateProduct(
//             {
//               input: { ...input, id },
//             },
//             HEADERS,
//           );
//           console.log(`Product ${product.slug} updated`);
//         } else {
//           await SDK.CreateProduct(
//             {
//               input,
//             },
//             HEADERS,
//           );
//           console.log(`Product ${product.slug} created`);
//         }
//       } catch (e) {
//         console.log(`Error for product ${product.slug} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.PRODUCTS);
//   }

//   async function importProductOptionGroups() {
//     const products: ProductList = readJson(TypeEnum.PRODUCTS);

//     for (const product of products.items) {
//       const productId = await FK.getProductId(product);

//       if (productId && product.optionGroups) {
//         for (const optionGroup of product.optionGroups) {
//           try {
//             // check if exists on code
//             const id = await FK.getProductOptionGroupId(
//               optionGroup,
//               product.slug,
//             );
//             if (id) {
//               const input: UpdateProductOptionGroupInput = {
//                 id: id,
//                 code: optionGroup.code,
//                 translations: optionGroup.translations,
//               };

//               await SDK.UpdateProductOptionGroup(
//                 {
//                   input,
//                 },
//                 HEADERS,
//               );
//             } else {
//               const input = {
//                 code: optionGroup.code,
//                 translations: optionGroup.translations,
//                 options: optionGroup.options.map((option) => ({
//                   code: option.code,
//                   translations: option.translations,
//                 })),
//               };

//               const optionGroupResponse = await SDK.CreateProductOptionGroup(
//                 {
//                   input,
//                 },
//                 HEADERS,
//               );

//               await SDK.AddOptionGroupToProduct(
//                 {
//                   productId: productId,
//                   optionGroupId:
//                     optionGroupResponse.data.createProductOptionGroup.id,
//                 },
//                 HEADERS,
//               );
//             }
//           } catch (e) {
//             console.log(`Error for productOptionGroups ${product.slug} : ${e}`);
//           }
//         }
//       } else {
//         console.log(
//           `Product ${product.slug} id ${product.id} not inserted for variants...`,
//         );
//       }
//     }
//     FK.reset(TypeEnum.PRODUCT_OPTION_GROUPS);
//   }

//   async function importProductVariants() {
//     const products: ProductList = readJson(TypeEnum.PRODUCTS);

//     for (const product of products.items) {
//       try {
//         const productId = await FK.getProductId(product);

//         if (productId) {
//           /**
//            * productVariantIds will contain undefined if productVariant not found with sku
//            * or the current productVariantId.
//            */
//           const productVariantIds = await Promise.all(
//             product.variantList.items.map(async (variant: ProductVariant) =>
//               FK.getProductVariantId(variant),
//             ),
//           );

//           const toCreateProductVariants = product.variantList.items.filter(
//             (variant: ProductVariant, index) => !productVariantIds[index],
//           );

//           const toUpdateProductVariants = product.variantList.items.filter(
//             (variant: ProductVariant, index) => productVariantIds[index],
//           );

//           if (toCreateProductVariants.length) {
//             const input = await Promise.all(
//               toCreateProductVariants.map(async (variant: ProductVariant) =>
//                 toCreateProductVariantInput(variant, productId, product.slug),
//               ),
//             );

//             await SDK.CreateProductVariants({ input }, HEADERS);

//             console.log(
//               `Create ${toCreateProductVariants.length} productVariants for product ${product.slug}`,
//             );
//           }

//           if (toUpdateProductVariants.length) {
//             const input = await Promise.all(
//               toUpdateProductVariants.map(
//                 async (variant: ProductVariant, index) => {
//                   const productVariantId = productVariantIds.filter((id) => id)[
//                     index
//                   ];
//                   if (productVariantId) {
//                     return await toUpdateProductVariantInput(
//                       variant,
//                       productVariantId,
//                     );
//                   }
//                   throw `Missing id to update ${variant.sku} `;
//                 },
//               ),
//             );
//             await SDK.UpdateProductVariants({ input }, HEADERS);
//             console.log(
//               `Update ${toUpdateProductVariants.length} productVariants for product ${product.slug}`,
//             );
//           }
//         }
//       } catch (e) {
//         console.log(`Error for product ${product.slug} : ${e}`);
//       }
//     }
//     FK.reset(TypeEnum.PRODUCT_VARIANTS);
//   }

//   async function toProductVariantInput(
//     variant: ProductVariant,
//   ): Promise<Common<CreateProductVariantInput, UpdateProductVariantInput>> {
//     const pv: Common<CreateProductVariantInput, UpdateProductVariantInput> = {
//       translations: variant.translations,
//       sku: variant.sku,
//       price: variant.priceWithTax,
//       customFields: variant.customFields,
//       taxCategoryId: await FK.getTaxCategoryId(variant.taxCategory),
//       facetValueIds: await Promise.all(
//         variant.facetValues.map(async (fv) => FK.getFacetValueIdOrDie(fv)),
//       ),
//       assetIds: await Promise.all(
//         variant.assets.map(async (asset) => FK.getAssetIdOrDie(asset, HEADERS)),
//       ),
//       featuredAssetId: undefined,
//       outOfStockThreshold: variant.outOfStockThreshold,
//       stockOnHand: variant.stockOnHand,
//       trackInventory: variant.trackInventory,
//       useGlobalOutOfStockThreshold: variant.useGlobalOutOfStockThreshold,
//     };

//     if (variant.featuredAsset) {
//       pv.featuredAssetId = await FK.getAssetIdOrDie(
//         variant.featuredAsset,
//         HEADERS,
//       );
//     }

//     return pv;
//   }

//   async function toUpdateProductVariantInput(
//     variant: ProductVariant,
//     id: string,
//   ): Promise<UpdateProductVariantInput> {
//     const pv: UpdateProductVariantInput = {
//       ...(await toProductVariantInput(variant)),
//       enabled: variant.enabled,
//       id: id,
//     };

//     return pv;
//   }

//   async function toCreateProductVariantInput(
//     variant: ProductVariant,
//     productId: string,
//     productSlug: string,
//   ): Promise<CreateProductVariantInput> {
//     const pv: CreateProductVariantInput = {
//       ...(await toProductVariantInput(variant)),
//       productId: productId,
//       optionIds: variant.options
//         ? await Promise.all(
//             variant.options.map(async (option) =>
//               FK.getProductOptionIdOrDie(option, productSlug),
//             ),
//           )
//         : [],
//     };

//     return pv;
//   }

//   async function toConfigurableOperationInput(
//     operation: ConfigurableOperation,
//   ): Promise<ConfigurableOperationInput> {
//     let args = operation.args;

//     if (operation.code === 'facet-value-filter') {
//       args = await Promise.all(
//         operation.args.map(async (arg) => {
//           let argValue = arg.value;
//           if (arg.name === 'facetValueIds') {
//             argValue = await toValueInput(arg.value);
//           }
//           return { name: arg.name, value: argValue };
//         }),
//       );
//     }
//     return { code: operation.code, arguments: args };
//   }

//   async function toValueInput(argValue: string): Promise<string> {
//     const values = await Promise.all(
//       JSON.parse(argValue).map(
//         async (val: string) =>
//           await FK.getFacetValueIdFromOldId(DIRECTORY, val),
//       ),
//     );
//     return JSON.stringify(values);
//   }

// }
