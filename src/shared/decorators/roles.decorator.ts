import { SetMetadata } from '@nestjs/common';

import { ApplicationRoles } from '@shared/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ApplicationRoles[]) =>
  SetMetadata(ROLES_KEY, roles);
