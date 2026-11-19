import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import * as ConfigPorts from '@shared/config/app-config.port';

@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  private readonly client: MongoClient;
  public db!: Db;

  constructor(
    @Inject(APP_CONFIG_PORT) private readonly config: ConfigPorts.IAppConfig,
  ) {
    // Injiziert deine MONGO_URL direkt in den nativen Treiber
    this.client = new MongoClient(this.config.databaseReadUrl);
  }

  async onModuleInit() {
    await this.client.connect();
    // Verbindet sich direkt mit deiner Datenbank 'ecommerce_queries'
    this.db = this.client.db();
    console.log('✅ MongoDB (Read) nativ verbunden');
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
