import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMajorDto, UpdateMajorDto, QueryMajorDto } from './dto/major.dto';
import { EducationType } from '@prisma/client';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMajorDto) {
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!department) {
      throw new NotFoundException('院系不存在');
    }

    const existing = await this.prisma.major.findFirst({
      where: { departmentId: data.departmentId, code: data.code },
    });
    if (existing) {
      throw new ConflictException('该院系下专业代码已存在');
    }

    return this.prisma.major.create({
      data: {
        departmentId: data.departmentId,
        name: data.name,
        code: data.code,
        educationType: data.educationType || 'HIGH_TECH',
        duration: data.duration || 3,
      },
      include: { department: true },
    });
  }

  async findAll(query: QueryMajorDto) {
    const where: any = {};
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }
    if (query.educationType) {
      where.educationType = query.educationType;
    }
    if (query.duration) {
      where.duration = query.duration;
    }

    return this.prisma.major.findMany({
      where,
      include: { department: true, classes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const major = await this.prisma.major.findUnique({
      where: { id },
      include: {
        department: { include: { school: true } },
        classes: { include: { students: true } },
      },
    });

    if (!major) {
      throw new NotFoundException('专业不存在');
    }

    return major;
  }

  async update(id: string, data: UpdateMajorDto) {
    const major = await this.prisma.major.findUnique({ where: { id } });
    if (!major) {
      throw new NotFoundException('专业不存在');
    }

    return this.prisma.major.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const major = await this.prisma.major.findUnique({ where: { id } });
    if (!major) {
      throw new NotFoundException('专业不存在');
    }

    const classes = await this.prisma.class.findMany({
      where: { majorId: id },
    });
    if (classes.length > 0) {
      throw new ConflictException('该专业下还有班级，无法删除');
    }

    return this.prisma.major.delete({ where: { id } });
  }

  // 判断班级是否为毕业班
  // 五年制：第4年第2学期毕业
  // 三年制：第2年第2学期毕业
  // 即：grade == duration - 1 时，如果当前是第2学期，则为毕业班
  isGraduatingClass(majorDuration: number, classGrade: number, currentSemester: number): boolean {
    return classGrade === majorDuration - 1 && currentSemester === 2;
  }

  // 获取专业的毕业班年级
  getGraduatingGrade(majorDuration: number): number {
    return majorDuration - 1;
  }

  // 获取专业统计
  async getStats(departmentId?: string) {
    const where = departmentId ? { departmentId } : {};
    const majors = await this.prisma.major.findMany({ where });

    const stats = {
      total: majors.length,
      byEducationType: {
        HIGH_TECH: 0,
        SECONDARY: 0,
      } as Record<EducationType, number>,
      byDuration: {
        3: 0,
        5: 0,
      } as Record<number, number>,
    };

    for (const major of majors) {
      stats.byEducationType[major.educationType]++;
      stats.byDuration[major.duration]++;
    }

    return stats;
  }
}
