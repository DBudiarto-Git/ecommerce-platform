import { Global, Module } from '@nestjs/common';
import { MAIL_PORT } from './mail.port';
import { NodemailerMailService } from './nodemailer-mail.service';

@Global()
@Module({
  providers: [{ provide: MAIL_PORT, useClass: NodemailerMailService }],
  exports: [MAIL_PORT],
})
export class MailModule {}
