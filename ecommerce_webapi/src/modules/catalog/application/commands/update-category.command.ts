export class UpdateCategoryCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ) {}
}
