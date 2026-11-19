import { ObjectId } from 'mongodb';

export interface CategoryReadModel {
  _id?: ObjectId;
  postgresCategoryId: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductReadModel {
  _id?: ObjectId;
  postgresProductId: number;
  sku: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: Date;
}

export interface ProductFilter {
  categoryId?: number;
  isActive?: boolean;
  search?: string;
}

export interface ICatalogReadRepositoryPort {
  upsertCategory(data: Omit<CategoryReadModel, '_id'>): Promise<void>;
  findAllCategories(onlyActive?: boolean): Promise<CategoryReadModel[]>;

  upsertProduct(data: Omit<ProductReadModel, '_id'>): Promise<void>;
  updateCategoryNameInProducts(categoryId: number, categoryName: string): Promise<void>;
  findAllProducts(filter: ProductFilter): Promise<ProductReadModel[]>;
}

export const CATALOG_READ_REPOSITORY_PORT = Symbol('CATALOG_READ_REPOSITORY_PORT');
