import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { PASSWORD_HASHER_PORT } from '@shared/security/password-hasher.port';
import type { IPasswordHasherPort } from '@shared/security/password-hasher.port';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, { message: string }> {
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IPasswordHasherPort,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<{ message: string }> {
    if (command.currentPassword === command.newPassword) {
      throw new BadRequestException('Das neue Passwort darf nicht mit dem aktuellen Passwort übereinstimmen');
    }

    const user = await this.authWriteRepo.findById(command.userId);
    if (!user || !user.password) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    const isCurrentValid = await this.passwordHasher.compare(command.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Das aktuelle Passwort ist nicht korrekt');
    }

    const newHashedPassword = await this.passwordHasher.hash(command.newPassword);
    await this.authWriteRepo.updatePassword(user.id!, newHashedPassword);

    return { message: 'Passwort erfolgreich geändert' };
  }
}
