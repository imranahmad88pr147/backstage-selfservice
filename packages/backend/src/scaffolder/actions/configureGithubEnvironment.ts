import { type Config } from '@backstage/config';

import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { Octokit } from 'octokit';

const ALLOWED_ENVIRONMENTS = ['dev', 'staging', 'prod'] as const;

export const createConfigureGithubEnvironmentAction = (config: Config) =>
  createTemplateAction({
    id: 'platform:configureGithubEnvironment',

    description:
      'Creates or updates the GitHub deployment environment for a provisioned infrastructure repository.',

    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description: 'GitHub repository URL created by the scaffolder.',
          }),

        environment: z =>
          z.enum(ALLOWED_ENVIRONMENTS, {
            description:
              'Infrastructure environment selected during scaffolding.',
          }),
      },
    },

    async handler(ctx) {
      const { repoUrl, environment } = ctx.input;

      const expectedOrganization = config.getString(
        'platform.github.organization',
      );

      const productionEnvironmentName = config.getString(
        'platform.github.productionEnvironment.name',
      );

      const productionReviewerTeamId = config.getNumber(
        'platform.github.productionEnvironment.reviewerTeamId',
      );

      let repositoryUrl: URL;

      try {
        repositoryUrl = new URL(repoUrl);
      } catch {
        throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
      }

      if (repositoryUrl.hostname.toLowerCase() !== 'github.com') {
        throw new Error(
          `Unsupported GitHub host: ${repositoryUrl.hostname}`,
        );
      }

      const repositoryParts = repositoryUrl.pathname
        .replace(/^\/|\/$/g, '')
        .split('/');

      if (repositoryParts.length !== 2) {
        throw new Error(
          `Invalid GitHub repository URL. Expected https://github.com/<owner>/<repo>, received: ${repoUrl}`,
        );
      }

      const [owner, rawRepo] = repositoryParts;

      const repo = rawRepo.replace(/\.git$/, '');

      if (owner.toLowerCase() !== expectedOrganization.toLowerCase()) {
        throw new Error(
          `Repository owner "${owner}" does not match the configured platform organization "${expectedOrganization}".`,
        );
      }

      const githubUrl = `https://github.com/${owner}/${repo}`;

      ctx.logger.info(
        `Configuring GitHub environment "${environment}" for ${githubUrl}`,
      );

      const integrations = ScmIntegrations.fromConfig(config);

      const githubCredentialsProvider =
        DefaultGithubCredentialsProvider.fromIntegrations(integrations);

      const credentials = await githubCredentialsProvider.getCredentials({
        url: githubUrl,
      });

      if (!credentials.token) {
        throw new Error(
          `No GitHub credentials were available for ${githubUrl}.`,
        );
      }

      const octokit = new Octokit({
        auth: credentials.token,
      });

      const githubEnvironment =
        environment === 'prod'
          ? productionEnvironmentName
          : environment;

      const reviewers =
        environment === 'prod'
          ? [
              {
                type: 'Team' as const,
                id: productionReviewerTeamId,
              },
            ]
          : [];

      await octokit.rest.repos.createOrUpdateEnvironment({
        owner,
        repo,
        environment_name: githubEnvironment,
        wait_timer: 0,
        prevent_self_review: environment === 'prod',
        reviewers,
        deployment_branch_policy: null,
      });

      ctx.logger.info(
        `GitHub environment "${githubEnvironment}" configured successfully for ${githubUrl}`,
      );

      ctx.output('environment', githubEnvironment);
    },
  });