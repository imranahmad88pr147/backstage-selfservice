import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { stringifyEntityRef } from '@backstage/catalog-model';

const customOidcProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-oidc-provider',

  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },

      async init({ providers }) {
        providers.registerProvider({
          providerId: 'oidc',

          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,

            async signInResolver(info, ctx) {
              const claims =
                info.result.fullProfile.tokenset.claims();

              const preferredUsername =
                claims.preferred_username;
              const oid = claims.oid as string;

              if (!preferredUsername) {
                throw new Error(
                  'Login failed: OIDC token does not contain preferred_username',
                );
              }

              if (!oid) {
                throw new Error(
                  'Login failed: OIDC token does not contain oid',
                );
              }

              console.log(
                'OIDC preferred_username:',
                preferredUsername,
              );

              console.log('OIDC oid:', oid);

              const catalogUser = await ctx.findCatalogUser({
                annotations: {
                  'microsoft.com/user-oid': oid,
                },
              });

              if (!catalogUser) {
                throw new Error(
                  `No Backstage user found for Entra OID: ${oid}`,
                );
              }

              return ctx.signInWithCatalogUser({
                entityRef: stringifyEntityRef(catalogUser.entity),
              });

            //   return ctx.signInWithCatalogUser({
            //     entityRef: {
            //       kind: 'User',
            //       namespace: 'default',
            //       name: 'imran',
            //     },
            //   });
            
            },
          }),
        });
      },
    });
  },
});

export default customOidcProvider;