import { UserRole } from '../schemas/user.schema';

export type SafeUser = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  bio?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasPaymentQr: boolean;
  paymentQrImageContentType?: string;
  paymentQrImageSize?: number;
  paymentQrImageUpdatedAt?: string;
};
