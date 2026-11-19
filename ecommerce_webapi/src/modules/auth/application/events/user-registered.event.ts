import { AppRole } from '@shared/decorators/roles.decorator';

export class UserRegisteredEvent {
  constructor(
    public readonly postgresUserId: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly isActive: boolean = true,
    public readonly roleName: AppRole,
    public readonly createdAt: Date,
    public readonly initialPlainPassword?: string, // <-- HIER EINFÜGEN
  ) {}
}
