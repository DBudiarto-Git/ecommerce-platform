import { SYSTEM_ROLES } from '@shared/auth/auth-types';
import type { RoleOption } from '@shared/auth/auth-types';
import type {
  AdminUserItem,
  CreateStaffRequest,
  UserFilterParams,
} from '../../domain/models/auth.models';
import type { IAuthRepositoryPort } from '../../domain/repositories/auth.repository.port';

export class ManageUsersUseCase {
  private readonly authRepo: IAuthRepositoryPort;

  constructor(authRepo: IAuthRepositoryPort) {
    this.authRepo = authRepo;
  }

  async getStaffRoles(): Promise<RoleOption[]> {
    const allRoles = await this.authRepo.getRoles();
    // Kunden werden über die Storefront registriert, nicht als Mitarbeiter angelegt
    return allRoles.filter((role) => role.name !== SYSTEM_ROLES.CUSTOMER);
  }

  async loadStaff(filter: UserFilterParams): Promise<AdminUserItem[]> {
    return this.authRepo.getStaffUsers(filter);
  }

  async loadCustomers(filter: UserFilterParams): Promise<AdminUserItem[]> {
    return this.authRepo.getCustomers(filter);
  }

  async createStaff(data: CreateStaffRequest): Promise<AdminUserItem> {
    const response = await this.authRepo.createStaffUser(data);

    return {
      postgresUserId: response.user.id,
      email: response.user.email,
      name: response.user.name,
      roleName: response.user.roleName,
      isActive: response.user.isActive,
      createdAt: new Date().toISOString(),
    };
  }

  async setUserActiveStatus(targetUserId: number, isActive: boolean): Promise<void> {
    await this.authRepo.toggleUserStatus(targetUserId, isActive);
  }
}
