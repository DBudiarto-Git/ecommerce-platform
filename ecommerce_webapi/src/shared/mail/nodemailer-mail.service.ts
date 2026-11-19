import { Injectable, Inject, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { IMailPort, SendMailOptions } from './mail.port';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import type { IAppConfig } from '@shared/config/app-config.port';

@Injectable()
export class NodemailerMailService implements IMailPort {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NodemailerMailService.name);

  constructor(
    @Inject(APP_CONFIG_PORT) private readonly config: IAppConfig,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: false, // Für lokales Mailpit kein TLS nötig
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.mailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    this.logger.log(`📧 E-Mail erfolgreich gesendet an: ${options.to}`);
  }
}
