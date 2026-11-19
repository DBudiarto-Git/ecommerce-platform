import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UserStatusUpdatedEvent } from './user-status-updated.event';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type { IAuthReadRepositoryPort } from '../../domain/repositories/auth-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@EventsHandler(UserStatusUpdatedEvent)
export class UserStatusUpdatedHandler implements IEventHandler<UserStatusUpdatedEvent> {
  private readonly logger = new Logger(UserStatusUpdatedHandler.name);

  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async handle(event: UserStatusUpdatedEvent): Promise<void> {
    await this.authReadRepo.updateUserActiveStatus(event.postgresUserId, event.isActive);
    await this.cache.del(`user:profile:${event.postgresUserId}`);
    this.logger.log(`🔄 User-Status [${event.postgresUserId}] -> isActive=${event.isActive} synchronisiert.`);
  }
}
