import { SetMetadata } from '@nestjs/common';

// export type AppRole = 'ADMIN' | 'MANAGER' | 'PACKER' | 'GUEST' | 'CUSTOMER';
// Konstanten nur für Rollen mit spezieller fachlicher Sonderlogik

// Dynamischer Rollentyp (kommt aus der PostgreSQL-Tabelle RoleWrite)
export type AppRole = string;

export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
