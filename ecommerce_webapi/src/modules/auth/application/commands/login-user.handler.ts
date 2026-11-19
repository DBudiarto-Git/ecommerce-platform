import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, UnauthorizedException } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { PASSWORD_HASHER_PORT } from '@shared/security/password-hasher.port';
import type { IPasswordHasherPort } from '@shared/security/password-hasher.port';
import { TOKEN_SERVICE_PORT } from '@shared/security/token-service.port';
import type { ITokenServicePort } from '@shared/security/token-service.port';
import { RegisterUserResult } from './register-user.handler';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler
  implements ICommandHandler<LoginUserCommand, RegisterUserResult>
{
  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IPasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: ITokenServicePort,
  ) {}

  async execute(command: LoginUserCommand): Promise<RegisterUserResult> {
    // 1. User aus PostgreSQL (Write-DB) laden, da dort der Passwort-Hash liegt
    const user = await this.authWriteRepo.findByEmail(command.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Dein Benutzerkonto wurde deaktiviert. Bitte kontaktiere den Support.');
    }

    // 2. Passwort über Bcrypt-Port vergleichen
    const isPasswordValid = await this.passwordHasher.compare(
      command.plainPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    // 3. JWT ausstellen
    const roleName = user.roleName ?? 'CUSTOMER';
    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id!,
      email: user.email,
      role: roleName,
    });

    return {
      accessToken,
      user: user.toSafeProfile(),
    };
  }
}
