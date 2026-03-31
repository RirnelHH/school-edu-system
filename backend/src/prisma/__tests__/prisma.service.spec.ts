import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(prismaService).toBeDefined();
    });

    it('should extend PrismaClient', () => {
      expect(prismaService).toBeInstanceOf(PrismaClient);
    });
  });

  describe('onModuleInit', () => {
    it('should call $connect on init', async () => {
      const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValue();

      await prismaService.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect on destroy', async () => {
      const disconnectSpy = jest.spyOn(prismaService, '$disconnect').mockResolvedValue();

      await prismaService.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});

// Import PrismaClient for type checking
import { PrismaClient } from '@prisma/client';
