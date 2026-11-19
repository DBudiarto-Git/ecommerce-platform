import { CustomerProfileData } from '../../domain/repositories/auth-write.repository.port';

export class UpsertCustomerProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly profileData: CustomerProfileData,
  ) {}
}
