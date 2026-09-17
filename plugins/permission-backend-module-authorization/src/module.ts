import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { AuthorizationPolicy } from './policy/AuthorizationPolicy';

export const permissionModuleAuthorization = createBackendModule({
  pluginId: 'permission',
  moduleId: 'authorization',
  register({ registerInit }) {
    registerInit({
      deps: {
        policy: policyExtensionPoint,
        userInfo: coreServices.userInfo,
      },
      async init({ policy, userInfo }) {
        policy.setPolicy(new AuthorizationPolicy(userInfo));
      },
    });
  },
});
