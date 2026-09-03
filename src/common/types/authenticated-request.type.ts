import { Request } from 'express';
import { UserRole } from '../../modules/users/schemas/user.schema';

export type JwtUser = {
  userId: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};
