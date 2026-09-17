import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { AuthorizationPolicy } from './AuthorizationPolicy';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

describe('AuthorizationPolicy', () => {
  const permission = {
    type: 'basic' as const,
    name: 'test.permission',
    attributes: {},
  };

  it('should allow requests without a user', async () => {
    const policy = new AuthorizationPolicy(mockServices.userInfo());

    const decision = await policy.handle({ permission }, undefined);

    expect(decision).toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('should allow requests from authenticated users', async () => {
    const policy = new AuthorizationPolicy(mockServices.userInfo());
    const user = {
      credentials: mockCredentials.user(),
      info: { userEntityRef: 'user:default/guest', ownershipEntityRefs: ['user:default/guest'] },
    };

    const decision = await policy.handle({ permission }, user);

    expect(decision).toEqual({ result: AuthorizeResult.ALLOW });
  });
});
