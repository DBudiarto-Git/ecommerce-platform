import { CategoryEntity } from '../entities/category.entity';
import { ProductEntity } from '../entities/product.entity';

export interface ICatalogWriteRepositoryPort {
  createCategory(category: CategoryEntity): Promise<CategoryEntity>;
  updateCategory(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
  findCategoryById(id: number): Promise<CategoryEntity | null>;

  createProduct(product: ProductEntity): Promise<ProductEntity>;
  updateProduct(id: number, data: Partial<ProductEntity>): Promise<ProductEntity>;
  findProductById(id: number): Promise<ProductEntity | null>;
}

export const CATALOG_WRITE_REPOSITORY_PORT = Symbol('CATALOG_WRITE_REPOSITORY_PORT');
