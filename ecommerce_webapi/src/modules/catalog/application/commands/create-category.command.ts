export class CreateCategoryCommand {
  constructor(
    public readonly name: string,
    public readonly description?: string | null,
    public readonly isActive: boolean = true,
  ) {}
}
