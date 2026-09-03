import { UserRole } from '../schemas/user.schema';

export type SafeUser = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
};
