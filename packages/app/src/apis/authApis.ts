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
  OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
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

          defaultScopes: [
            'openid',
            'profile',
            'email',
            'offline_access',
          ],
        }),
    }),
});