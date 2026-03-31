import { Test, TestingModule } from '@nestjs/testing';
import { TeachingHoursService } from '../teaching-hours.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SemesterWeekConfigsService } from '../../semester-week-configs/semester-week-configs.service';

describe('TeachingHoursService', () => {
  let service: TeachingHoursService;

  const mockPrismaService = {
    semester: {
      findUnique: jest.fn(),
    },
    semesterWeekConfig: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
    scheduleEntry: {
      findMany: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    scheduleSuspension: {
      findMany: jest.fn(),
    },
  };

  const mockSemesterWeekConfigs = {
    getWeekCount: jest.fn().mockResolvedValue(18),
    getLaborWeekCount: jest.fn().mockResolvedValue(0),
    getEffectiveTeachingWeeks: jest.fn().mockResolvedValue(18),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachingHoursService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SemesterWeekConfigsService, useValue: mockSemesterWeekConfigs },
      ],
    }).compile();

    service = module.get<TeachingHoursService>(TeachingHoursService);
    jest.clearAllMocks();
  });

  describe('getClassSizeCoefficient', () => {
    it('should return 0.80 for ≤20 students', () => {
      expect(service.getClassSizeCoefficient(15)).toBe(0.80);
    });

    it('should return 0.90 for 21-30 students', () => {
      expect(service.getClassSizeCoefficient(25)).toBe(0.90);
    });

    it('should return 1.00 for 31-40 students', () => {
      expect(service.getClassSizeCoefficient(35)).toBe(1.00);
    });

    it('should return 1.15 for 41-50 students', () => {
      expect(service.getClassSizeCoefficient(45)).toBe(1.15);
    });

    it('should return 1.30 for 51-60 students', () => {
      expect(service.getClassSizeCoefficient(55)).toBe(1.30);
    });

    it('should return 1.50 for ≥61 students', () => {
      expect(service.getClassSizeCoefficient(70)).toBe(1.50);
    });
  });

  describe('getDuplicateCoefficient', () => {
    it('should return 1.0 for rank 1', () => {
      expect(service.getDuplicateCoefficient(1)).toBe(1.0);
    });

    it('should return 0.9 for rank 2', () => {
      expect(service.getDuplicateCoefficient(2)).toBe(0.9);
    });

    it('should return 0.8 for rank 3', () => {
      expect(service.getDuplicateCoefficient(3)).toBe(0.8);
    });

    it('should return 0.7 for rank 4', () => {
      expect(service.getDuplicateCoefficient(4)).toBe(0.7);
    });

    it('should return 0.6 for rank 5', () => {
      expect(service.getDuplicateCoefficient(5)).toBe(0.6);
    });

    it('should return 0.5 for rank 6+ (default)', () => {
      expect(service.getDuplicateCoefficient(6)).toBe(0.5);
    });
  });

  describe('calculateTeacherHours', () => {
    it('should calculate hours correctly', async () => {
      // Mock semester
      mockPrismaService.semester.findUnique.mockResolvedValue({
        id: 'sem-1',
        number: 1,
        academicYear: { name: '2025-2026' },
      });

      // Mock week config
      mockPrismaService.semesterWeekConfig.findUnique.mockResolvedValue({
        semesterId: 'sem-1',
        weekCount: 18,
      });

      // Mock teacher
      mockPrismaService.teacher.findUnique.mockResolvedValue({
        id: 'teacher-1',
        user: { name: '张老师' },
      });

      // Mock schedule entries
      mockPrismaService.scheduleEntry.findMany.mockResolvedValue([
        {
          id: 'entry-1',
          classId: 'class-1',
          courseId: 'course-1',
          teacherId: 'teacher-1',
          periodStart: 1,
          periodEnd: 2,
          scheduleVersion: { semesterId: 'sem-1' },
        },
        {
          id: 'entry-2',
          classId: 'class-2',
          courseId: 'course-1',
          teacherId: 'teacher-1',
          periodStart: 3,
          periodEnd: 4,
          scheduleVersion: { semesterId: 'sem-1' },
        },
      ]);

      // Mock classes
      mockPrismaService.class.findMany.mockResolvedValue([
        { id: 'class-1', name: '2024级1班', studentCount: 45 },
        { id: 'class-2', name: '2024级2班', studentCount: 38 },
      ]);

      // Mock courses
      mockPrismaService.course.findMany.mockResolvedValue([
        { id: 'course-1', name: '语文' },
      ]);

      // Mock suspensions
      mockPrismaService.scheduleSuspension.findMany.mockResolvedValue([]);

      const result = await service.calculateTeacherHours('teacher-1', 'sem-1');

      expect(result.teacherName).toBe('张老师');
      expect(result.semesterName).toBe('第1学期');
      expect(result.details).toHaveLength(2);
      expect(result.totalOriginalHours).toBe(72); // 4 periods * 18 weeks * 2 classes
    });
  });
});
