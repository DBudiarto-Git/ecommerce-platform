import { ObjectId } from 'mongodb';
import { AppRole } from '@shared/decorators/roles.decorator';

export interface CustomerProfileEmbedded {
  postgresCustomerId: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UserReadModel {
  _id?: ObjectId;
  postgresUserId: number;
  email: string;
  name?: string | null;
  isActive: boolean;
  roleName: string;
  createdAt: Date;
  customerProfile?: CustomerProfileEmbedded | null;
}

export interface FindUsersFilter {
  isActive?: boolean;
  search?: string;
}

export interface FindStaffFilter extends FindUsersFilter {
  roleName?: Exclude<AppRole, 'CUSTOMER'>;
}

export interface IAuthReadRepositoryPort {
  upsertUserReadModel(data: Omit<UserReadModel, '_id'>): Promise<void>;
  updateCustomerProfile(postgresUserId: number, profile: CustomerProfileEmbedded): Promise<void>;
  updateUserActiveStatus(postgresUserId: number, isActive: boolean): Promise<void>;
  findByPostgresId(postgresUserId: number): Promise<UserReadModel | null>;
  findByEmail(email: string): Promise<UserReadModel | null>;
  findAllCustomers(filter: FindUsersFilter): Promise<UserReadModel[]>;
  findAllStaff(filter: FindStaffFilter): Promise<UserReadModel[]>;
}

export const AUTH_READ_REPOSITORY_PORT = Symbol('AUTH_READ_REPOSITORY_PORT');
