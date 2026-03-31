import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SchoolsService } from '../schools.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SchoolsService', () => {
  let schoolsService: SchoolsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    school: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    schoolsService = module.get<SchoolsService>(SchoolsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const schoolData = { name: 'Test School', code: 'TEST001', address: 'Test Address' };

    it('should create a school successfully', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);
      mockPrismaService.school.create.mockResolvedValue({ id: '1', ...schoolData });

      const result = await schoolsService.create(schoolData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(schoolData.name);
      expect(mockPrismaService.school.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if school code exists', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(schoolsService.create(schoolData)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all schools', async () => {
      const schools = [{ id: '1', name: 'School 1' }, { id: '2', name: 'School 2' }];
      mockPrismaService.school.findMany.mockResolvedValue(schools);

      const result = await schoolsService.findAll();

      expect(result).toHaveLength(2);
      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return school with departments', async () => {
      const school = {
        id: '1',
        name: 'Test School',
        departments: [{ id: 'd1', name: 'Dept 1', majors: [] }],
      };
      mockPrismaService.school.findUnique.mockResolvedValue(school);

      const result = await schoolsService.findOne('1');

      expect(result).toEqual(school);
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(schoolsService.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update school successfully', async () => {
      const school = { id: '1', name: 'Old Name' };
      mockPrismaService.school.findUnique.mockResolvedValue(school);
      mockPrismaService.school.update.mockResolvedValue({ id: '1', name: 'New Name' });

      const result = await schoolsService.update('1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(schoolsService.update('nonexistent', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete school successfully', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.department.findMany.mockResolvedValue([]);
      mockPrismaService.school.delete.mockResolvedValue({ id: '1' });

      const result = await schoolsService.delete('1');

      expect(mockPrismaService.school.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(schoolsService.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if school has departments', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.department.findMany.mockResolvedValue([{ id: 'd1' }]);

      await expect(schoolsService.delete('1')).rejects.toThrow(ConflictException);
    });
  });
});
