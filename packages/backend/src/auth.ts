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
              console.log('OIDC claims:', claims);

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

              // Read the App Roles assigned by Microsoft Entra ID.
              const roles = Array.isArray(claims.roles)
                ? claims.roles.filter(
                    (role): role is string =>
                      typeof role === 'string',
                  )
                : [];

              console.log('Entra roles:', roles);

              // Map the Entra App Role to a Backstage authorization group.
              const roleOwnershipEntityRefs: string[] = [];

              if (roles.includes('backstage.admin')) {
                roleOwnershipEntityRefs.push(
                  'group:default/backstage-admins',
                );
              }

              if (roles.includes('backstage.developer')) {
                roleOwnershipEntityRefs.push(
                  'group:default/backstage-developers',
                );
              }

              if (roleOwnershipEntityRefs.length === 0) {
                throw new Error(
                  'Login failed: user does not have a recognized Backstage App Role',
                );
              }

              console.log(
                'Backstage role refs:',
                roleOwnershipEntityRefs,
              );

              // Resolve the user's normal Backstage ownership references
              // from their Catalog entity.
              const { ownershipEntityRefs } =
                await ctx.resolveOwnershipEntityRefs(
                  catalogUser.entity,
                );

              console.log(
                'Catalog ownership refs:',
                ownershipEntityRefs,
              );

              // Combine the normal Catalog ownership references
              // with the authorization role reference.
              const allOwnershipEntityRefs = [
                ...ownershipEntityRefs,
                ...roleOwnershipEntityRefs,
              ];

              console.log(
                'Final ownership refs:',
                allOwnershipEntityRefs,
              );

              return ctx.issueToken({
                claims: {
                  sub: stringifyEntityRef(catalogUser.entity),
                  ent: allOwnershipEntityRefs,
                },
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