/*
import { httpClient } from '@shared/api/axios-http-client';
import type { LoginCredentials, LoginResponse } from '../../domain/models/auth.models';
import type { IAuthRepositoryPort } from '../../domain/repositories/auth.repository.port';

export class HttpAuthRepository implements IAuthRepositoryPort {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return httpClient.post<LoginResponse, LoginCredentials>('/auth/login', credentials);
  }
}

export const authRepository: IAuthRepositoryPort = new HttpAuthRepository();*/

import { httpClient } from '@shared/api/axios-http-client';
import type { RoleOption } from '@shared/auth/auth-types';
import type {
  AdminUserItem,
  CreateStaffRequest,
  LoginCredentials,
  LoginResponse,
  UserFilterParams,
} from '../../domain/models/auth.models';
import type { IAuthRepositoryPort } from '../../domain/repositories/auth.repository.port';

export class HttpAuthRepository implements IAuthRepositoryPort {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return httpClient.post<LoginResponse, LoginCredentials>('/auth/login', credentials);
  }

  async getRoles(): Promise<RoleOption[]> {
    return httpClient.get<RoleOption[]>('/auth/roles');
  }

  async getStaffUsers(filter: UserFilterParams): Promise<AdminUserItem[]> {
    return httpClient.get<AdminUserItem[]>('/auth/admin/staff', {
      params: this.cleanParams(filter),
    });
  }

  async getCustomers(filter: UserFilterParams): Promise<AdminUserItem[]> {
    return httpClient.get<AdminUserItem[]>('/auth/admin/customers', {
      params: this.cleanParams(filter),
    });
  }

  async createStaffUser(data: CreateStaffRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse, CreateStaffRequest>('/auth/admin/users', data);
  }

  async toggleUserStatus(targetUserId: number, isActive: boolean): Promise<void> {
    await httpClient.patch<unknown, { isActive: boolean }>(
      `/auth/admin/users/${targetUserId}/status`,
      { isActive },
    );
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.patch('/auth/change-password', { currentPassword, newPassword });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }, { email: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }, { token: string; newPassword: string }>(
      '/auth/reset-password',
      { token, newPassword },
    );
  }

  private cleanParams(filter: UserFilterParams): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (filter.isActive !== undefined) params.isActive = filter.isActive;
    if (filter.search?.trim()) params.search = filter.search.trim();
    if (filter.roleName) params.roleName = filter.roleName;
    return params;
  }
}

export const authRepository: IAuthRepositoryPort = new HttpAuthRepository();

