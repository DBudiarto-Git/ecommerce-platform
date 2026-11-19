import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRolesQuery } from './get-roles.query';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

export interface RoleItem {
  id: number;
  name: string;
}

@QueryHandler(GetRolesQuery)
export class GetRolesHandler implements IQueryHandler<GetRolesQuery, RoleItem[]> {
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async execute(): Promise<RoleItem[]> {
    const cacheKey = 'system:roles';

    // 1. Aus Redis laden, falls vorhanden
    const cachedRoles = await this.cache.get<RoleItem[]>(cacheKey);
    if (cachedRoles) {
      return cachedRoles;
    }

    // 2. Aus PostgreSQL laden und für 1 Stunde (3600s) in Redis speichern
    const roles = await this.authWriteRepo.findAllRoles();
    await this.cache.set(cacheKey, roles, 3600);

    return roles;
  }
}
