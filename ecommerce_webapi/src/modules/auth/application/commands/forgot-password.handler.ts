import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ForgotPasswordCommand } from './forgot-password.command';
import { AUTH_WRITE_REPOSITORY_PORT } from '../../domain/repositories/auth-write.repository.port';
import type { IAuthWriteRepositoryPort } from '../../domain/repositories/auth-write.repository.port';
import { MAIL_PORT } from '@shared/mail/mail.port';
import type { IMailPort } from '@shared/mail/mail.port';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import type { IAppConfig } from '@shared/config/app-config.port';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand, { message: string }>
{
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    @Inject(AUTH_WRITE_REPOSITORY_PORT)
    private readonly authWriteRepo: IAuthWriteRepositoryPort,
    @Inject(MAIL_PORT)
    private readonly mailService: IMailPort,
    @Inject(APP_CONFIG_PORT)
    private readonly config: IAppConfig,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<{ message: string }> {
    const genericResponse = {
      message: 'Falls ein aktives Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen versendet.',
    };

    const user = await this.authWriteRepo.findByEmail(command.email);

    // Sicherheitsregel: Bei unbekannten oder deaktivierten Konten still abbrechen
    if (!user || !user.isActive || !user.id) {
      return genericResponse;
    }

    // Kryptografisch sicheren Einmal-Token erzeugen (1 Stunde gültig)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.authWriteRepo.setPasswordResetToken(user.id, resetToken, expiry);

    const resetLink = `${this.config.dashboardUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Passwort zurücksetzen – E-Commerce Admin',
      html: `
        <h2>Passwort zurücksetzen</h2>
        <p>Hallo${user.name ? ` ${user.name}` : ''},</p>
        <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
        <p><a href="${resetLink}" style="padding: 10px 16px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; display: inline-block;">Neues Passwort festlegen</a></p>
        <p>Oder kopiere diesen Link in deinen Browser:<br /><code>${resetLink}</code></p>
        <p style="color: #64748b; font-size: 0.85rem;">Dieser Link ist aus Sicherheitsgründen nur 60 Minuten gültig. Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
      `,
    });

    this.logger.log(`📧 Passwort-Reset-Link versendet an: ${user.email}`);
    return genericResponse;
  }
}
