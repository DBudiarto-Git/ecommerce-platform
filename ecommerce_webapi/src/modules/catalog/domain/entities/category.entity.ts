export interface CategoryProps {
  id?: number;
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
}

export class CategoryEntity {
  public readonly id?: number;
  public name: string;
  public slug: string;
  public description: string | null;
  public isActive: boolean;
  public readonly createdAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name.trim();
    this.slug = props.slug ?? CategoryEntity.generateSlug(props.name);
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
