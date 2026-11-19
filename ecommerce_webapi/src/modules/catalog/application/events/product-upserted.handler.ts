import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProductUpsertedEvent } from './product-upserted.event';
import { CATALOG_READ_REPOSITORY_PORT } from '../../domain/repositories/catalog-read.repository.port';
import type { ICatalogReadRepositoryPort } from '../../domain/repositories/catalog-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@EventsHandler(ProductUpsertedEvent)
export class ProductUpsertedHandler implements IEventHandler<ProductUpsertedEvent> {
  constructor(
    @Inject(CATALOG_READ_REPOSITORY_PORT)
    private readonly readRepo: ICatalogReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async handle(event: ProductUpsertedEvent): Promise<void> {
    await this.readRepo.upsertProduct({
      postgresProductId: event.id,
      sku: event.sku,
      title: event.title,
      slug: event.slug,
      description: event.description,
      price: event.price,
      stock: event.stock,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
      categoryId: event.categoryId,
      categoryName: event.categoryName,
      createdAt: event.createdAt,
    });

    await this.cache.delByPattern('catalog:*');
  }
}
