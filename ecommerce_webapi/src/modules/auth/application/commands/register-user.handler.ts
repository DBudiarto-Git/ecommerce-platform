import * as crypto from 'crypto';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserEntity } from '../../domain/entities/user.entity';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { PASSWORD_HASHER_PORT } from '@shared/security/password-hasher.port';
import type { IPasswordHasherPort } from '@shared/security/password-hasher.port';
import { TOKEN_SERVICE_PORT } from '@shared/security/token-service.port';
import type { ITokenServicePort } from '@shared/security/token-service.port';

export interface RegisterUserResult {
  accessToken: string;
  user: ReturnType<UserEntity['toSafeProfile']>;
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IPasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: ITokenServicePort,
    private readonly eventBus: EventBus,
  ) {}

  // Hilfsmethode innerhalb von RegisterUserHandler:
  private generateSecurePassword(length = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
  }

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    // 1. Prüfen, ob die E-Mail bereits in PostgreSQL existiert
    const existingUser = await this.authWriteRepo.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits');
    }

    // 2. Passende roleId aus der RoleWrite-Tabelle ermitteln
    const roleId = await this.authWriteRepo.findRoleIdByName(command.roleName);
    if (!roleId) {
      throw new BadRequestException(`Die angegebene Rolle '${command.roleName}' existiert nicht`);
    }

    const plainPassword = command.plainPassword ?? this.generateSecurePassword(12);
    const isAdminCreated = !command.plainPassword;

    // 3. Passwort sicher über den abstrakten Port hashen
    const hashedPassword = await this.passwordHasher.hash(plainPassword);

    // 4. Reine Domain-Entity erzeugen
    const newUserEntity = new UserEntity({
      email: command.email,
      name: command.name,
      password: hashedPassword,
      mustChangePassword: isAdminCreated,
      roleId,
      roleName: command.roleName,
    });

    // 5. In PostgreSQL (Write-DB) speichern
    const savedUser = await this.authWriteRepo.createUser(newUserEntity);

    // 6. CQRS-Event abfeuern -> Synchronisiert asynchron nach MongoDB!
    this.eventBus.publish(
      new UserRegisteredEvent(
        savedUser.id!,
        savedUser.email,
        savedUser.name ?? null,
        savedUser.isActive,
        command.roleName,
        savedUser.createdAt,
        isAdminCreated ? plainPassword : undefined
      ),
    );

    // 7. Direkt einen JWT-Access-Token generieren
    const accessToken = await this.tokenService.generateAccessToken({
      sub: savedUser.id!,
      email: savedUser.email,
      role: command.roleName,
    });

    return {
      accessToken,
      user: savedUser.toSafeProfile(),
    };
  }
}
