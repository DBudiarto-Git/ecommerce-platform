import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '@shared/decorators/public.decorator';
import { Roles } from '@shared/decorators/roles.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import {
  CreateProductDto,
  FilterProductsQueryDto,
  UpdateProductDto,
} from '../dtos/product.dto';
import { CreateCategoryCommand } from '../../application/commands/create-category.command';
import { UpdateCategoryCommand } from '../../application/commands/update-category.command';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product.command';
import { GetCategoriesQuery } from '../../application/queries/get-categories.query';
import { GetProductsQuery } from '../../application/queries/get-products.query';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ===========================================================================
  // KATEGORIEN
  // ===========================================================================

  @Public()
  @Get('categories')
  async getPublicCategories() {
    return this.queryBus.execute(new GetCategoriesQuery(true));
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('admin/categories')
  async getAllCategoriesForAdmin() {
    return this.queryBus.execute(new GetCategoriesQuery(false));
  }

  @Roles('ADMIN', 'MANAGER')
  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(dto.name, dto.description, dto.isActive ?? true),
    );
  }

  @Roles('ADMIN', 'MANAGER')
  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateCategoryCommand(id, dto));
  }

  // ===========================================================================
  // PRODUKTE
  // ===========================================================================

  @Public()
  @Get('products')
  async getPublicProducts(@Query() filter: FilterProductsQueryDto) {
    return this.queryBus.execute(
      new GetProductsQuery({
        ...filter,
        isActive: true, // Öffentlicher Shop sieht immer nur aktive Produkte
      }),
    );
  }

  @Roles('ADMIN', 'MANAGER')
  @Get('admin/products')
  async getAllProductsForAdmin(@Query() filter: FilterProductsQueryDto) {
    return this.queryBus.execute(new GetProductsQuery(filter));
  }

  @Roles('ADMIN', 'MANAGER')
  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.commandBus.execute(
      new CreateProductCommand(
        dto.sku,
        dto.title,
        dto.price,
        dto.stock,
        dto.categoryId,
        dto.description,
        dto.imageUrl,
        dto.isActive ?? true,
      ),
    );
  }

  @Roles('ADMIN', 'MANAGER')
  @Patch('products/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.commandBus.execute(new UpdateProductCommand(id, dto));
  }
}
