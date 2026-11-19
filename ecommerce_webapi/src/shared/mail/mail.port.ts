export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface IMailPort {
  sendMail(options: SendMailOptions): Promise<void>;
}

export const MAIL_PORT = Symbol('MAIL_PORT');
