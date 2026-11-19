import { AppRole } from '@shared/decorators/roles.decorator';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly plainPassword?: string,
    public readonly name?: string | null,
    public readonly roleName: AppRole = 'CUSTOMER', // Standardwert für Astro-Storefront
    public readonly isActive: boolean = true,
  ) {}
}
