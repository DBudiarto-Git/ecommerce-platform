import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { CreateProductCommand } from './create-product.command';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductUpsertedEvent } from '../events/product-upserted.event';
import { CATALOG_WRITE_REPOSITORY_PORT } from '../../domain/repositories/catalog-write.repository.port';
import type { ICatalogWriteRepositoryPort } from '../../domain/repositories/catalog-write.repository.port';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, ProductEntity>
{
  constructor(
    @Inject(CATALOG_WRITE_REPOSITORY_PORT)
    private readonly writeRepo: ICatalogWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductEntity> {
    const category = await this.writeRepo.findCategoryById(command.categoryId);
    if (!category) {
      throw new BadRequestException('Die gewählte Kategorie existiert nicht');
    }

    const product = new ProductEntity({
      sku: command.sku,
      title: command.title,
      description: command.description,
      price: command.price,
      stock: command.stock,
      imageUrl: command.imageUrl,
      isActive: command.isActive,
      categoryId: command.categoryId,
    });

    const saved = await this.writeRepo.createProduct(product);

    this.eventBus.publish(
      new ProductUpsertedEvent(
        saved.id!,
        saved.sku,
        saved.title,
        saved.slug,
        saved.description,
        saved.price,
        saved.stock,
        saved.imageUrl,
        saved.isActive,
        saved.categoryId,
        saved.categoryName ?? category.name,
        saved.createdAt,
      ),
    );

    return saved;
  }
}
