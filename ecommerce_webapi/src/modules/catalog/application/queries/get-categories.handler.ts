import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCategoriesQuery } from './get-categories.query';
import { CATALOG_READ_REPOSITORY_PORT } from '../../domain/repositories/catalog-read.repository.port';
import type {
  CategoryReadModel,
  ICatalogReadRepositoryPort,
} from '../../domain/repositories/catalog-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler
  implements IQueryHandler<GetCategoriesQuery, CategoryReadModel[]>
{
  constructor(
    @Inject(CATALOG_READ_REPOSITORY_PORT)
    private readonly readRepo: ICatalogReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async execute(query: GetCategoriesQuery): Promise<CategoryReadModel[]> {
    const cacheKey = `catalog:categories:${query.onlyActive ? 'active' : 'all'}`;
    const cached = await this.cache.get<CategoryReadModel[]>(cacheKey);
    if (cached) return cached;

    const categories = await this.readRepo.findAllCategories(query.onlyActive);
    await this.cache.set(cacheKey, categories, 600);
    return categories;
  }
}
