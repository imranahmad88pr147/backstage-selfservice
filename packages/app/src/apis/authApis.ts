import {
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
} from '@backstage/core-plugin-api';

import { OAuth2 } from '@backstage/core-app-api';

import {
  createApiRef,
  configApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
  ApiBlueprint,
} from '@backstage/frontend-plugin-api';

export const entraAuthApiRef = createApiRef<
  OpenIdConnectApi & // This api provides OIDC functionality
    ProfileInfoApi & // This is used by the frontend that gives logged in user info like displayName from org.yaml
    BackstageIdentityApi & // Frontend can access backstage idenitity of current logged-in user 
    SessionApi // This represents authentication session. The signOut() capability comes from the authentication/session side of the API.
>().with({
  id: 'auth.entra',
});

export const entraAuthApi = ApiBlueprint.make({
  name: 'entra',
  params: defineParams =>
    defineParams({
      api: entraAuthApiRef,

      deps: {
        discoveryApi: discoveryApiRef,
        oauthRequestApi: oauthRequestApiRef,
        configApi: configApiRef,
      },

      factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
        OAuth2.create({
          configApi,
          discoveryApi,
          oauthRequestApi,

          environment: configApi.getOptionalString(
            'auth.environment',
          ),
//   There are actually two pieces here: Discovery API finds the backend base URL, while Backstage's auth API knows the /api/auth/oidc path from the provider ID.
          provider: {
            id: 'oidc',
            title: 'Microsoft Entra ID',
            icon: () => null,
          },
  //        Above connects your frontend authentication API to the backend provider you registered:

          defaultScopes: [ // These are the scopes that this api expects to recieve these.
            'openid', // Authenticate me using OIDC
            'profile', // Give me basic user profile information
            'email', // Give me email-related information
            'offline_access', // This asks the identity provider for the ability to obtain a refresh token, allowing the application to maintain authentication without requiring the user to log in again whenever the short-lived access token expires.
          ],
        }),
    }),
});