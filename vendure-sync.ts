import * as path from 'path';
import axios from 'axios';
import { Command } from 'commander';
//import { vendureExport } from './libs/vendure.export';
//import { vendureImport } from './libs/vendure.import';
import { GraphQLClient } from 'graphql-request';
import { getSdk, Sdk } from './generated';
import { VendureSyncConfig } from 'libs/config.interface';
import { VendureSyncHeader } from 'libs/header.type';

const TOKEN_PREFIX = 'token:';

type VendureExportOptions = {
  url: string; // is required
  directory: string; // has default value
  token?: string;
  keycloak?: string;
};

type JwtToken = {
  access_token: string;
  expires_in: number;
};

const program = new Command();
program
  .description('Command line tool to import / export Vendure catalog')
  .version(require('./package.json').version);

program
  .command('export')
  .description('Export Vendure catalog and settings into export/ directory')
  .argument('<url>', 'Vendure url to export')
  .option('-d, --directory <directory>', 'Directory to store exported files', './export')
  .option('-t, --token <token>', 'Vendure token to use')
  .option('-k, --keycloak <keycloak>', 'https://clientId:clientSecret@keycloak.mydomain.io')
  .action(async (url: string, options) => {
    console.log(await getVendureSyncConfig({ ...options, url }));

    //    return vendureExport(await getVendureSyncConfig(program.opts()));
  });

program
  .command('import <channel>')
  .description('Import Vendure data from export/ directory')
  .action(async (channel: string) => {
    //    return vendureImport(`${__dirname}/export`, channel);
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
    sourceDir: path.normalize(options.directory),
    sdk,
    headers: await (() => {
      // Token has the priority
      if (options.token) {
        return {
          authorization: `Bearer ${options.token}`,
        } as VendureSyncHeader;
      }
      if (options.keycloak) {
        return authenticate(options.keycloak, sdk);
      }

      return program.error('You must authenticate using --token or --keycloak option');
    })(),
  };
}

/**
 * Authenticate to Vendure Admin API
 */
async function authenticate(keycloakUri: string, sdk: Sdk): Promise<VendureSyncHeader> {
  const url = new URL(keycloakUri);
  const clientId = url.username;
  const clientPassword = url.password;
  url.username = '';
  url.password = '';
  const endpoint = url.toString();

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

  const response = await sdk.Authenticate({ token: jwtKeycloak.access_token });
  return {
    authorization: `Bearer ${response.headers.get('vendure-auth-token')}`,
  };
}