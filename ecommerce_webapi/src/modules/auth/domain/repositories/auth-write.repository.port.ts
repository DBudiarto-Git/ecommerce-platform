import { UserEntity } from '../entities/user.entity';
import { AppRole } from '@shared/decorators/roles.decorator';

export interface CustomerProfileData {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface SavedCustomerRecord extends CustomerProfileData {
  id: number;
  userId: number;
}

export interface IAuthWriteRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  findRoleIdByName(roleName: AppRole): Promise<number | null>;
  findAllRoles(): Promise<{ id: number; name: string }[]>;
  createUser(user: UserEntity): Promise<UserEntity>;
  upsertCustomerProfile(userId: number, data: CustomerProfileData): Promise<SavedCustomerRecord>;
  updateUserActiveStatus(userId: number, isActive: boolean): Promise<UserEntity>; // <-- HIER EINFÜGEN
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
  setPasswordResetToken(userId: number, resetToken: string, expiry: Date): Promise<void>;
  findByResetToken(resetToken: string): Promise<UserEntity | null>;
  completePasswordReset(userId: number, hashedPassword: string): Promise<void>;
}

export const AUTH_WRITE_REPOSITORY_PORT = Symbol('AUTH_WRITE_REPOSITORY_PORT');
