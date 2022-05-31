import * as path from 'path';
import axios from 'axios';
import { Command } from 'commander';
import { vendureExport } from './libs/vendure.export';
import { vendureImport } from './libs/vendure.import';
import { GraphQLClient } from 'graphql-request';
import { getSdk, Sdk } from './generated';
import { VendureSyncConfig } from './libs/config.interface';
import { VendureSyncHeader } from './libs/header.type';

const TOKEN_PREFIX = 'token:';

type VendureExportOptions = {
  url: string; // is required
  directory: string; // has default value
  token?: string;
  keycloak?: string;
  channel?: string;
};

type JwtToken = {
  access_token: string;
  expires_in: number;
};

const program = new Command();
program
  .description('Command line tool to import / export Vendure catalog')
  .version(require('./package.json').version)

program
  .command('export')
  .description('Export Vendure catalog and settings into export/ directory')
  .argument('<url>', 'Vendure url to export')
  .option('-d, --directory <directory>', 'Location of the Vendure export files', './export')
  .option('-t, --token <token>', 'Vendure token to use')
  .option('-k, --keycloak <keycloak>', 'https://clientId:clientSecret@keycloak.mydomain.io')
  .option('-c, --channel <channel>', 'Channel to handle. All if undefined')
  .action(async (url: string, options) => {
    vendureExport(await getVendureSyncConfig({ ...options, url }));
  });

program
  .command('import')
  .description('Import Vendure data from export/ directory')
  .argument('<url>', 'Vendure url to import to')
  .option('-d, --directory <directory>', 'Location of the Vendure export files', './export')
  .option('-t, --token <token>', 'Vendure token to use')
  .option('-k, --keycloak <keycloak>', 'https://clientId:clientSecret@keycloak.mydomain.io')
  .option('-c, --channel <channel>', 'Channel to handle. All if undefined')
  .action(async (url: string, options) => {
    vendureImport(await getVendureSyncConfig({ ...options, url }));
  });

program.parse(process.argv);

async function getVendureSyncConfig(options: VendureExportOptions): Promise<VendureSyncConfig> {
  // Get Grapqhl SDK from url
  const sdk = await (async () => {
    const client = new GraphQLClient(
      options.url + (options.url.endsWith('/') ? '' : '/') + 'admin-api',
    );
    return getSdk(client);
  })();

  return {
    sourceDir: path.resolve(options.directory),
    sdk,
    headers: await (async () => {
      // Token has the priority
      if (options.token) {
        return {
          authorization: `Bearer ${options.token}`,
        } as VendureSyncHeader;
      }
      if (options.keycloak) {
        const token = await authenticateKeycloak(options.keycloak);
        return authenticate(sdk, token);
      }

      return program.error('You must authenticate using --token or --keycloak option');
    })(),
  };
}

/**
 * Authenticate to Vendure Admin API
 */
async function authenticate(sdk: Sdk, token: string): Promise<VendureSyncHeader> {
  const response = await sdk.Authenticate({ token: token });
  return {
    authorization: `Bearer ${response.headers.get('vendure-auth-token')}`,
  };
}

/**
 * Authenticate to Keycloak using client_id & client_secret
 */
async function authenticateKeycloak(keycloakUri: string): Promise<string> {
  const url = new URL(keycloakUri);
  const clientId = url.username;
  const clientPassword = url.password;
  url.username = '';
  url.password = '';
  const endpoint = url.toString();

  if (!clientId || !clientPassword || !endpoint) {
    return program.error(
      `Url ${keycloakUri} must be as https://clientId:clientSecret@auth.mydomain.com/auth/realms/myrealm`,
    );
  }

  const jwtKeycloak: JwtToken = (
    await axios.post(
      endpoint + (endpoint.endsWith('/') ? '' : '/') + 'protocol/openid-connect/token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientPassword,
        grant_type: 'client_credentials',
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    )
  ).data;

  return jwtKeycloak.access_token;
}
