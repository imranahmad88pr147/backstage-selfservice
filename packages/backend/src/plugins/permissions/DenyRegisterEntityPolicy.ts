import { PermissionPolicy } from '@backstage/plugin-permission-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import type { PolicyQuery } from '@backstage/plugin-permission-node';

/**
 * Custom permission policy that denies only the "catalog.entity.create"
 * permission, which hides the "Register Existing Component" button on
 * the Scaffolder /create page. All other permission requests are allowed.
 */
export class DenyRegisterEntityPolicy implements PermissionPolicy {
  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    if (request.permission.name === 'catalog.entity.create') {
      return { result: AuthorizeResult.DENY };
    }
    return { result: AuthorizeResult.ALLOW };
  }
}
