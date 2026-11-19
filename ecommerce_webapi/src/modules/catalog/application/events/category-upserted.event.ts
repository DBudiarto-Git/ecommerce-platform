export class CategoryUpsertedEvent {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}
}
