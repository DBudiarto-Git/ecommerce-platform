import { SYSTEM_ROLES, type AppRole } from '@shared/auth/auth-types';
import type { LoginCredentials, LoginResponse } from '../../domain/models/auth.models';
import type { IAuthRepositoryPort } from '../../domain/repositories/auth.repository.port';

export class LoginUseCase {
  private readonly authRepo: IAuthRepositoryPort; // 1. Feld explizit deklarieren

  constructor(authRepo: IAuthRepositoryPort) {
    this.authRepo = authRepo;                     // 2. Im Konstruktor zuweisen
  }

  async execute(credentials: LoginCredentials): Promise<{
    accessToken: string;
    redirectPath: string;
  }> {
    const response: LoginResponse = await this.authRepo.login(credentials);

    // Fachliche Regel: Kunden haben ihre eigene Storefront-Webseite
    if (response.user.roleName === SYSTEM_ROLES.CUSTOMER) {
      throw new Error(
        'Dieser Bereich ist nur für interne Mitarbeiter. Bitte nutze unseren Online-Shop.',
      );
    }

    const redirectPath = this.resolveRedirectPath(response.user.roleName);

    if (response.user.mustChangePassword) {
      return {
        accessToken: response.accessToken,
        redirectPath: '/change-password?forced=true',
      };
    }

    return {
      accessToken: response.accessToken,
      redirectPath,
    };
  }

  /**
   * Bestimmt die Zielseite anhand der angemeldeten Rolle
   */
  public resolveRedirectPath(role: AppRole): string {
    if (role === 'PACKER') {
      return '/packer-dashboard';
    }
    // Standard-Ziel für ADMIN, MANAGER, GUEST (und zukünftige Büro-Rollen)
    return '/dashboard';
  }
}
