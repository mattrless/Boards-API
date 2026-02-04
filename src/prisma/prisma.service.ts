import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createPrismaClient, ExtendedPrismaClient } from './prisma.client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly extendedClient: ExtendedPrismaClient;

  constructor() {
    this.extendedClient = createPrismaClient();
  }

  get user() {
    return this.extendedClient.user;
  }

  get board() {
    return this.extendedClient.board;
  }

  get systemRole() {
    return this.extendedClient.systemRole;
  }

  get profile() {
    return this.extendedClient.profile;
  }

  get client() {
    return this.extendedClient;
  }

  async onModuleInit() {
    await this.extendedClient.$connect();
  }

  async onModuleDestroy() {
    await this.extendedClient.$disconnect();
  }
}
