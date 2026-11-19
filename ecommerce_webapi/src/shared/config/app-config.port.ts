export interface IAppConfig {
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly appPort: number;
  readonly corsOrigins: string[]; 
  readonly databaseWriteUrl: string;
  readonly databaseReadUrl: string;
  readonly redisHost: string;
  readonly redisPort: number;
  readonly redisTtl: number;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly mailFrom: string; 
  readonly dashboardUrl: string;
}

// Injection Token für NestJS Dependency Injection
export const APP_CONFIG_PORT = Symbol('APP_CONFIG_PORT');
