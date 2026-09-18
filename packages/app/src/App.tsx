import { createApp } from '@backstage/frontend-defaults';
import userSettingsModule from '@backstage/plugin-app-module-user-settings';

import { navModule } from './modules/nav';
import { homeModule } from './modules/home';

import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';

import { createFrontendModule } from '@backstage/frontend-plugin-api';

import {
  entraAuthApiRef,
  entraAuthApi,
} from './apis/authApis';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
// This is built-in SignIn page plugin where we just have to pass provider prop inside it along with apiRef and message. Under the hood it has button implementation onClick() function.
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
    navModule,
    homeModule,
    userSettingsModule,

    createFrontendModule({
      pluginId: 'app',
      extensions: [entraAuthApi, signInPage],
    }),
  ],
});