import type { ProductFilter } from '../../domain/repositories/catalog-read.repository.port';

export class GetProductsQuery {
  constructor(public readonly filter: ProductFilter) {}
}
