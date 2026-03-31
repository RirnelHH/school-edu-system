import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudentsService } from '../students.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('StudentsService', () => {
  let studentsService: StudentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    account: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    studentsService = module.get<StudentsService>(StudentsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const studentData = {
      studentNumber: '2024001',
      name: '张三',
      classId: 'class-1',
      enrollmentYear: 2024,
    };

    it('should create a student successfully', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.class.findUnique.mockResolvedValue({ id: 'class-1', name: '24级1班' });
      mockPrismaService.account.create.mockResolvedValue({
        id: 'account-1',
        userId: 'user-1',
        username: '2024001',
      });
      mockPrismaService.student.create.mockResolvedValue({
        id: 'student-1',
        ...studentData,
        userId: 'user-1',
      });
      mockPrismaService.class.update.mockResolvedValue({});

      const result = await studentsService.create(studentData);

      expect(result).toHaveProperty('id');
      expect(result.studentNumber).toBe(studentData.studentNumber);
    });

    it('should throw ConflictException if student number exists', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(studentsService.create(studentData)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(studentsService.create(studentData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const students = [
        { id: '1', studentNumber: '2024001', user: { name: '张三' } },
        { id: '2', studentNumber: '2024002', user: { name: '李四' } },
      ];
      mockPrismaService.student.findMany.mockResolvedValue(students);

      const result = await studentsService.findAll();

      expect(result).toHaveLength(2);
    });

    it('should filter students by classId', async () => {
      mockPrismaService.student.findMany.mockResolvedValue([]);

      await studentsService.findAll('class-1');

      expect(mockPrismaService.student.findMany).toHaveBeenCalledWith({
        where: { classId: 'class-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return student with details', async () => {
      const student = {
        id: '1',
        studentNumber: '2024001',
        user: { name: '张三' },
        class: { name: '24级1班' },
        grades: [],
        checkIns: [],
        leaveRequests: [],
      };
      mockPrismaService.student.findUnique.mockResolvedValue(student);

      const result = await studentsService.findOne('1');

      expect(result).toEqual(student);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(studentsService.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete student and related records', async () => {
      const student = {
        id: 'student-1',
        userId: 'user-1',
        classId: 'class-1',
        user: { id: 'user-1' },
      };
      mockPrismaService.student.findUnique.mockResolvedValue(student);
      mockPrismaService.student.delete.mockResolvedValue({});
      mockPrismaService.account.deleteMany.mockResolvedValue({});
      mockPrismaService.user.delete.mockResolvedValue({});
      mockPrismaService.class.update.mockResolvedValue({});

      const result = await studentsService.delete('student-1');

      expect(result).toEqual({ message: '删除成功' });
      expect(mockPrismaService.student.delete).toHaveBeenCalledWith({ where: { id: 'student-1' } });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(studentsService.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
