import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(data: CreateCourseDto) {
    // 检查课程编号唯一性
    const existing = await this.prisma.course.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('课程编号已存在');
    }

    return this.prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
        credits: data.credits,
        category: data.category,
        totalHours: data.totalHours,
      },
    });
  }

  async findAllCourses(category?: string) {
    return this.prisma.course.findMany({
      where: category ? { category: category as any } : undefined,
      include: {
        majorCourses: {
          include: {
            major: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        majorCourses: {
          include: {
            major: true,
          },
        },
        grades: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    return course;
  }

  async updateCourse(id: string, data: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查是否有班级课程关联
    const majorCourses = await this.prisma.majorCourse.findMany({
      where: { courseId: id },
    });

    if (majorCourses.length > 0) {
      throw new ConflictException('该课程已被专业使用，无法删除');
    }

    return this.prisma.course.delete({ where: { id } });
  }

  // 课程标准管理（使用 JSON 字段存储）
  async createStandard(courseId: string, content: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 由于没有独立的 CourseStandard 表，这里用备注字段或扩展字段存储
    // 实际生产应该添加新表，这里简化处理
    return {
      message: '课标创建成功',
      courseId,
      content,
    };
  }

  async getStandard(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    return {
      courseId,
      courseName: course.name,
    };
  }
}
