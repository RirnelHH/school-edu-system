import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SchedulingService } from '../scheduling.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AddScheduleEntryDto } from '../dto/scheduling.dto';

describe('SchedulingService', () => {
  let schedulingService: SchedulingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    scheduleVersion: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    scheduleEntry: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    schedulingService = module.get<SchedulingService>(SchedulingService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createVersion', () => {
    it('should create a scheduling version', async () => {
      const versionData = {
        semesterId: 'sem-1',
        versionNumber: 1,
      };
      const createdVersion = {
        id: 'ver-1',
        ...versionData,
        status: 'DRAFT',
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        ScheduleEntry: [],
      };

      mockPrismaService.scheduleVersion.findFirst.mockResolvedValue(null);
      mockPrismaService.scheduleVersion.create.mockResolvedValue(createdVersion);

      const result = await schedulingService.createVersion(versionData);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('DRAFT');
    });

    it('should throw ConflictException if version number exists', async () => {
      const versionData = {
        semesterId: 'sem-1',
        versionNumber: 1,
      };

      mockPrismaService.scheduleVersion.findFirst.mockResolvedValue(null);
      mockPrismaService.scheduleVersion.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(schedulingService.createVersion(versionData)).rejects.toThrow(ConflictException);
    });
  });

  describe('publishVersion', () => {
    it('should publish a draft version', async () => {
      const version = {
        id: 'ver-1',
        semesterId: 'sem-1',
        versionNumber: 1,
        status: 'DRAFT',
        publishedAt: null,
        createdBy: 'system',
        ScheduleEntry: [],
      };

      mockPrismaService.scheduleVersion.findUnique.mockResolvedValue(version);
      mockPrismaService.scheduleVersion.update.mockResolvedValue({
        ...version,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      });

      const result = await schedulingService.publishVersion('ver-1');

      expect(result.status).toBe('PUBLISHED');
    });

    it('should throw NotFoundException if version not found', async () => {
      mockPrismaService.scheduleVersion.findUnique.mockResolvedValue(null);

      await expect(schedulingService.publishVersion('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkConflicts', () => {
    it('should return empty array when no conflicts', async () => {
      mockPrismaService.scheduleEntry.findMany.mockResolvedValue([]);

      const conflicts = await schedulingService.checkConflicts(
        'ver-1', '', '', 'class-1', 1, 1, 2
      );

      expect(conflicts).toEqual([]);
    });

    it('should detect conflict when room is occupied', async () => {
      const existingEntry = {
        id: 'entry-1',
        roomId: 'room-1',
        weekday: 1,
        periodStart: 1,
        periodEnd: 2,
        scheduleVersionId: 'ver-1',
        classId: 'class-1',
        teacherId: 'teacher-1',
        courseId: 'course-1',
      };

      mockPrismaService.scheduleEntry.findMany.mockResolvedValue([existingEntry]);

      const conflicts = await schedulingService.checkConflicts(
        'ver-1', 'room-1', '', '', 1, 1, 2
      );

      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('addEntry', () => {
    it('should add a schedule entry', async () => {
      const entryData: AddScheduleEntryDto = {
        scheduleVersionId: 'ver-1',
        classId: 'class-1',
        courseId: 'course-1',
        teacherId: 'teacher-1',
        weekday: 1,
        periodStart: 1,
        periodEnd: 2,
        lessonType: 'THEORY',
      };

      mockPrismaService.scheduleEntry.findMany.mockResolvedValue([]);
      mockPrismaService.scheduleEntry.create.mockResolvedValue({
        id: 'entry-new',
        ...entryData,
      });

      const result = await schedulingService.addEntry(entryData);

      expect(result).toHaveProperty('id');
    });
  });

  describe('getVersions', () => {
    it('should return versions for a semester', async () => {
      const versions = [
        { id: 'ver-1', semesterId: 'sem-1', versionNumber: 1, status: 'DRAFT' },
      ];

      mockPrismaService.scheduleVersion.findMany.mockResolvedValue(versions);

      const result = await schedulingService.getVersions('sem-1');

      expect(result).toHaveLength(1);
    });
  });
});
