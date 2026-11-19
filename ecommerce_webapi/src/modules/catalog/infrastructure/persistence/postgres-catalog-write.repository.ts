import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '@shared/database/prisma-postgres.service';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { ProductEntity } from '../../domain/entities/product.entity';
import type { ICatalogWriteRepositoryPort } from '../../domain/repositories/catalog-write.repository.port';

@Injectable()
export class PostgresCatalogWriteRepository implements ICatalogWriteRepositoryPort {
  constructor(private readonly prisma: PrismaPostgresService) {}

  async createCategory(category: CategoryEntity): Promise<CategoryEntity> {
    const created = await this.prisma.categoryWrite.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: category.isActive,
      },
    });
    return this.toCategoryDomain(created);
  }

  async updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const updated = await this.prisma.categoryWrite.update({
      where: { id },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
          slug: CategoryEntity.generateSlug(data.name),
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return this.toCategoryDomain(updated);
  }

  async findCategoryById(id: number): Promise<CategoryEntity | null> {
    const record = await this.prisma.categoryWrite.findUnique({ where: { id } });
    return record ? this.toCategoryDomain(record) : null;
  }

  async createProduct(product: ProductEntity): Promise<ProductEntity> {
    const created = await this.prisma.productWrite.create({
      data: {
        sku: product.sku,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        categoryId: product.categoryId,
      },
      include: { category: true },
    });
    return this.toProductDomain(created);
  }

  async updateProduct(id: number, data: Partial<ProductEntity>): Promise<ProductEntity> {
    const updated = await this.prisma.productWrite.update({
      where: { id },
      data: {
        ...(data.sku !== undefined && { sku: data.sku.toUpperCase() }),
        ...(data.title !== undefined && {
          name: data.title,
          slug: CategoryEntity.generateSlug(data.title),
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      include: { category: true },
    });
    return this.toProductDomain(updated);
  }

  async findProductById(id: number): Promise<ProductEntity | null> {
    const record = await this.prisma.productWrite.findUnique({
      where: { id },
      include: { category: true },
    });
    return record ? this.toProductDomain(record) : null;
  }

  private toCategoryDomain(record: any): CategoryEntity {
    return new CategoryEntity({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      isActive: record.isActive,
      createdAt: record.createdAt,
    });
  }

  private toProductDomain(record: any): ProductEntity {
    return new ProductEntity({
      id: record.id,
      sku: record.sku,
      title: record.title,
      slug: record.slug,
      description: record.description,
      price: Number(record.price),
      stock: record.stock,
      imageUrl: record.imageUrl,
      isActive: record.isActive,
      categoryId: record.categoryId,
      categoryName: record.category?.name,
      createdAt: record.createdAt,
    });
  }
}
