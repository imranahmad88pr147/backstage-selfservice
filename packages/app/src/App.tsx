import { createApp } from '@backstage/frontend-defaults';

import catalogPlugin from '@backstage/plugin-catalog/alpha';

import { navModule } from './modules/nav';
import { homeModule } from './modules/home';

// import {
//   OpenIdConnectApi,
//   ProfileInfoApi,
//   BackstageIdentityApi,
//   SessionApi,
// } from '@backstage/core-plugin-api';

// import { OAuth2 } from '@backstage/core-app-api';

import { SignInPageBlueprint } from '@backstage/plugin-app-react';

import { SignInPage } from '@backstage/core-components';

import {
  createFrontendModule,
} from '@backstage/frontend-plugin-api';

// import {
//   createApiRef,
//   createFrontendModule,
//   configApiRef,
//   discoveryApiRef,
//   oauthRequestApiRef,
//   ApiBlueprint,
// } from '@backstage/frontend-plugin-api';

import {
  entraAuthApiRef,
  entraAuthApi,
} from './apis/authApis';

// const entraAuthApiRef = createApiRef<
//   OpenIdConnectApi &
//     ProfileInfoApi &
//     BackstageIdentityApi &
//     SessionApi
// >().with({
//   id: 'auth.entra',
// });


// const entraAuthApi = ApiBlueprint.make({
//   name: 'entra',
//   params: {
//     defineParams =>
//       defineParams({
//         api: entraAuthApiRef,

//         deps: {
//           discoveryApi: discoveryApiRef,
//           oauthRequestApi: oauthRequestApiRef,
//           configApi: configApiRef,
//         },

//         factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
//           OAuth2.create({
//             configApi,
//             discoveryApi,
//             oauthRequestApi,

//             environment: configApi.getOptionalString(
//               'auth.environment',
//             ),

//             provider: {
//               id: 'oidc',
//               title: 'Microsoft Entra ID',
//               icon: () => null,
//             },

//             defaultScopes: ['openid', 'profile', 'email', 'offline_access'],
//           }),
//       }),
//   },
// });


const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
        <SignInPage
          {...props}
          provider={{
            id: 'entra-auth-provider',
            title: 'Microsoft Entra ID',
            message: 'Sign in using Microsoft Entra ID',
            apiRef: entraAuthApiRef,
          }}
        />
      ),
  },
});


export default createApp({
  features: [
    catalogPlugin,
    navModule,
    homeModule,

    createFrontendModule({
      pluginId: 'app',
      extensions: [entraAuthApi, signInPage],
    }),
  ],
});