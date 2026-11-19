import { Injectable, OnModuleInit } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MongodbService } from '@shared/database/mongodb.service';
import type {
  CategoryReadModel,
  ICatalogReadRepositoryPort,
  ProductFilter,
  ProductReadModel,
} from '../../domain/repositories/catalog-read.repository.port';

@Injectable()
export class MongodbCatalogReadRepository implements ICatalogReadRepositoryPort, OnModuleInit {
  private categoriesCol!: Collection<CategoryReadModel>;
  private productsCol!: Collection<ProductReadModel>;

  constructor(private readonly mongoService: MongodbService) {}

  async onModuleInit() {
    this.categoriesCol = this.mongoService.db.collection<CategoryReadModel>('categories');
    this.productsCol = this.mongoService.db.collection<ProductReadModel>('products');

    await this.categoriesCol.createIndex({ postgresCategoryId: 1 }, { unique: true });
    await this.categoriesCol.createIndex({ slug: 1 }, { unique: true });
    await this.productsCol.createIndex({ postgresProductId: 1 }, { unique: true });
    await this.productsCol.createIndex({ sku: 1 }, { unique: true });
    await this.productsCol.createIndex({ categoryId: 1, isActive: 1 });
  }

  async upsertCategory(data: Omit<CategoryReadModel, '_id'>): Promise<void> {
    await this.categoriesCol.updateOne(
      { postgresCategoryId: data.postgresCategoryId },
      { $set: data },
      { upsert: true },
    );
  }

  async findAllCategories(onlyActive?: boolean): Promise<CategoryReadModel[]> {
    const query = onlyActive ? { isActive: true } : {};
    return this.categoriesCol.find(query).sort({ name: 1 }).toArray();
  }

  async upsertProduct(data: Omit<ProductReadModel, '_id'>): Promise<void> {
    await this.productsCol.updateOne(
      { postgresProductId: data.postgresProductId },
      { $set: data },
      { upsert: true },
    );
  }

  async updateCategoryNameInProducts(categoryId: number, categoryName: string): Promise<void> {
    await this.productsCol.updateMany(
      { categoryId },
      { $set: { categoryName } },
    );
  }

  async findAllProducts(filter: ProductFilter): Promise<ProductReadModel[]> {
    const query: Record<string, any> = {};

    if (filter.categoryId !== undefined) query.categoryId = filter.categoryId;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.search) {
      const regex = { $regex: filter.search, $options: 'i' };
      query.$or = [{ name: regex }, { sku: regex }, { description: regex }];
    }

    return this.productsCol.find(query).sort({ createdAt: -1 }).toArray();
  }
}
