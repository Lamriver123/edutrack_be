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
  bankName?: string;
  bankCode?: string;
  bankBin?: string;
  bankLogoUrl?: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  hasPaymentQr: boolean;
  paymentQrImageContentType?: string;
  paymentQrImageSize?: number;
  paymentQrImageUpdatedAt?: string;
};
