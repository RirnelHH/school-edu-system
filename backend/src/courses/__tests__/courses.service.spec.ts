import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseCategory } from '../dto/course.dto';

describe('CoursesService', () => {
  let coursesService: CoursesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    majorCourse: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    coursesService = module.get<CoursesService>(CoursesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    const courseData = {
      code: 'CS101',
      name: '计算机基础',
      credits: 4,
      category: CourseCategory.PUBLIC,
      totalHours: 64,
    };

    it('should create a course successfully', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      mockPrismaService.course.create.mockResolvedValue({ id: '1', ...courseData });

      const result = await coursesService.createCourse(courseData);

      expect(result).toHaveProperty('id');
      expect(result.code).toBe(courseData.code);
    });

    it('should throw ConflictException if course code exists', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(coursesService.createCourse(courseData)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllCourses', () => {
    it('should return all courses', async () => {
      const courses = [
        { id: '1', code: 'CS101', name: 'Course 1', category: 'PUBLIC' },
        { id: '2', code: 'CS201', name: 'Course 2', category: 'PROFESSIONAL' },
      ];
      mockPrismaService.course.findMany.mockResolvedValue(courses);

      const result = await coursesService.findAllCourses();

      expect(result).toHaveLength(2);
    });

    it('should filter by category', async () => {
      mockPrismaService.course.findMany.mockResolvedValue([]);

      await coursesService.findAllCourses('PUBLIC');

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith({
        where: { category: 'PUBLIC' },
        include: expect.any(Object),
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('findCourseById', () => {
    it('should return course with details', async () => {
      const course = {
        id: '1',
        code: 'CS101',
        name: '计算机基础',
        majorCourses: [],
        grades: [],
      };
      mockPrismaService.course.findUnique.mockResolvedValue(course);

      const result = await coursesService.findCourseById('1');

      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(coursesService.findCourseById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const course = { id: '1', name: 'Old Name' };
      mockPrismaService.course.findUnique.mockResolvedValue(course);
      mockPrismaService.course.update.mockResolvedValue({ id: '1', name: 'New Name' });

      const result = await coursesService.updateCourse('1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(coursesService.updateCourse('nonexistent', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.majorCourse.findMany.mockResolvedValue([]);
      mockPrismaService.course.delete.mockResolvedValue({ id: '1' });

      const result = await coursesService.deleteCourse('1');

      expect(mockPrismaService.course.delete).toHaveBeenCalled();
    });

    it('should throw ConflictException if course is in use', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.majorCourse.findMany.mockResolvedValue([{ id: 'mc1' }]);

      await expect(coursesService.deleteCourse('1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(coursesService.deleteCourse('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
