import { createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { DenyRegisterEntityPolicy } from './DenyRegisterEntityPolicy';

/**
 * Custom permission policy module that denies catalog.entity.create
 * (hides the "Register Existing Component" button). Replaces the
 * default allow-all policy module.
 *
 * @alpha
 */
export const denyRegisterEntityPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'deny-register-entity-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new DenyRegisterEntityPolicy());
      },
    });
  },
});

export default denyRegisterEntityPolicyModule;
