import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@generated/postgres-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import * as ConfigPorts from '@shared/config/app-config.port';
import pg from 'pg';

@Injectable()
export class PrismaPostgresService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool;

  constructor(@Inject(APP_CONFIG_PORT) private readonly config: ConfigPorts.IAppConfig) {
    const pool = new pg.Pool({ connectionString: config.databaseWriteUrl });
    const adapter = new PrismaPg(pool);
    super({ adapter }); // Übergibt den SQL-Adapter für Postgres 18
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
