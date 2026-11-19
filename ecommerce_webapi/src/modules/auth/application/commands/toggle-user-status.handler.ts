import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ToggleUserStatusCommand } from './toggle-user-status.command';
import { UserStatusUpdatedEvent } from '../events/user-status-updated.event';
import { UserEntity } from '../../domain/entities/user.entity';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';

@CommandHandler(ToggleUserStatusCommand)
export class ToggleUserStatusHandler
  implements ICommandHandler<ToggleUserStatusCommand, ReturnType<UserEntity['toSafeProfile']>>
{
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ToggleUserStatusCommand) {
    // Fachliche Schutzregel: Ein Admin darf sein eigenes Konto nicht deaktivieren
    if (command.targetUserId === command.adminUserId && !command.isActive) {
      throw new BadRequestException('Du kannst dein eigenes Admin-Konto nicht deaktivieren');
    }

    const existingUser = await this.authWriteRepo.findById(command.targetUserId);
    if (!existingUser) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // 1. In PostgreSQL aktualisieren
    const updatedUser = await this.authWriteRepo.updateUserActiveStatus(
      command.targetUserId,
      command.isActive,
    );

    // 2. Event für MongoDB & Redis-Cache abfeuern
    this.eventBus.publish(
      new UserStatusUpdatedEvent(updatedUser.id!, updatedUser.isActive),
    );

    return updatedUser.toSafeProfile();
  }
}
