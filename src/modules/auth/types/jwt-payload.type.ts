import { UserRole } from '../../users/schemas/user.schema';

export type JwtTokenType = 'access' | 'refresh';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tokenType: JwtTokenType;
};
