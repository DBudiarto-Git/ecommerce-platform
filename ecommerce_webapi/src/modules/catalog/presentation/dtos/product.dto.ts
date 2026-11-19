import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Die Artikelnummer (SKU) ist erforderlich' })
  sku!: string;

  @IsString()
  @IsNotEmpty({ message: 'Der Produkttitel darf nicht leer sein' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Der Preis muss eine gültige Zahl sein' })
  @Min(0, { message: 'Der Preis darf nicht negativ sein' })
  price!: number;

  @Type(() => Number)
  @IsInt({ message: 'Der Lagerbestand muss eine ganze Zahl sein' })
  @Min(0, { message: 'Der Lagerbestand darf nicht negativ sein' })
  stock!: number;

  @Type(() => Number)
  @IsInt({ message: 'Bitte wähle eine gültige Kategorie-ID' })
  categoryId!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sku?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FilterProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
