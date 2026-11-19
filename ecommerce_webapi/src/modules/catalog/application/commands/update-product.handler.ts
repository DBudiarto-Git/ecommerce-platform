import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateProductCommand } from './update-product.command';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductUpsertedEvent } from '../events/product-upserted.event';
import { CATALOG_WRITE_REPOSITORY_PORT } from '../../domain/repositories/catalog-write.repository.port';
import type { ICatalogWriteRepositoryPort } from '../../domain/repositories/catalog-write.repository.port';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand, ProductEntity>
{
  constructor(
    @Inject(CATALOG_WRITE_REPOSITORY_PORT)
    private readonly writeRepo: ICatalogWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProductCommand): Promise<ProductEntity> {
    const existing = await this.writeRepo.findProductById(command.id);
    if (!existing) {
      throw new NotFoundException('Produkt nicht gefunden');
    }

    const updated = await this.writeRepo.updateProduct(command.id, command.data);

    this.eventBus.publish(
      new ProductUpsertedEvent(
        updated.id!,
        updated.sku,
        updated.title,
        updated.slug,
        updated.description,
        updated.price,
        updated.stock,
        updated.imageUrl,
        updated.isActive,
        updated.categoryId,
        updated.categoryName ?? '',
        updated.createdAt,
      ),
    );

    return updated;
  }
}
