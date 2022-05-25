import axios from 'axios';
import dotenv from 'dotenv';
import { GraphQLClient } from 'graphql-request';
import { getSdk, Sdk } from '../generated';
import { InstanceEnum } from './instance.enum';
import { VendureHeader } from './vendure.header';
const TOKEN_PREFIX = 'token:';

dotenv.config();

/**
 * This structure stores
 * config for SOURCE and DESTINATION
 */
export const COMMON = {
  [InstanceEnum.SOURCE]: {
    sdk: () => {
      const client = new GraphQLClient(
        `${process.env.VENDURE_SOURCE_URI}/admin-api`,
      );
      return getSdk(client);
    },
    keycloakUri: `${process.env.VENDURE_SOURCE_KEYCLOAK_URI}/protocol/openid-connect/token`,
    clientId: `${process.env.VENDURE_SOURCE_CLIENT_ID}`,
    clientSecret: `${process.env.VENDURE_SOURCE_CLIENT_SECRET}`,
    token: `${process.env.VENDURE_SOURCE_TOKEN}`,
  },
  [InstanceEnum.DESTINATION]: {
    sdk: () => {
      const client = new GraphQLClient(
        `${process.env.VENDURE_DESTINATION_URI}/admin-api`,
      );
      return getSdk(client);
    },
    keycloakUri: `${process.env.VENDURE_DESTINATION_KEYCLOAK_URI}/protocol/openid-connect/token`,
    clientId: `${process.env.VENDURE_DESTINATION_CLIENT_ID}`,
    clientSecret: `${process.env.VENDURE_DESTINATION_CLIENT_SECRET}`,
    token: `${process.env.VENDURE_DESTINATION_TOKEN}`,
  },
};

/**
 * Get Keycloak token from COMMON
 * keycloakUri
 * clientId
 * clientSecret
 *
 * @returns string
 */
export async function getToken(instance: InstanceEnum): Promise<string> {
  /**
   * If defined in env use it !
   */
  if (COMMON[instance].token && COMMON[instance].token !== 'undefined') {
    return `${TOKEN_PREFIX}${COMMON[instance].token}`;
  }

  const jwtKeycloak: { access_token: string; expires_in: number } = (
    await axios.post(
      COMMON[instance].keycloakUri,
      new URLSearchParams({
        client_id: COMMON[instance].clientId,
        client_secret: COMMON[instance].clientSecret,
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

/**
 * Authenticate to Vendure Admin API
 */
export async function authenticate(
  sdk: Sdk,
  token: string,
): Promise<VendureHeader> {
  /**
   * If defined in env use it !
   */
  if (token.startsWith(TOKEN_PREFIX)) {
    return {
      authorization: `Bearer ${token.replace(TOKEN_PREFIX, '')}`,
    };
  }

  const response = await sdk.Authenticate({ token });
  return {
    authorization: `Bearer ${response.headers.get('vendure-auth-token')}`,
  };
}

/**
 * With a given header, get the same without vendure-token
 */
export function getHeadersForDefaultChannel(
  headers: VendureHeader,
): VendureHeader {
  return { authorization: headers.authorization };
}
