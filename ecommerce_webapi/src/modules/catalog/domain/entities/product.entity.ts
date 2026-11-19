import { CategoryEntity } from './category.entity';

export interface ProductProps {
  id?: number;
  sku: string;
  title: string;
  slug?: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive?: boolean;
  categoryId: number;
  categoryName?: string;
  createdAt?: Date;
}

export class ProductEntity {
  public readonly id?: number;
  public sku: string;
  public title: string;
  public slug: string;
  public description: string | null;
  public price: number;
  public stock: number;
  public imageUrl: string | null;
  public isActive: boolean;
  public categoryId: number;
  public categoryName?: string;
  public readonly createdAt: Date;

  constructor(props: ProductProps) {
    if (props.price < 0) throw new Error('Der Produktpreis darf nicht negativ sein');
    if (props.stock < 0) throw new Error('Der Lagerbestand darf nicht negativ sein');

    this.id = props.id;
    this.sku = props.sku.trim().toUpperCase();
    this.title = props.title.trim();
    this.slug = props.slug ?? CategoryEntity.generateSlug(props.title);
    this.description = props.description ?? null;
    this.price = props.price;
    this.stock = props.stock;
    this.imageUrl = props.imageUrl ?? null;
    this.isActive = props.isActive ?? true;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName;
    this.createdAt = props.createdAt ?? new Date();
  }
}
