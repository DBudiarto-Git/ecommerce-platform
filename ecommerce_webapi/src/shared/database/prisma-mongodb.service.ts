/*
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@generated/mongodb-client';

@Injectable()
export class PrismaMongodbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // In Prisma 7 zieht sich der Client die URL vollautomatisch über die prisma.config.ts,
    // sofern wir dem Konstruktor keine Parameter übergeben. TypeScript ist sofort glücklich!
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}*/
