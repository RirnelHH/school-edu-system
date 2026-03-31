import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto, ApprovePlanDto, RejectPlanDto } from './dto/plan.dto';

@Injectable()
export class DevelopmentPlansService {
  constructor(private prisma: PrismaService) {}

  // 创建培养计划（草稿）
  async create(userId: string, data: CreatePlanDto) {
    // 验证专业存在
    const major = await this.prisma.major.findUnique({
      where: { id: data.majorId },
    });
    if (!major) {
      throw new NotFoundException('专业不存在');
    }

    // 创建计划
    const plan = await this.prisma.talentDevelopmentPlan.create({
      data: {
        majorId: data.majorId,
        grade: data.grade,
        status: 'DRAFT',
        version: 1,
        createdBy: userId,
        planCourses: {
          create: data.courses.map((c) => ({
            courseId: c.courseId,
            semester: c.semester,
            hoursPerWeek: c.hoursPerWeek,
            practiceHoursPercent: c.practiceHoursPercent,
          })),
        },
      },
      include: {
        major: true,
        planCourses: true,
      },
    });

    return plan;
  }

  // 查询所有计划
  async findAll(majorId?: string, status?: string) {
    return this.prisma.talentDevelopmentPlan.findMany({
      where: {
        majorId: majorId ? majorId : undefined,
        status: status as any,
      },
      include: {
        major: true,
        planCourses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 查询单个计划
  async findOne(id: string) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
      include: {
        major: { include: { department: true } },
        planCourses: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    return plan;
  }

  // 更新计划（仅草稿状态）
  async update(id: string, userId: string, data: UpdatePlanDto) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    if (plan.status !== 'DRAFT' && plan.status !== 'REJECTED') {
      throw new BadRequestException('只有草稿或驳回状态的计划可以修改');
    }

    // 如果已有课程，先删除
    if (data.courses) {
      await this.prisma.planCourse.deleteMany({
        where: { planId: id },
      });

      await this.prisma.planCourse.createMany({
        data: data.courses.map((c) => ({
          planId: id,
          courseId: c.courseId,
          semester: c.semester,
          hoursPerWeek: c.hoursPerWeek,
          practiceHoursPercent: c.practiceHoursPercent,
        })),
      });
    }

    return this.findOne(id);
  }

  // 提交计划
  async submit(id: string) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
      include: { planCourses: true },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    if (plan.status !== 'DRAFT' && plan.status !== 'REJECTED') {
      throw new BadRequestException('只有草稿或驳回状态的计划可以提交');
    }

    if (plan.planCourses.length === 0) {
      throw new BadRequestException('培养计划必须包含课程');
    }

    return this.prisma.talentDevelopmentPlan.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        major: true,
        planCourses: true,
      },
    });
  }

  // 审批通过
  async approve(id: string, approverId: string, data: ApprovePlanDto) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    if (plan.status !== 'SUBMITTED') {
      throw new BadRequestException('只有待审批状态的计划可以审批');
    }

    return this.prisma.talentDevelopmentPlan.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        rejectionReason: data.comment,
      },
      include: {
        major: true,
        planCourses: true,
      },
    });
  }

  // 驳回
  async reject(id: string, data: RejectPlanDto) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    if (plan.status !== 'SUBMITTED') {
      throw new BadRequestException('只有待审批状态的计划可以驳回');
    }

    if (!data.reason) {
      throw new BadRequestException('驳回必须填写原因');
    }

    return this.prisma.talentDevelopmentPlan.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: data.reason,
      },
      include: {
        major: true,
        planCourses: true,
      },
    });
  }

  // 删除计划（仅草稿）
  async delete(id: string) {
    const plan = await this.prisma.talentDevelopmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('培养计划不存在');
    }

    if (plan.status !== 'DRAFT') {
      throw new BadRequestException('只有草稿状态的计划可以删除');
    }

    await this.prisma.talentDevelopmentPlan.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }
}
