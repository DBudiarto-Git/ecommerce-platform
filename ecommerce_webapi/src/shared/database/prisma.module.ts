import { Global, Module } from '@nestjs/common';
import { PrismaPostgresService } from './prisma-postgres.service';
//import { PrismaMongodbService } from './prisma-mongodb.service';
import { MongodbService } from './mongodb.service';

@Global()
@Module({
  providers: [PrismaPostgresService, MongodbService],
  exports: [PrismaPostgresService, MongodbService], // Erlaubt Zugriff von außen
})
export class PrismaModule {}
