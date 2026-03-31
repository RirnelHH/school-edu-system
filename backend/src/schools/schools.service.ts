import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; code: string; address?: string; contact?: string }) {
    // 检查学校代码是否已存在
    const existing = await this.prisma.school.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('学校代码已存在');
    }

    return this.prisma.school.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            majors: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('学校不存在');
    }

    return school;
  }

  async update(id: string, data: { name?: string; address?: string; contact?: string }) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException('学校不存在');
    }

    return this.prisma.school.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException('学校不存在');
    }

    // 检查是否有院系
    const departments = await this.prisma.department.findMany({
      where: { schoolId: id },
    });

    if (departments.length > 0) {
      throw new ConflictException('该学校下还有院系，无法删除');
    }

    return this.prisma.school.delete({ where: { id } });
  }
}
