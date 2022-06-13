import { VendureSyncConfig } from './config';
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
import { VendureSyncAsset } from './types/asset';

const DEFAULT = 'default';

export async function vendureImport(config: VendureSyncConfig) {
  /**
   * Import global settings
   */
  const zoneSync = await importType(new VendureSyncZone(config));
  await importType(new VendureSyncCountry(config));
  const taxCategorySync = await importType(new VendureSyncTaxCategory(config));
  // taxRate has dependencies on taxCategory and zone
  await importType(new VendureSyncTaxRate(config, taxCategorySync, zoneSync));

  const channelSync = new VendureSyncChannel(config, zoneSync);

//  const baseSourceDir = config.sourceDir;
  for (const channel of config.getChannels()) {
    config.setChannel(channel)

    await importOneType(channelSync, channel);
    await importType(new VendureSyncPaymentMethod(config));
    await importType(new VendureSyncShippingMethod(config));
    await importType(new VendureSyncAsset(config));
  }

  config.unsetChannel();
  /**
   * Import roles after inserting channels
   */
  await importType(new VendureSyncRole(config, channelSync));
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
  const filePath = vendureSyncType.config.getFilePath(vendureSyncType.name);
  console.log(`Import ${filePath}`);

  const types: U[] = await vendureSyncType.config.readJson(vendureSyncType.name);
  for (const type of types) {
    await importOneType(vendureSyncType, type);
  }
  return vendureSyncType;
}

async function importOneType<U, T extends VendureSyncAbstract<U>>(
  vendureSyncType: T,
  only: U,
): Promise<T> {
  const displayString = `${vendureSyncType.name} ${vendureSyncType.key(only)}`;

  try {
    const result = await vendureSyncType.import(only);
    console.log(`${result} ${displayString}`);
  } catch (e) {
    console.log(`Error for ${displayString} : ${e}`);
  }
  return vendureSyncType;
}

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
