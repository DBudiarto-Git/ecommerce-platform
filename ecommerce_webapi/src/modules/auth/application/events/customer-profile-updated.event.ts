import { CustomerProfileEmbedded } from '../../domain/repositories/auth-read.repository.port';

export class CustomerProfileUpdatedEvent {
  constructor(
    public readonly postgresUserId: number,
    public readonly profile: CustomerProfileEmbedded,
  ) {}
}
