import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpsertCustomerProfileCommand } from './upsert-customer-profile.command';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type {
  IAuthWriteRepositoryPort,
  SavedCustomerRecord,
} from '../../domain/repositories/auth-write.repository.port';

@CommandHandler(UpsertCustomerProfileCommand)
export class UpsertCustomerProfileHandler
  implements ICommandHandler<UpsertCustomerProfileCommand, SavedCustomerRecord>
{
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpsertCustomerProfileCommand): Promise<SavedCustomerRecord> {
    const user = await this.authWriteRepo.findById(command.userId);
    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // Fachliche Regel: Nur Kunden (CUSTOMER) besitzen ein erweitertes Kundenprofil
    if (user.roleName !== 'CUSTOMER') {
      throw new ForbiddenException(
        'Ein Kundenprofil kann nur für Benutzer mit der Rolle CUSTOMER gepflegt werden',
      );
    }

    // 1. In PostgreSQL (CustomerWrite) speichern
    const savedCustomer = await this.authWriteRepo.upsertCustomerProfile(
      command.userId,
      command.profileData,
    );

    // 2. Event feuern -> Aktualisiert MongoDB und löscht alten Redis-Cache
    this.eventBus.publish(
      new CustomerProfileUpdatedEvent(command.userId, {
        postgresCustomerId: savedCustomer.id,
        firstName: savedCustomer.firstName,
        lastName: savedCustomer.lastName,
        phone: savedCustomer.phone,
        address: savedCustomer.address,
      }),
    );

    return savedCustomer;
  }
}
