import type { AppRole } from '@shared/auth/auth-types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    mustChangePassword: boolean;
    isActive: boolean;
    roleName: AppRole;
  };
}

export interface CustomerProfile {
  postgresCustomerId: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface AdminUserItem {
  _id?: string;
  postgresUserId: number;
  email: string;
  name?: string | null;
  roleName: AppRole;
  isActive: boolean;
  createdAt: string;
  customerProfile?: CustomerProfile | null;
}

export interface CreateStaffRequest {
  email: string;
  name?: string;
  roleName: AppRole;
  isActive?: boolean;
}

export interface UserFilterParams {
  isActive?: boolean;
  search?: string;
  roleName?: AppRole;
}
