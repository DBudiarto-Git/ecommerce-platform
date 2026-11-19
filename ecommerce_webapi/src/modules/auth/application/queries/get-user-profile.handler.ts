import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { GetUserProfileQuery } from './get-user-profile.query';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type {
  IAuthReadRepositoryPort,
  UserReadModel,
} from '../../domain/repositories/auth-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery, UserReadModel>
{
  private readonly logger = new Logger(GetUserProfileHandler.name);

  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<UserReadModel> {
    const cacheKey = `user:profile:${query.postgresUserId}`;

    // 1. Zuerst in Redis nachsehen (Cache Hit)
    const cachedProfile = await this.cache.get<UserReadModel>(cacheKey);
    if (cachedProfile) {
      this.logger.debug(`⚡ Cache HIT für ${cacheKey}`);
      return cachedProfile;
    }

    // 2. Bei Cache Miss aus MongoDB (Read-DB) laden
    this.logger.debug(`🐢 Cache MISS für ${cacheKey} -> Lade aus MongoDB`);
    const userDoc = await this.authReadRepo.findByPostgresId(query.postgresUserId);

    if (!userDoc) {
      throw new NotFoundException('Benutzerprofil wurde nicht gefunden');
    }

    // 3. Für Nicht-Kunden (z. B. ADMIN, MANAGER) das optionale customerProfile ausblenden
    const result: UserReadModel = {
      postgresUserId: userDoc.postgresUserId,
      email: userDoc.email,
      name: userDoc.name,
      isActive: userDoc.isActive,
      roleName: userDoc.roleName,
      createdAt: userDoc.createdAt,
      ...(userDoc.roleName === 'CUSTOMER' && {
        customerProfile: userDoc.customerProfile ?? null,
      }),
    };

    // 4. Ergebnis für 10 Minuten (600 Sekunden) in Redis zwischenspeichern
    await this.cache.set(cacheKey, result, 600);

    return result;
  }
}
