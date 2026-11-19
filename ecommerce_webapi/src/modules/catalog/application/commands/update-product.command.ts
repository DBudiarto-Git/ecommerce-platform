export class UpdateProductCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      sku?: string;
      title?: string;
      description?: string | null;
      price?: number;
      stock?: number;
      imageUrl?: string | null;
      isActive?: boolean;
      categoryId?: number;
    },
  ) {}
}
