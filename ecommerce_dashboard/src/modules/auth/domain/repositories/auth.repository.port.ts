import type { RoleOption } from '@shared/auth/auth-types';
import type {
  AdminUserItem,
  CreateStaffRequest,
  LoginCredentials,
  LoginResponse,
  UserFilterParams,
} from '../models/auth.models';


export interface IAuthRepositoryPort {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  getRoles(): Promise<RoleOption[]>;
  getStaffUsers(filter: UserFilterParams): Promise<AdminUserItem[]>;
  getCustomers(filter: UserFilterParams): Promise<AdminUserItem[]>;
  createStaffUser(data: CreateStaffRequest): Promise<LoginResponse>;
  toggleUserStatus(targetUserId: number, isActive: boolean): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
}
