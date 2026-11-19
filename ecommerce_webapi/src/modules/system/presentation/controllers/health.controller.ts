import { Controller, Get, Inject } from '@nestjs/common';
import * as appConfigPort from '@shared/config/app-config.port';
import { Public } from '@shared/decorators/public.decorator'; // 1. Import hinzufügen

@Controller('health')
export class HealthController {
  constructor(
    @Inject(appConfigPort.APP_CONFIG_PORT) private readonly config: appConfigPort.IAppConfig,
  ) {}

  @Public() // 2. Route für den globalen JwtAuthGuard freischalten
  @Get()
  check() {
    return {
      status: 'ok',
      environment: this.config.nodeEnv,
      timestamp: new Date().toISOString(),
    };
  }
}
