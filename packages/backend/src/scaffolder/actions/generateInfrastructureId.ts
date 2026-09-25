import crypto from 'node:crypto';

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const createGenerateInfrastructureIdAction = () =>
  createTemplateAction({
    id: 'platform:generateInfrastructureId',

    description:
      'Generates a unique identifier for a provisioned infrastructure instance.',

    schema: {
      output: {
        infrastructureId: z =>
          z.string({
            description:
              'Unique identifier assigned to the infrastructure instance.',
          }),
      },
    },

    async handler(ctx) {
      const infrastructureId = crypto.randomBytes(6).toString('hex');

      ctx.output('infrastructureId', infrastructureId);
    },
  });