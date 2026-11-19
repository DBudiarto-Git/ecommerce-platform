import { Injectable, OnModuleInit } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MongodbService } from '@shared/database/mongodb.service';
import {
  IAuthReadRepositoryPort,
  UserReadModel,
  CustomerProfileEmbedded,
  FindUsersFilter,
  FindStaffFilter 
} from '../../domain/repositories/auth-read.repository.port';

@Injectable()
export class MongodbAuthReadRepository implements IAuthReadRepositoryPort, OnModuleInit {
  private collection!: Collection<UserReadModel>;

  constructor(private readonly mongoService: MongodbService) {}

  async onModuleInit() {
    this.collection = this.mongoService.db.collection<UserReadModel>('users');

    // Erstellt beim App-Start automatisch performante Indizes in MongoDB (idempotent)
    await this.collection.createIndex({ postgresUserId: 1 }, { unique: true });
    await this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async upsertUserReadModel(data: Omit<UserReadModel, '_id'>): Promise<void> {
    await this.collection.updateOne(
      { postgresUserId: data.postgresUserId },
      { $set: data },
      { upsert: true },
    );
  }

  async updateCustomerProfile(
    postgresUserId: number,
    profile: CustomerProfileEmbedded,
  ): Promise<void> {
    await this.collection.updateOne(
      { postgresUserId },
      { $set: { customerProfile: profile } },
    );
  }

  async findByPostgresId(postgresUserId: number): Promise<UserReadModel | null> {
    return this.collection.findOne({ postgresUserId });
  }

  async findByEmail(email: string): Promise<UserReadModel | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.collection.findOne({ email: normalizedEmail });
  }

  async updateUserActiveStatus(postgresUserId: number, isActive: boolean): Promise<void> {
    await this.collection.updateOne(
      { postgresUserId },
      { $set: { isActive } },
    );
  }

  async findAllCustomers(filter: FindUsersFilter): Promise<UserReadModel[]> {
    const query: Record<string, any> = {
      roleName: 'CUSTOMER',
    };

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    if (filter.search) {
      const regex = { $regex: filter.search, $options: 'i' };
      query.$or = [
        { email: regex },
        { name: regex },
        { 'customerProfile.firstName': regex },
        { 'customerProfile.lastName': regex },
      ];
    }

    return this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findAllStaff(filter: FindStaffFilter): Promise<UserReadModel[]> {
    const query: Record<string, any> = {
      // Wenn eine spezifische Rolle gewählt wurde, filtere danach – sonst alle außer CUSTOMER
      roleName: filter.roleName ? filter.roleName : { $ne: 'CUSTOMER' },
    };

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    if (filter.search) {
      const regex = { $regex: filter.search, $options: 'i' };
      query.$or = [{ email: regex }, { name: regex }];
    }

    // Bei Mitarbeitern/Admins blenden wir das leere customerProfile-Feld direkt in MongoDB aus
    return this.collection
      .find(query, { projection: { customerProfile: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
}
