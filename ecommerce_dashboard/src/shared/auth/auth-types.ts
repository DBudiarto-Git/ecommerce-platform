/*
export type AppRole = 'ADMIN' | 'MANAGER' | 'PACKER' | 'GUEST' | 'CUSTOMER';

export interface AuthUser {
  id: number;
  email: string;
  role: AppRole;
}*/

export type AppRole = string;

export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export interface RoleOption {
  id: number;
  name: AppRole;
}

export interface AuthUser {
  id: number;
  email: string;
  role: AppRole;
}
