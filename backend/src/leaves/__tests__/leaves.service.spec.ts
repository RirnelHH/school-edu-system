import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LeavesService } from '../leaves.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaveType } from '../dto/leave.dto';

describe('LeavesService', () => {
  let service: LeavesService;

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
    },
    leaveRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    leaveStep: {
      create: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
    jest.clearAllMocks();
  });

  describe('createLeave', () => {
    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.createLeave('invalid', {
        type: LeaveType.PERSONAL,
        startDate: '2024-10-15',
        endDate: '2024-10-16',
        reason: 'test',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if start date after end date', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue({
        id: 'student-1',
        class: { id: 'class-1' },
      });

      await expect(service.createLeave('student-1', {
        type: LeaveType.PERSONAL,
        startDate: '2024-10-16',
        endDate: '2024-10-15',
        reason: 'test',
      })).rejects.toThrow(BadRequestException);
    });

    it('should create a leave request', async () => {
      const student = { id: 'student-1', classId: 'class-1', class: { id: 'class-1', name: '2024级1班' } };
      mockPrismaService.student.findUnique.mockResolvedValue(student);
      mockPrismaService.leaveRequest.create.mockResolvedValue({
        id: 'leave-1',
        studentId: 'student-1',
        status: 'PENDING',
      });

      const result = await service.createLeave('student-1', {
        type: LeaveType.PERSONAL,
        startDate: '2024-10-15',
        endDate: '2024-10-16',
        reason: '家中有事',
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('hasAdminRole', () => {
    it('should return true for ADMIN role', async () => {
      mockPrismaService.userRole.findMany.mockResolvedValue([
        { role: { name: 'ADMIN' } },
      ]);

      const result = await service.hasAdminRole('user-1');
      expect(result).toBe(true);
    });

    it('should return false for regular user', async () => {
      mockPrismaService.userRole.findMany.mockResolvedValue([]);

      const result = await service.hasAdminRole('user-1');
      expect(result).toBe(false);
    });
  });
});
