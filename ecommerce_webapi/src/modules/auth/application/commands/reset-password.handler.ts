import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { PASSWORD_HASHER_PORT } from '@shared/security/password-hasher.port';
import type { IPasswordHasherPort } from '@shared/security/password-hasher.port';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand, { message: string }>
{
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IPasswordHasherPort,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ message: string }> {
    const user = await this.authWriteRepo.findByResetToken(command.token);

    // Nutzt unsere reine Domain-Entity-Regel für Token-Match & Ablaufdatum
    if (!user || !user.id || !user.isResetTokenValid(command.token)) {
      throw new BadRequestException('Der Reset-Link ist ungültig oder bereits abgelaufen');
    }

    const hashedPassword = await this.passwordHasher.hash(command.newPassword);
    await this.authWriteRepo.completePasswordReset(user.id, hashedPassword);

    return { message: 'Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt einloggen.' };
  }
}
