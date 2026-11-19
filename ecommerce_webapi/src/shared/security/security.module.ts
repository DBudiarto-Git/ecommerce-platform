import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import * as ConfigPorts from '@shared/config/app-config.port';
import { PASSWORD_HASHER_PORT } from './password-hasher.port';
import { BcryptHasherService } from './bcrypt-hasher.service';
import { TOKEN_SERVICE_PORT } from './token-service.port';
import { JwtTokenService } from './jwt-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [APP_CONFIG_PORT],
      useFactory: (config: ConfigPorts.IAppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as any },
      }),
    }),
  ],
  providers: [
    {
      provide: PASSWORD_HASHER_PORT,
      useClass: BcryptHasherService,
    },
    {
      provide: TOKEN_SERVICE_PORT,
      useClass: JwtTokenService,
    },
  ],
  exports: [PASSWORD_HASHER_PORT, TOKEN_SERVICE_PORT, JwtModule],
})
export class SecurityModule {}
