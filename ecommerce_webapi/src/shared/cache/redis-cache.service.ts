import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ICachePort } from './cache.port';
import { APP_CONFIG_PORT } from '@shared/config/app-config.port';
import * as ConfigPorts from '@shared/config/app-config.port';

@Injectable()
export class RedisCacheService implements ICachePort, OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor(
    @Inject(APP_CONFIG_PORT) private readonly config: ConfigPorts.IAppConfig,
  ) {
    this.client = createClient({
      url: `redis://${this.config.redisHost}:${this.config.redisPort}`,
    });

    this.client.on('error', (err) => console.error('❌ Redis Client Error:', err));
  }

  async onModuleInit() {
    await this.client.connect();
    console.log('✅ Redis Cache erfolgreich verbunden');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.config.redisTtl;
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}
