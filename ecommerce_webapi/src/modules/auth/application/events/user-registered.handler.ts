import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UserRegisteredEvent } from './user-registered.event';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type { IAuthReadRepositoryPort } from '../../domain/repositories/auth-read.repository.port';
import { MAIL_PORT } from '@shared/mail/mail.port';
import type { IMailPort } from '@shared/mail/mail.port';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import type { IAppConfig } from '@shared/config/app-config.port';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);
  public readonly initialPlainPassword?: string;

  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
    @Inject(MAIL_PORT)
    private readonly mailService: IMailPort,
    @Inject(APP_CONFIG_PORT)
    private readonly config: IAppConfig,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`🔄 Synchronisiere User [${event.email}] in MongoDB Read-Model...`);

    await this.authReadRepo.upsertUserReadModel({
      postgresUserId: event.postgresUserId,
      email: event.email,
      name: event.name,
      isActive: event.isActive,
      roleName: event.roleName,
      createdAt: event.createdAt,
      customerProfile: null, // Wird später befüllt, sobald der Kunde sein Profil ergänzt
    });

    this.logger.log(`✅ User [${event.email}] erfolgreich in MongoDB gespeichert.`);

    if (event.initialPlainPassword) {
      await this.mailService.sendMail({
        to: event.email,
        subject: 'Dein Zugang zum E-Commerce Admin-Dashboard',
        html: `
          <h2>Willkommen im Team${event.name ? `, ${event.name}` : ''}!</h2>
          <p>Ein Administrator hat ein Benutzerkonto (Rolle: <strong>${event.roleName}</strong>) für dich erstellt.</p>
          <p><strong>Dashboard-Link:</strong> <a href="${this.config.dashboardUrl}">${this.config.dashboardUrl}</a></p>
          <p><strong>Dein temporäres Passwort:</strong> <code>${event.initialPlainPassword}</code></p>
          <p style="color: #b91c1c; font-weight: bold;">
            Wichtiger Sicherheitshinweis: Bitte ändere dieses Passwort sofort nach deinem ersten Login!
          </p>
        `,
      });
    }
  }
}
