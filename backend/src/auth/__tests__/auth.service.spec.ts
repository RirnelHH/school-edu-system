import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loginLog: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null when account not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
        include: { user: true },
      });
    });

    it('should throw HttpException when account is locked', async () => {
      const lockedAccount = {
        id: 'account-id',
        username: 'testuser',
        password: 'hashedpassword',
        lockedUntil: new Date(Date.now() + 60000), // 1 minute in future
        failedAttempts: 5,
        status: 'LOCKED',
      };
      mockPrismaService.account.findUnique.mockResolvedValue(lockedAccount);

      await expect(authService.validateUser('testuser', 'password')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const account = {
        id: 'account-id',
        username: 'testuser',
        password: await bcrypt.hash('correctpassword', 10),
        lockedUntil: null,
        failedAttempts: 0,
        status: 'ACTIVE',
      };
      mockPrismaService.account.findUnique.mockResolvedValue(account);
      mockPrismaService.account.update.mockResolvedValue({});
      mockPrismaService.loginLog.create.mockResolvedValue({});

      await expect(
        authService.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after 5 failed attempts', async () => {
      const account = {
        id: 'account-id',
        username: 'testuser',
        password: await bcrypt.hash('correctpassword', 10),
        lockedUntil: null,
        failedAttempts: 4,
        status: 'ACTIVE',
      };
      mockPrismaService.account.findUnique.mockResolvedValue(account);
      mockPrismaService.account.update.mockResolvedValue({ ...account, failedAttempts: 5 });
      mockPrismaService.loginLog.create.mockResolvedValue({});

      await expect(
        authService.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'account-id' },
        data: expect.objectContaining({
          failedAttempts: 5,
          lockedUntil: expect.any(Date),
          status: 'LOCKED',
        }),
      });
    });

    it('should return user data when credentials are correct', async () => {
      const password = 'correctpassword';
      const account = {
        id: 'account-id',
        username: 'testuser',
        password: await bcrypt.hash(password, 10),
        accountType: 'ADMIN' as const,
        lockedUntil: null,
        failedAttempts: 0,
        status: 'ACTIVE' as const,
        user: { id: 'user-id', name: 'Test User' },
      };
      mockPrismaService.account.findUnique.mockResolvedValue(account);
      mockPrismaService.account.update.mockResolvedValue({ ...account, failedAttempts: 0 });
      mockPrismaService.loginLog.create.mockResolvedValue({});

      const result = await authService.validateUser('testuser', password);

      expect(result).toEqual({
        id: 'account-id',
        username: 'testuser',
        accountType: 'ADMIN',
        user: { id: 'user-id', name: 'Test User' },
      });
    });
  });

  describe('login', () => {
    it('should return access token and user info on successful login', async () => {
      const password = 'password123';
      const mockUser = {
        id: 'account-id',
        username: 'admin',
        accountType: 'ADMIN' as const,
        user: { id: 'user-id', name: 'Admin' },
      };

      jest.spyOn(authService as any, 'validateUser').mockResolvedValue(mockUser);

      const result = await authService.login({
        username: 'admin',
        password,
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('admin');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'account-id',
        username: 'admin',
        accountType: 'ADMIN',
        userId: 'user-id',
      });
    });

    it('should throw UnauthorizedException when validateUser returns null', async () => {
      jest.spyOn(authService as any, 'validateUser').mockResolvedValue(null);

      await expect(
        authService.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
