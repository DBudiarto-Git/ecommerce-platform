import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { APP_CONFIG_PORT, IAppConfig } from '@shared/config/app-config.port';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globale Eingabe-Validierung für alle kommenden DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Entfernt automatisch alle Felder, die nicht im DTO stehen
      forbidNonWhitelisted: true, // Wirft einen 400-Fehler, wenn unerlaubte Felder gesendet werden
      transform: true,            // Wandelt Payloads automatisch in die definierten DTO-Klassen/Typen um
    }),
  );

  // Typsicherer Zugriff über das Interface
  const appConfig = app.get<IAppConfig>(APP_CONFIG_PORT);

  // CORS für das React-Dashboard (Port 5173) und spätere Astro-Storefront (Port 4321) erlauben
  app.enableCors({
    origin: appConfig.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(appConfig.appPort);
  console.log(`🚀 Application running in [${appConfig.nodeEnv}] on: http://localhost:${appConfig.appPort}`);
}
bootstrap();

