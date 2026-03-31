import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TeacherTemplatesService } from '../teacher-templates.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TeacherTemplatesService', () => {
  let teacherTemplatesService: TeacherTemplatesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    teacherCourseTemplate: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    semesterWeekConfig: {
      findUnique: jest.fn(),
    },
    semester: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherTemplatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    teacherTemplatesService = module.get<TeacherTemplatesService>(TeacherTemplatesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a teacher course template', async () => {
      const templateData = {
        teacherId: 'teacher-1',
        courseId: 'course-1',
        courseName: 'JavaScript',
        weekHours: 4,
        theoryHours: 2,
        practiceHours: 2,
        lessonType: 'THEORY' as const,
        semesterId: 'sem-1',
        teachingClasses: [],
      };

      const createdTemplate = {
        id: 'template-1',
        teacherId: 'teacher-1',
        courseId: 'course-1',
        courseName: 'JavaScript',
        weekHours: 4,
        theoryHours: 2,
        practiceHours: 2,
        practiceHoursPercent: 50,
        lessonType: 'THEORY',
        semesterId: 'sem-1',
        status: 'DRAFT',
        totalHours: 72,
        teachingClasses: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue({ id: 'teacher-1', user: { name: 'Test' } });
      mockPrismaService.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrismaService.semester.findUnique.mockResolvedValue({ id: 'sem-1' });
      mockPrismaService.semesterWeekConfig.findUnique.mockResolvedValue({ weekCount: 18 });
      mockPrismaService.teacherCourseTemplate.findFirst.mockResolvedValue(null);
      mockPrismaService.teacherCourseTemplate.create.mockResolvedValue(createdTemplate);

      const result = await teacherTemplatesService.create('user-1', templateData);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('DRAFT');
    });

    it('should throw NotFoundException if teacher not found', async () => {
      const templateData = {
        teacherId: 'teacher-1',
        courseId: 'course-1',
        courseName: 'JavaScript',
        weekHours: 4,
        theoryHours: 2,
        practiceHours: 2,
        lessonType: 'THEORY' as const,
        semesterId: 'sem-1',
        teachingClasses: [],
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherTemplatesService.create('user-1', templateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit a draft template', async () => {
      const template = {
        id: 'template-1',
        teacherId: 'teacher-1',
        status: 'DRAFT',
      };

      mockPrismaService.teacherCourseTemplate.findUnique.mockResolvedValue(template);
      mockPrismaService.teacherCourseTemplate.update.mockResolvedValue({
        ...template,
        status: 'SUBMITTED',
      });

      const result = await teacherTemplatesService.submit('template-1');

      expect(result.status).toBe('SUBMITTED');
    });

    it('should throw NotFoundException if template not found', async () => {
      mockPrismaService.teacherCourseTemplate.findUnique.mockResolvedValue(null);

      await expect(teacherTemplatesService.submit('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a submitted template', async () => {
      const template = {
        id: 'template-1',
        teacherId: 'teacher-1',
        status: 'SUBMITTED',
      };

      mockPrismaService.teacherCourseTemplate.findUnique.mockResolvedValue(template);
      mockPrismaService.teacherCourseTemplate.update.mockResolvedValue({
        ...template,
        status: 'APPROVED',
      });

      const result = await teacherTemplatesService.approve('template-1');

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('reject', () => {
    it('should reject template with reason', async () => {
      const template = {
        id: 'template-1',
        teacherId: 'teacher-1',
        status: 'SUBMITTED',
      };

      mockPrismaService.teacherCourseTemplate.findUnique.mockResolvedValue(template);
      mockPrismaService.teacherCourseTemplate.update.mockResolvedValue({
        ...template,
        status: 'REJECTED',
        rejectReason: '课时不足',
      });

      const result = await teacherTemplatesService.reject('template-1', '课时不足');

      expect(result.status).toBe('REJECTED');
    });
  });
});
