import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CategoryUpsertedEvent } from './category-upserted.event';
import { CATALOG_READ_REPOSITORY_PORT } from '../../domain/repositories/catalog-read.repository.port';
import type { ICatalogReadRepositoryPort } from '../../domain/repositories/catalog-read.repository.port';
import { CACHE_PORT } from '@shared/cache/cache.port';
import type { ICachePort } from '@shared/cache/cache.port';

@EventsHandler(CategoryUpsertedEvent)
export class CategoryUpsertedHandler implements IEventHandler<CategoryUpsertedEvent> {
  constructor(
    @Inject(CATALOG_READ_REPOSITORY_PORT)
    private readonly readRepo: ICatalogReadRepositoryPort,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  async handle(event: CategoryUpsertedEvent): Promise<void> {
    await this.readRepo.upsertCategory({
      postgresCategoryId: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      isActive: event.isActive,
      createdAt: event.createdAt,
    });

    // Falls der Kategoriename geändert wurde, alle betroffenen Produkte in MongoDB mitziehen
    await this.readRepo.updateCategoryNameInProducts(event.id, event.name);

    // Alle Katalog-Caches in Redis invalidieren
    await this.cache.delByPattern('catalog:*');
  }
}
