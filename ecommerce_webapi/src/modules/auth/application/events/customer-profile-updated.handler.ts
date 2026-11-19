import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CustomerProfileUpdatedEvent } from './customer-profile-updated.event';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type { IAuthReadRepositoryPort } from '../../domain/repositories/auth-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@EventsHandler(CustomerProfileUpdatedEvent)
export class CustomerProfileUpdatedHandler
  implements IEventHandler<CustomerProfileUpdatedEvent>
{
  private readonly logger = new Logger(CustomerProfileUpdatedHandler.name);

  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async handle(event: CustomerProfileUpdatedEvent): Promise<void> {
    // 1. Eingebettetes Profil in MongoDB aktualisieren
    await this.authReadRepo.updateCustomerProfile(
      event.postgresUserId,
      event.profile,
    );

    // 2. Redis-Cache für diesen User invalidieren (Cache-Aside Pattern)
    const cacheKey = `user:profile:${event.postgresUserId}`;
    await this.cache.del(cacheKey);

    this.logger.log(`🔄 Kundenprofil für User [${event.postgresUserId}] synchronisiert & Cache geleert.`);
  }
}
