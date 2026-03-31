import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { schoolId: string; name: string; code: string }) {
    // 检查学校是否存在
    const school = await this.prisma.school.findUnique({
      where: { id: data.schoolId },
    });
    if (!school) {
      throw new NotFoundException('学校不存在');
    }

    // 检查同一学校下代码是否已存在
    const existing = await this.prisma.department.findFirst({
      where: { schoolId: data.schoolId, code: data.code },
    });
    if (existing) {
      throw new ConflictException('该学校下院系代码已存在');
    }

    return this.prisma.department.create({
      data,
      include: { school: true },
    });
  }

  async findAll(schoolId?: string) {
    return this.prisma.department.findMany({
      where: schoolId ? { schoolId } : undefined,
      include: { school: true, majors: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        school: true,
        majors: {
          include: { classes: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('院系不存在');
    }

    return department;
  }

  async update(id: string, data: { name?: string; code?: string }) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException('院系不存在');
    }

    // 检查新代码是否与其他院系冲突
    if (data.code) {
      const existing = await this.prisma.department.findFirst({
        where: { schoolId: department.schoolId, code: data.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('该学校下院系代码已存在');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException('院系不存在');
    }

    // 检查是否有专业
    const majors = await this.prisma.major.findMany({
      where: { departmentId: id },
    });
    if (majors.length > 0) {
      throw new ConflictException('该院系下还有专业，无法删除');
    }

    return this.prisma.department.delete({ where: { id } });
  }
}
