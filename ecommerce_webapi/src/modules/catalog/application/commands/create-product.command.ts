export class CreateProductCommand {
  constructor(
    public readonly sku: string,
    public readonly title: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly categoryId: number,
    public readonly description?: string | null,
    public readonly imageUrl?: string | null,
    public readonly isActive: boolean = true,
  ) {}
}
