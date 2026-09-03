import { SafeUser } from '../../users/types/safe-user.type';

export type AuthResponse = {
  accessToken: string;
  user: SafeUser;
};

export type AuthSession = AuthResponse & {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
