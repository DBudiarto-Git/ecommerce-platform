import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { AppConfigModule } from '@shared/config/app-config.module';
import { PrismaModule } from '@shared/database/prisma.module';
import { CacheModule } from '@shared/cache/cache.module';
import { SecurityModule } from '@shared/security/security.module';
import { MailModule } from '@shared/mail/mail.module'; // 1. Import prüfen
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '@shared/interceptors/transform.interceptor';
import { SystemModule } from '@modules/system/system.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    CqrsModule.forRoot(), // <-- Aktiviert CommandBus, QueryBus und EventBus global
    AppConfigModule, 
    PrismaModule, // <-- Aktiviert den globalen Zugriff auf beide DBs
    CacheModule, // <-- Globaler Cache verfügbar
    SecurityModule, // <-- Globaler Zugriff auf Hashing & JWT
    MailModule, // 2. Hier in imports einfügen!
    SystemModule,
    AuthModule, // <-- Neues Fachmodul registriert
  ],
  providers: [
    // Globale Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Läuft immer zuerst
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // 2. Prüft danach die Rollen
    },
    // Globaler Exception-Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Globale Interceptoren
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

