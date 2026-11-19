import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './app-config.port';

@Injectable()
export class AppConfigService implements IAppConfig {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): 'development' | 'production' | 'test' {
    return this.configService.getOrThrow<'development' | 'production' | 'test'>('NODE_ENV');
  }

  get appPort(): number {
    return Number(this.configService.getOrThrow<number>('APP_PORT'));
  }

  get corsOrigins(): string[] {
    const raw = this.configService.getOrThrow<string>('CORS_ORIGINS');
    return raw.split(',').map((origin) => origin.trim());
  }

  get databaseWriteUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get databaseReadUrl(): string {
    return this.configService.getOrThrow<string>('MONGO_URL');
  }

  get redisHost(): string {
    return this.configService.getOrThrow<string>('REDIS_HOST');
  }

  get redisPort(): number {
    return Number(this.configService.getOrThrow<number>('REDIS_PORT'));
  }

  get redisTtl(): number {
    return Number(this.configService.getOrThrow<number>('REDIS_TTL'));
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('JWT_EXPIRES_IN');
  }

  get smtpHost(): string {
    return this.configService.getOrThrow<string>('SMTP_HOST');
  }
  get smtpPort(): number {
    return Number(this.configService.getOrThrow<number>('SMTP_PORT'));
  }
  get mailFrom(): string {
    return this.configService.getOrThrow<string>('MAIL_FROM');
  }
  get dashboardUrl(): string {
    return this.configService.getOrThrow<string>('DASHBOARD_URL');
  }
}
