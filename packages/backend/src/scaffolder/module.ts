import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

import { createConfigureGithubEnvironmentAction } from './actions/configureGithubEnvironment';
import { createGenerateInfrastructureIdAction } from './actions/generateInfrastructureId';

const scaffolderModuleInfrastructureActions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'infrastructure-actions',

  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },

      async init({ scaffolder, config }) {
        scaffolder.addActions(
          createGenerateInfrastructureIdAction(),
          createConfigureGithubEnvironmentAction(config),
        );
      },
    });
  },
});

export default scaffolderModuleInfrastructureActions;