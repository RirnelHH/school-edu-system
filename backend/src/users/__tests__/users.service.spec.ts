import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    account: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      username: 'newuser',
      password: 'password123',
      name: 'New User',
      accountType: 'TEACHER' as const,
      email: 'new@example.com',
    };

    it('should create a new user successfully', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);
      mockPrismaService.account.create.mockResolvedValue({
        id: 'account-id',
        username: userData.username,
        accountType: userData.accountType,
        user: { id: 'user-id', name: userData.name },
      });

      const result = await usersService.createUser(userData);

      expect(result).toHaveProperty('id');
      expect(result.username).toBe(userData.username);
      expect(mockPrismaService.account.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if username exists', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(usersService.createUser(userData)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.account.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockAccount = {
        id: 'account-id',
        username: 'testuser',
        accountType: 'ADMIN',
        user: {
          id: 'user-id',
          name: 'Test User',
          userRoles: [],
        },
      };
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await usersService.findById('account-id');

      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(usersService.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockAccounts = [
        { id: '1', username: 'user1', accountType: 'ADMIN', user: { name: 'User 1' } },
        { id: '2', username: 'user2', accountType: 'TEACHER', user: { name: 'User 2' } },
      ];
      mockPrismaService.account.findMany.mockResolvedValue(mockAccounts);

      const result = await usersService.findAll();

      expect(result).toEqual(mockAccounts);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockAccount = {
        id: 'account-id',
        user: { id: 'user-id', name: 'Old Name' },
      };
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-id',
        name: 'New Name',
      });

      const result = await usersService.updateUser('account-id', {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(
        usersService.updateUser('nonexistent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user has no profile', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue({
        id: 'account-id',
        user: null,
      });

      await expect(
        usersService.updateUser('account-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockAccount = {
        id: 'account-id',
        user: { id: 'user-id', name: 'Test User' },
      };
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.user.delete.mockResolvedValue({});
      mockPrismaService.account.delete.mockResolvedValue({});

      const result = await usersService.deleteUser('account-id');

      expect(result).toEqual({ message: '删除成功' });
      expect(mockPrismaService.user.delete).toHaveBeenCalled();
      expect(mockPrismaService.account.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(usersService.deleteUser('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
