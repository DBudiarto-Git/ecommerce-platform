import { Global, Module } from '@nestjs/common';
import { CACHE_PORT } from './cache.port';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_PORT,
      useClass: RedisCacheService,
    },
  ],
  exports: [CACHE_PORT],
})
export class CacheModule {}
