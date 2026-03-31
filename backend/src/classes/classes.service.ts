import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, UpdateClassDto, QueryClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClassDto) {
    const major = await this.prisma.major.findUnique({
      where: { id: data.majorId },
    });
    if (!major) {
      throw new NotFoundException('专业不存在');
    }

    // 检查同一专业下班级名是否已存在
    const existing = await this.prisma.class.findFirst({
      where: { majorId: data.majorId, name: data.name },
    });
    if (existing) {
      throw new ConflictException('该专业下班级名已存在');
    }

    // 如果没提供入学年份，根据当前年份和年级推算
    // 假设当前是2026年，grade=1 则 enrollmentYear = 2026 - (grade - 1)
    const enrollmentYear = data.enrollmentYear || (new Date().getFullYear() - (data.grade - 1));

    return this.prisma.class.create({
      data: {
        majorId: data.majorId,
        name: data.name,
        grade: data.grade,
        studentCount: data.studentCount || 0,
        roomId: data.roomId,
        enrollmentYear,
      },
      include: {
        major: { include: { department: true } },
        classTeacher: true,
      },
    });
  }

  async findAll(query: QueryClassDto) {
    const where: any = {};
    if (query.majorId) where.majorId = query.majorId;
    if (query.grade) where.grade = query.grade;
    if (query.enrollmentYear) where.enrollmentYear = query.enrollmentYear;

    return this.prisma.class.findMany({
      where,
      include: {
        major: { include: { department: true } },
        classTeacher: true,
        _count: { select: { students: true } },
      },
      orderBy: [{ grade: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        major: { include: { department: { include: { school: true } } } },
        classTeacher: true,
        students: true,
        teacherHistory: true,
      },
    });

    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    return cls;
  }

  async update(id: string, data: UpdateClassDto) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    return this.prisma.class.update({
      where: { id },
      data,
    });
  }

  async assignTeacher(classId: string, teacherId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    // 记录历史
    await this.prisma.classTeacherHistory.create({
      data: {
        classId,
        teacherId,
        startedAt: new Date(),
      },
    });

    // 更新当前班主任
    return this.prisma.class.update({
      where: { id: classId },
      data: { classTeacherId: teacherId },
    });
  }

  async delete(id: string) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    const students = await this.prisma.student.findMany({
      where: { classId: id },
    });
    if (students.length > 0) {
      throw new ConflictException('该班级下还有学生，无法删除');
    }

    return this.prisma.class.delete({ where: { id } });
  }

  // 判断班级是否为当前学期的毕业班
  async isGraduatingClass(classId: string, semesterNumber: number) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { major: true },
    });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    const graduatingGrade = cls.major.duration - 1;
    return {
      classId,
      className: cls.name,
      grade: cls.grade,
      majorDuration: cls.major.duration,
      graduatingGrade,
      currentSemester: semesterNumber,
      isGraduating: cls.grade === graduatingGrade && semesterNumber === 2,
    };
  }
}
