import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryUpsertedEvent } from '../events/category-upserted.event';
import { CATALOG_WRITE_REPOSITORY_PORT } from '../../domain/repositories/catalog-write.repository.port';
import type { ICatalogWriteRepositoryPort } from '../../domain/repositories/catalog-write.repository.port';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand, CategoryEntity>
{
  constructor(
    @Inject(CATALOG_WRITE_REPOSITORY_PORT)
    private readonly writeRepo: ICatalogWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryEntity> {
    const category = new CategoryEntity({
      name: command.name,
      description: command.description,
      isActive: command.isActive,
    });

    const saved = await this.writeRepo.createCategory(category);

    this.eventBus.publish(
      new CategoryUpsertedEvent(
        saved.id!,
        saved.name,
        saved.slug,
        saved.description,
        saved.isActive,
        saved.createdAt,
      ),
    );

    return saved;
  }
}
