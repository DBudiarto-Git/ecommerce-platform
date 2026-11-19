import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_CONFIG_PORT } from './app-config.port';
import { AppConfigService } from './app-config.service';
import { envValidationSchema } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [
    {
      provide: APP_CONFIG_PORT,
      useClass: AppConfigService,
    },
  ],
  exports: [APP_CONFIG_PORT],
})
export class AppConfigModule {}
