import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DevelopmentPlansService } from '../development-plans.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DevelopmentPlansService', () => {
  let service: DevelopmentPlansService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    talentDevelopmentPlan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    major: {
      findUnique: jest.fn(),
    },
    planCourse: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevelopmentPlansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DevelopmentPlansService>(DevelopmentPlansService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a development plan', async () => {
      const major = { id: 'major-1', name: 'Software' };
      const plan = {
        id: 'plan-1',
        majorId: 'major-1',
        grade: 1,
        status: 'DRAFT',
        version: 1,
        major,
        planCourses: [],
      };

      mockPrismaService.major.findUnique.mockResolvedValue(major);
      mockPrismaService.talentDevelopmentPlan.create.mockResolvedValue(plan);

      const result = await service.create('user-1', {
        majorId: 'major-1',
        grade: 1,
        courses: [],
      });

      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException if major not found', async () => {
      mockPrismaService.major.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', { majorId: 'nonexistent', grade: 1, courses: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit a draft plan', async () => {
      const plan = {
        id: 'plan-1',
        status: 'DRAFT',
        planCourses: [{ id: 'pc-1' }],
      };

      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);
      mockPrismaService.talentDevelopmentPlan.update.mockResolvedValue({
        ...plan,
        status: 'SUBMITTED',
      });

      const result = await service.submit('plan-1');

      expect(result.status).toBe('SUBMITTED');
    });

    it('should throw BadRequestException if plan has no courses', async () => {
      const plan = { id: 'plan-1', status: 'DRAFT', planCourses: [] };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);

      await expect(service.submit('plan-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if plan is not draft', async () => {
      const plan = { id: 'plan-1', status: 'SUBMITTED', planCourses: [] };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);

      await expect(service.submit('plan-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a submitted plan', async () => {
      const plan = { id: 'plan-1', status: 'SUBMITTED' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);
      mockPrismaService.talentDevelopmentPlan.update.mockResolvedValue({
        ...plan,
        status: 'APPROVED',
      });

      const result = await service.approve('plan-1', 'approver-1', { comment: 'OK' });

      expect(result.status).toBe('APPROVED');
    });

    it('should throw BadRequestException if plan is not submitted', async () => {
      const plan = { id: 'plan-1', status: 'DRAFT' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);

      await expect(
        service.approve('plan-1', 'approver-1', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a submitted plan', async () => {
      const plan = { id: 'plan-1', status: 'SUBMITTED' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);
      mockPrismaService.talentDevelopmentPlan.update.mockResolvedValue({
        ...plan,
        status: 'REJECTED',
        rejectionReason: '需要修改',
      });

      const result = await service.reject('plan-1', { reason: '需要修改' });

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe('需要修改');
    });

    it('should throw BadRequestException if reason is empty', async () => {
      const plan = { id: 'plan-1', status: 'SUBMITTED' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);

      await expect(service.reject('plan-1', { reason: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a draft plan', async () => {
      const plan = { id: 'plan-1', status: 'DRAFT' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);
      mockPrismaService.talentDevelopmentPlan.delete.mockResolvedValue(plan);

      const result = await service.delete('plan-1');

      expect(result).toEqual({ message: '删除成功' });
    });

    it('should throw BadRequestException if plan is not draft', async () => {
      const plan = { id: 'plan-1', status: 'SUBMITTED' };
      mockPrismaService.talentDevelopmentPlan.findUnique.mockResolvedValue(plan);

      await expect(service.delete('plan-1')).rejects.toThrow(BadRequestException);
    });
  });
});
