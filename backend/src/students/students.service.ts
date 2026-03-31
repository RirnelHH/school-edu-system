import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    // 检查学号唯一性
    const existing = await this.prisma.student.findUnique({
      where: { studentNumber: data.studentNumber },
    });
    if (existing) {
      throw new ConflictException('学号已存在');
    }

    // 检查班级是否存在
    const cls = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!cls) {
      throw new NotFoundException('班级不存在');
    }

    // 加密密码（学号后6位，不足补0对齐）
    const defaultPassword = data.studentNumber.padStart(6, '0').slice(-6);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 创建用户账号
    const account = await this.prisma.account.create({
      data: {
        username: data.studentNumber,
        password: hashedPassword,
        accountType: 'STUDENT',
        user: {
          create: {
            name: data.name,
            phone: data.phone,
            email: data.email,
          },
        },
      },
      include: { user: true },
    });

    // 创建学生档案
    if (!account.userId) {
      throw new BadRequestException('账号创建失败');
    }
    
    const student = await this.prisma.student.create({
      data: {
        userId: account.userId,
        studentNumber: data.studentNumber,
        classId: data.classId,
        enrollmentYear: data.enrollmentYear,
      },
      include: {
        user: true,
        class: { include: { major: true } },
      },
    });

    // 更新班级人数
    await this.prisma.class.update({
      where: { id: data.classId },
      data: { studentCount: { increment: 1 } },
    });

    return student;
  }

  async findAll(classId?: string) {
    return this.prisma.student.findMany({
      where: classId ? { classId } : undefined,
      include: {
        user: true,
        class: { include: { major: { include: { department: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: { include: { major: { include: { department: { include: { school: true } } } } } },
        grades: true,
        checkIns: { orderBy: { checkInTime: 'desc' }, take: 30 },
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    return student;
  }

  async findByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
      },
    });
  }

  async update(id: string, data: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    return this.prisma.user.update({
      where: { id: student.userId },
      data,
    });
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    // 删除学生档案
    await this.prisma.student.delete({ where: { id } });

    // 删除关联账号（通过 userId 查找）
    if (student.userId) {
      await this.prisma.account.deleteMany({
        where: { userId: student.userId },
      });
      // 删除关联用户
      await this.prisma.user.delete({
        where: { id: student.userId },
      });
    }

    // 更新班级人数
    await this.prisma.class.update({
      where: { id: student.classId },
      data: { studentCount: { decrement: 1 } },
    });

    return { message: '删除成功' };
  }

  async importFromExcel(students: CreateStudentDto[]) {
    const results = {
      successCount: 0,
      failCount: 0,
      failures: [] as { row: number; studentNumber: string; reason: string }[],
    };

    for (let i = 0; i < students.length; i++) {
      const data = students[i];
      try {
        // 查找班级
        const cls = await this.prisma.class.findFirst({
          where: { name: data.className as string },
          include: { major: true },
        });

        if (!cls) {
          throw new Error(`班级"${data.className}"不存在`);
        }

        // 检查学号
        const existing = await this.prisma.student.findUnique({
          where: { studentNumber: data.studentNumber },
        });

        if (existing) {
          throw new Error('学号已存在');
        }

        // 加密密码
        const defaultPassword = data.studentNumber.padStart(6, '0').slice(-6);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 创建学生
        const account = await this.prisma.account.create({
          data: {
            username: data.studentNumber,
            password: hashedPassword,
            accountType: 'STUDENT',
            user: {
              create: {
                name: data.name,
                phone: data.phone,
                email: data.email,
              },
            },
          },
          include: { user: true },
        });

        if (!account.userId) {
          throw new Error('账号创建失败');
        }

        await this.prisma.student.create({
          data: {
            userId: account.userId,
            studentNumber: data.studentNumber,
            classId: cls.id,
            enrollmentYear: data.enrollmentYear,
          },
        });

        await this.prisma.class.update({
          where: { id: cls.id },
          data: { studentCount: { increment: 1 } },
        });

        results.successCount++;
      } catch (error: any) {
        results.failCount++;
        results.failures.push({
          row: i + 1,
          studentNumber: data.studentNumber,
          reason: error.message,
        });
      }
    }

    return results;
  }
}
