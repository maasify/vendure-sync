# Vendure-sync

Script to export catalog and settings data from a Vendure instance to a local archive
and import the local archive into another Vendure instance.

Because it uses API, both Vendure instances can be distant.

## Usage

```bash
# to export all settings and catalog
vendure-sync export
# to import settings in default channel
vendure-cli import default
# to import catalog in mulhouse channel
vendure-cli import mulhouse
```

Configuration is read from environment variables defined in `.env` file :

```env
VENDURE_SOURCE_URI=https://vendure.staging.maasify.io
VENDURE_SOURCE_CLIENT_ID=shop-api
VENDURE_SOURCE_CLIENT_SECRET=mybus
VENDURE_SOURCE_KEYCLOAK_URI=https://auth.staging.maasify.io/auth/realms/maasify

VENDURE_DESTINATION_URI=http://localhost:3000
VENDURE_DESTINATION_TOKEN=abcder
```

* `vendure-cli export` uses `VENDURE_SOURCE_*` variables.
* `vendure-cli import` uses `VENDURE_DESTINATION_*` variables.

To authentify 2 ways are available :

* with `CLIENT_ID`, `CLIENT_SECRET` AND `KEYCLOAK_URI`
* or with `TOKEN`


## Technical details

To understand how it works, the local archive is important. In `export\` :

* export
  * __default_channel__
    * assets.json
    * collections.json
    * facets.json
    * products.json
  * mulhouse
    * assets.json
    * collections.json
    * facets.json
    * products.json
  * ...
  * channels.json
  * countries.json
  * paymentMethods.json
  * shippingMethods.json
  * taxCategories.json
  * taxRates.json
  * zones.json

Settings (channels, countries, zones ...) are stored in export `directory`.
Then all `catalogs` are stored in a directory (assets, collections, facets, products)

The `__default_channel__` contains **ALL** assets, collections, facets and products.
If you use multiple channels, it is not needed to import `__default_channel__`
since Vendure duplicates all ressources into default.

```bash
# to import settings in default channel
vendure-cli import default
# to import catalog in default channel
vendure-cli import __default_channel__
```

## Behavior

* only new entities are created
* update is implemented only on channels, products & productVariants
* for `products` and `assets`, existing entities (in default channel) are assigned to new channel
