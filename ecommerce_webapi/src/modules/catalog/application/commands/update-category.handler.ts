import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCategoryCommand } from './update-category.command';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryUpsertedEvent } from '../events/category-upserted.event';
import { CATALOG_WRITE_REPOSITORY_PORT } from '../../domain/repositories/catalog-write.repository.port';
import type { ICatalogWriteRepositoryPort } from '../../domain/repositories/catalog-write.repository.port';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand, CategoryEntity>
{
  constructor(
    @Inject(CATALOG_WRITE_REPOSITORY_PORT)
    private readonly writeRepo: ICatalogWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<CategoryEntity> {
    const existing = await this.writeRepo.findCategoryById(command.id);
    if (!existing) {
      throw new NotFoundException('Kategorie nicht gefunden');
    }

    const updated = await this.writeRepo.updateCategory(command.id, command.data);

    this.eventBus.publish(
      new CategoryUpsertedEvent(
        updated.id!,
        updated.name,
        updated.slug,
        updated.description,
        updated.isActive,
        updated.createdAt,
      ),
    );

    return updated;
  }
}
