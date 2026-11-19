import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProductsQuery } from './get-products.query';
import { CATALOG_READ_REPOSITORY_PORT } from '../../domain/repositories/catalog-read.repository.port';
import type {
  ICatalogReadRepositoryPort,
  ProductReadModel,
} from '../../domain/repositories/catalog-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler
  implements IQueryHandler<GetProductsQuery, ProductReadModel[]>
{
  constructor(
    @Inject(CATALOG_READ_REPOSITORY_PORT)
    private readonly readRepo: ICatalogReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async execute(query: GetProductsQuery): Promise<ProductReadModel[]> {
    const cacheKey = `catalog:products:${JSON.stringify(query.filter)}`;
    const cached = await this.cache.get<ProductReadModel[]>(cacheKey);
    if (cached) return cached;

    const products = await this.readRepo.findAllProducts(query.filter);
    await this.cache.set(cacheKey, products, 300);
    return products;
  }
}
