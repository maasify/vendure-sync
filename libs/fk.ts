import path from 'path';
import { TypeEnum } from './type.enum';
import {
  Asset,
  Channel,
  Collection,
  Country,
  Facet,
  FacetList,
  FacetValue,
  PaymentMethod,
  Product,
  ProductOption,
  ProductOptionGroup,
  ProductVariant,
  Role,
  Sdk,
  ShippingMethod,
  TaxCategory,
  TaxRate,
  Zone,
} from '../generated';
import { VendureHeader } from './vendure.header';

export type EntityKey = {
  id: string;
  key: string;
};

export class Fk {
  fks: { [key in TypeEnum]?: EntityKey[] } = {};
  sdk: Sdk;
  headers: VendureHeader;

  constructor(sdk: Sdk) {
    this.sdk = sdk;
  }

  public setHeaders(headers: VendureHeader): Fk {
    this.headers = { ...headers };
    return this;
  }

  /**
   * Search for id in foreign keys from given key.
   * Use typed functions below instead.
   */
  public getId(type: TypeEnum, key: string): string | undefined {
    if (type in this.fks) {
      const result = this.fks[type]!.find((entity) => entity.key === key);
      if (result) {
        return result.id;
      }
      return undefined;
    }
    throw `FK for ${type} empty. Please init.`;
  }

  /**
   * Reset cache for given type
   */
  public reset(type: TypeEnum) {
    if (type in this.fks) {
      this.fks[type] = undefined;
    }
    return this;
  }

  /**
   * Get AssetId.
   * A header can be given here to force search in a
   * given channel
   */
  public async getAssetId(asset: Asset, headers?: VendureHeader) {
    // Mandatory attributes in asset
    this._checkInput(asset, ['name']);

    await this._initEntities(TypeEnum.ASSETS, this.initAssets, headers);

    return this.getId(TypeEnum.ASSETS, asset.name);
  }

  public async getAssetIdOrDie(asset: Asset, headers?: VendureHeader) {
    const result = await this.getAssetId(asset, headers);
    if (result) {
      return result;
    }
    throw `Get Id for asset ${asset.name} not found`;
  }

