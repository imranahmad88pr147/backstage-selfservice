import { UserInfoService } from '@backstage/backend-plugin-api';

import {
  AuthorizeResult,
  isPermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';

import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

import {
  actionExecutePermission,
  taskCancelPermission,
  taskCreatePermission,
  taskReadPermission,
  templateManagementPermission,
} from '@backstage/plugin-scaffolder-common/alpha';

import {
  createScaffolderTaskConditionalDecision,
  scaffolderTaskConditions,
} from '@backstage/plugin-scaffolder-backend/alpha';

export class AuthorizationPolicy implements PermissionPolicy {
  constructor(private readonly userInfo: UserInfoService) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    console.log(
      'Permission policy request:',
      request.permission.name,
    );

    console.log('Permission policy user:', user);

    const ownershipEntityRefs =
      user?.info.ownershipEntityRefs ?? [];

    const isAdmin = ownershipEntityRefs.includes(
      'group:default/backstage-admins',
    );

    const isDeveloper = ownershipEntityRefs.includes(
      'group:default/backstage-developers',
    );

    console.log('Is Backstage Admin:', isAdmin);
    console.log('Is Backstage Developer:', isDeveloper);

    // Preserve the existing behavior:
    // deny catalog.entity.create to hide "Register Existing Component".
    if (request.permission.name === 'catalog.entity.create') {
      return { result: AuthorizeResult.DENY };
    }

    // Admins have full access to the permissions handled by this policy.
    if (isAdmin) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Developers can create scaffolder tasks.
    if (isPermission(request.permission, taskCreatePermission)) {
      return isDeveloper
        ? { result: AuthorizeResult.ALLOW }
        : { result: AuthorizeResult.DENY };
    }

    // Developers can read only the tasks they created.
    if (isPermission(request.permission, taskReadPermission)) {
      if (!isDeveloper) {
        return { result: AuthorizeResult.DENY };
      }

      return createScaffolderTaskConditionalDecision(
        request.permission,
        scaffolderTaskConditions.isTaskOwner({
          createdBy: user?.info.userEntityRef
            ? [user.info.userEntityRef]
            : [],
        }),
      );
    }

    // Developers can cancel only the tasks they created.
    if (isPermission(request.permission, taskCancelPermission)) {
      if (!isDeveloper) {
        return { result: AuthorizeResult.DENY };
      }

      return createScaffolderTaskConditionalDecision(
        request.permission,
        scaffolderTaskConditions.isTaskOwner({
          createdBy: user?.info.userEntityRef
            ? [user.info.userEntityRef]
            : [],
        }),
      );
    }

    // Developers can execute approved scaffolder actions.
    if (isPermission(request.permission, actionExecutePermission)) {
      return isDeveloper
        ? { result: AuthorizeResult.ALLOW }
        : { result: AuthorizeResult.DENY };
    }

    // Only admins can manage templates.
    if (
      isPermission(
        request.permission,
        templateManagementPermission,
      )
    ) {
      return { result: AuthorizeResult.DENY };
    }

    // All other permissions are denied by default.
    return { result: AuthorizeResult.DENY };
  }
}