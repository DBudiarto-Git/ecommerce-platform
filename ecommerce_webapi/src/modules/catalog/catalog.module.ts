import { Module } from '@nestjs/common';
import { CatalogController } from './presentation/controllers/catalog.controller';
import { CATALOG_WRITE_REPOSITORY_PORT } from './domain/repositories/catalog-write.repository.port';
import { PostgresCatalogWriteRepository } from './infrastructure/persistence/postgres-catalog-write.repository';
import { CATALOG_READ_REPOSITORY_PORT } from './domain/repositories/catalog-read.repository.port';
import { MongodbCatalogReadRepository } from './infrastructure/persistence/mongodb-catalog-read.repository';
import { CreateCategoryHandler } from './application/commands/create-category.handler';
import { UpdateCategoryHandler } from './application/commands/update-category.handler';
import { CreateProductHandler } from './application/commands/create-product.handler';
import { UpdateProductHandler } from './application/commands/update-product.handler';
import { CategoryUpsertedHandler } from './application/events/category-upserted.handler';
import { ProductUpsertedHandler } from './application/events/product-upserted.handler';
import { GetCategoriesHandler } from './application/queries/get-categories.handler';
import { GetProductsHandler } from './application/queries/get-products.handler';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  CreateProductHandler,
  UpdateProductHandler,
];

const QueryHandlers = [GetCategoriesHandler, GetProductsHandler];

const EventHandlers = [CategoryUpsertedHandler, ProductUpsertedHandler];

@Module({
  controllers: [CatalogController],
  providers: [
    {
      provide: CATALOG_WRITE_REPOSITORY_PORT,
      useClass: PostgresCatalogWriteRepository,
    },
    {
      provide: CATALOG_READ_REPOSITORY_PORT,
      useClass: MongodbCatalogReadRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CatalogModule {}