  public async initAssets(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.AssetKeys(undefined, headers)).data.assets.items.map(
      (asset) => ({ id: asset.id, key: asset.name }),
    );
  }

  public async getFacetId(facet: Facet) {
    // Mandatory attributes in asset
    this._checkInput(facet, ['code']);

    await this._initEntities(TypeEnum.FACETS, this.initFacets);

    return this.getId(TypeEnum.FACETS, facet.code);
  }

  public async initFacets(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.FacetKeys(undefined, headers)).data.facets.items.map(
      (facet) => ({
        id: facet.id,
        key: facet.code,
      }),
    );
  }

  public async getFacetValueId(fv: FacetValue) {
    // Mandatory attributes in asset
    this._checkInput(fv, ['id', 'code', 'facet']);

    await this._initEntities(TypeEnum.FACET_VALUES, this.initFacetValues);

    return this.getId(TypeEnum.FACET_VALUES, `${fv.facet.code}:${fv.code}`);
  }

  public async getFacetValueIdOrDie(fv: FacetValue) {
    const result = await this.getFacetValueId(fv);
    if (result) {
      return result;
    }
    throw `Get Id for facetValue '${fv.facet.code}:${fv.code}' not found`;
  }

  /**
   * Used in collection filters : we only have the old id ...
   * @param oldId
   */
  public async getFacetValueIdFromOldId(directory: string, oldId: string) {
    const facets: FacetList = require(path.join(directory, 'facets.json'));

    const facetValue = facets.items
      .flatMap((facet: Facet) =>
        facet.values.map(
          (fv) => ({ id: fv.id, code: fv.code, facet: facet } as FacetValue),
        ),
      )
      .find((fv) => fv.id === oldId);

    if (facetValue) {
      return this.getFacetValueIdOrDie(facetValue);
    }
  }

  public async initFacetValues(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (
      await sdk.FacetValueKeys(undefined, headers)
    ).data.facets.items.flatMap((facet) =>
      facet.values.map((fv) => ({
        id: fv.id,
        key: `${facet.code}:${fv.code}`, // use facet code to ensure unicity (not really...)
      })),
    );
  }

  public async getCollectionId(collection: Collection) {
    // Mandatory attributes in asset
    this._checkInput(collection, ['slug']);

    await this._initEntities(TypeEnum.COLLECTIONS, this.initCollections);

    return this.getId(TypeEnum.COLLECTIONS, collection.slug);
  }

  public async initCollections(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (
      await sdk.CollectionKeys(undefined, headers)
    ).data.collections.items.map((collection) => ({
      id: collection.id,
      key: collection.slug,
    }));
  }

  public async getProductId(product: Product) {
    // Mandatory attributes in asset
    this._checkInput(product, ['slug']);

    await this._initEntities(TypeEnum.PRODUCTS, this.initProducts);

    return this.getId(TypeEnum.PRODUCTS, product.slug);
  }

  public async initProducts(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.ProductKeys(undefined, headers)).data.products.items.map(
      (product) => ({
        id: product.id,
        key: product.slug,
      }),
    );
  }

  public async getProductVariantId(variant: ProductVariant) {
    // Mandatory attributes in asset
    this._checkInput(variant, ['sku']);

    await this._initEntities(
      TypeEnum.PRODUCT_VARIANTS,
      this.initProductVariants,
    );

    return this.getId(TypeEnum.PRODUCT_VARIANTS, variant.sku);
  }

  public async initProductVariants(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (
      await sdk.ProductVariantKeys(undefined, headers)
    ).data.productVariants.items.map((variant) => ({
      id: variant.id,
      key: variant.sku,
    }));
  }

  public async getCountryId(country: Country) {
    // Mandatory attributes in asset
    this._checkInput(country, ['code']);

    await this._initEntities(TypeEnum.COUNTRIES, this.initCountries);

    return this.getId(TypeEnum.COUNTRIES, country.code);
  }

  public async initCountries(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.CountryKeys(undefined, headers)).data.countries.items.map(
      (country) => ({
        id: country.id,
        key: country.code,
      }),
    );
  }

  public async getZoneId(zone: Zone) {
    // Mandatory attributes in asset
    this._checkInput(zone, ['name']);
    // fetch entities for given type
    await this._initEntities(TypeEnum.ZONES, this.initZones);
    // Search for key in cache and return id
    return this.getId(TypeEnum.ZONES, zone.name);
  }

  public async getZoneIdOrDie(zone: Zone): Promise<string> {
    const result = await this.getZoneId(zone);
    if (result) {
      return result;
    }
    throw `Get Id for zone ${zone.name} not found`;
  }

  public async initZones(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    const result = (await sdk.ZoneKeys(undefined, headers)).data.zones.map(
      (zone) => ({
        id: zone.id,
        key: zone.name,
      }),
    );

    return result;
  }

  public async getTaxCategoryId(taxCategory: TaxCategory) {
    // Mandatory attributes in asset
    this._checkInput(taxCategory, ['name']);

    await this._initEntities(TypeEnum.TAX_CATEGORIES, this.initTaxCategories);

    return this.getId(TypeEnum.TAX_CATEGORIES, taxCategory.name);
  }

  public async getTaxCategoryIdOrDie(
    taxCategory: TaxCategory,
  ): Promise<string> {
    const result = await this.getTaxCategoryId(taxCategory);
    if (result) {
      return result;
    }
    throw `Get Id for taxCategory ${taxCategory.name} not found`;
  }

  public async initTaxCategories(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    const result = (
      await sdk.TaxCategoryKeys(undefined, headers)
    ).data.taxCategories.map((taxCategory) => ({
      id: taxCategory.id,
      key: taxCategory.name,
    }));

    return result;
  }

  public async getTaxRateId(taxRate: TaxRate) {
    // Mandatory attributes in asset
    this._checkInput(taxRate, ['name']);

    await this._initEntities(TypeEnum.TAX_RATES, this.initTaxRates);

    return this.getId(TypeEnum.TAX_RATES, taxRate.name);
  }

  public async initTaxRates(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.TaxRateKeys(undefined, headers)).data.taxRates.items.map(
      (taxRate) => ({
        id: taxRate.id,
        key: taxRate.name,
      }),
    );
  }

  public async getPaymentMethodId(pm: PaymentMethod) {
    // Mandatory attributes in asset
    this._checkInput(pm, ['code']);

    await this._initEntities(TypeEnum.PAYMENT_METHODS, this.initPaymentMethods);

    return this.getId(TypeEnum.PAYMENT_METHODS, pm.code);
  }

  public async initPaymentMethods(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (
      await sdk.PaymentMethodKeys(undefined, headers)
    ).data.paymentMethods.items.map((paymentMethod) => ({
      id: paymentMethod.id,
      key: paymentMethod.code,
    }));
  }

  public async getShippingMethodId(sm: ShippingMethod) {
    // Mandatory attributes in asset
    this._checkInput(sm, ['code']);

    // todo init ShippingMethods if not done
    await this._initEntities(
      TypeEnum.SHIPPING_METHODS,
      this.initShippingMethods,
    );

    return this.getId(TypeEnum.SHIPPING_METHODS, sm.code);
  }

  public async initShippingMethods(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (
      await sdk.ShippingMethodKeys(undefined, headers)
    ).data.shippingMethods.items.map((shippingMethod) => ({
      id: shippingMethod.id,
      key: shippingMethod.code,
    }));
  }

  public async getRoleId(role: Role) {
    // Mandatory attributes in role
    this._checkInput(role, ['code']);

    await this._initEntities(TypeEnum.ROLES, this.initRoles);

    return this.getId(TypeEnum.ROLES, role.code);
  }

  public async initRoles(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.RoleKeys(undefined, headers)).data.roles.items.map(
      (role) => ({
        id: role.id,
        key: role.code,
      }),
    );
  }

  public async getChannelId(channel: Channel) {
    // Mandatory attributes in asset
    this._checkInput(channel, ['code']);

    // todo init Channels if not done
    await this._initEntities(TypeEnum.CHANNELS, this.initChannels);

    return this.getId(TypeEnum.CHANNELS, channel.code);
  }

  public async initChannels(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    return (await sdk.ChannelKeys(undefined, headers)).data.channels.map(
      (channel) => ({
        id: channel.id,
        key: channel.code,
      }),
    );
  }

  public async getProductOptionGroupId(
    pog: ProductOptionGroup,
    productSlug: string,
  ) {
    // Mandatory attributes in asset
    this._checkInput(pog, ['code']);

    await this._initEntities(
      TypeEnum.PRODUCT_OPTION_GROUPS,
      this.initProductOptionGroups,
    );

    return this.getId(
      TypeEnum.PRODUCT_OPTION_GROUPS,
      `${productSlug}:${pog.code}`,
    );
  }

  public async initProductOptionGroups(
    sdk: Sdk,
    headers: VendureHeader,
  ): //    productId: string,
  Promise<EntityKey[]> {
    return (
      await sdk.ProductOptionKeys(undefined, headers)
    ).data.products.items.flatMap((product) =>
      product.optionGroups.map((pog) => ({
        id: pog.id,
        key: `${product.slug}:${pog.code}`,
      })),
    );
  }

  public async getProductOptionId(po: ProductOption, productSlug: string) {
    // Mandatory attributes in asset
    this._checkInput(po, ['code', 'group']);

    await this._initEntities(TypeEnum.PRODUCT_OPTIONS, this.initProductOptions);

    return this.getId(
      TypeEnum.PRODUCT_OPTIONS,
      `${productSlug}:${po.group.code}:${po.code}`,
    );
  }

  public async getProductOptionIdOrDie(po: ProductOption, productSlug: string) {
    const result = await this.getProductOptionId(po, productSlug);
    if (result) {
      return result;
    }
    throw `Get Id for productOption ${productSlug}:${po.group.code}:${po.code} not found`;
  }

  public async initProductOptions(
    sdk: Sdk,
    headers: VendureHeader,
  ): Promise<EntityKey[]> {
    const response = await sdk.ProductOptionKeys(undefined, headers);

    const result = response.data.products.items.flatMap((product) =>
      product.optionGroups.flatMap((pog) =>
        pog.options.map((po) => ({
          id: po.id,
          key: `${product.slug}:${pog.code}:${po.code}`,
        })),
      ),
    );
    return result;
  }

  private _checkInput(object: Record<string, any>, keys: string[]) {
    if (!keys.every((key) => key in object)) {
      throw `Missing keys, must have ${keys.join(', ')}`;
    }
  }

  private async _initEntities(
    type: TypeEnum,
    initFn: (sdk: Sdk, headers: VendureHeader) => Promise<EntityKey[]>,
    headers?: VendureHeader,
  ) {
    if (!(type in this.fks) || typeof this.fks[type] === 'undefined') {
      this.fks[type] = await initFn(this.sdk, headers ?? this.headers);
    }
  }
}
