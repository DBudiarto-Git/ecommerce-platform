import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '@shared/database/prisma-postgres.service';
import { AppRole } from '@shared/decorators/roles.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { IAuthWriteRepositoryPort, CustomerProfileData, SavedCustomerRecord } from '../../domain/repositories/auth-write.repository.port';

@Injectable()
export class PostgresAuthWriteRepository implements IAuthWriteRepositoryPort {
  constructor(private readonly prisma: PrismaPostgresService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const record = await this.prisma.userWrite.findUnique({
      where: { email: normalizedEmail },
      include: { role: true },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const record = await this.prisma.userWrite.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findRoleIdByName(roleName: AppRole): Promise<number | null> {
    const role = await this.prisma.roleWrite.findUnique({
      where: { name: roleName },
    });

    return role ? role.id : null;
  }

  async findAllRoles(): Promise<{ id: number; name: string }[]> {
    return this.prisma.roleWrite.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    if (!user.password) {
      throw new Error('Passwort-Hash ist beim Erstellen eines Benutzers erforderlich');
    }

    const created = await this.prisma.userWrite.create({
      data: {
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        password: user.password,
        mustChangePassword: user.mustChangePassword,
        roleId: user.roleId,
        createdAt: user.createdAt,
      },
      include: { role: true },
    });

    return this.toDomain(created);
  }

  /**
   * Mapper-Methode: Wandelt einen rohen Prisma-Datensatz in eine saubere Domain-Entity um.
   */
  private toDomain(record: any): UserEntity {
    return new UserEntity({
      id: record.id,
      email: record.email,
      name: record.name,
      isActive: record.isActive,
      password: record.password,
      mustChangePassword: record.mustChangePassword,
      roleId: record.roleId,
      roleName: record.role?.name as AppRole,
      resetToken: record.resetToken,
      resetTokenExpiry: record.resetTokenExpiry,
      createdAt: record.createdAt,
    });
  }

  async upsertCustomerProfile(
    userId: number,
    data: CustomerProfileData,
  ): Promise<SavedCustomerRecord> {
    return this.prisma.customerWrite.upsert({
      where: { userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
      },
      create: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  async updateUserActiveStatus(userId: number, isActive: boolean): Promise<UserEntity> {
    const updated = await this.prisma.userWrite.update({
      where: { id: userId },
      data: { isActive },
      include: { role: true },
    });
    return this.toDomain(updated);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.prisma.userWrite.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // Flag nach erfolgreicher Änderung zurücksetzen
      },
    });
  }

  async setPasswordResetToken(userId: number, resetToken: string, expiry: Date): Promise<void> {
    await this.prisma.userWrite.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });
  }

  async findByResetToken(resetToken: string): Promise<UserEntity | null> {
    const record = await this.prisma.userWrite.findUnique({
      where: { resetToken },
      include: { role: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async completePasswordReset(userId: number, hashedPassword: string): Promise<void> {
    await this.prisma.userWrite.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,         // Token sofort ungültig machen (Einmal-Verwendung)
        resetTokenExpiry: null,
        mustChangePassword: false,
      },
    });
  }
}
