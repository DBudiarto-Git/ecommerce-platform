export class ProductUpsertedEvent {
  constructor(
    public readonly id: number,
    public readonly sku: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl: string | null,
    public readonly isActive: boolean,
    public readonly categoryId: number,
    public readonly categoryName: string,
    public readonly createdAt: Date,
  ) {}
}
