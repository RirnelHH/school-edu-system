import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, LeaveStatus, ApprovalDecision } from './dto/leave.dto';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 通过用户ID获取学生
   */
  async getStudentByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  /**
   * 通过用户ID获取教师
   */
  async getTeacherByUserId(userId: string) {
    return this.prisma.teacher.findUnique({
      where: { userId },
    });
  }

  /**
   * 检查用户是否有管理员角色
   */
  async hasAdminRole(userId: string): Promise<boolean> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return roles.some(r => r.role.name === 'ADMIN' || r.role.name === 'admin');
  }

  /**
   * 学生提交请假申请
   */
  async createLeave(studentId: string, dto: CreateLeaveDto) {
    // 验证学生存在
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // 验证日期范围
    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // 创建请假记录
    return this.prisma.leaveRequest.create({
      data: {
        studentId,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: LeaveStatus.PENDING,
      },
      include: {
        student: { include: { user: true, class: true } },
        steps: true,
      },
    });
  }

  /**
   * 获取请假列表（根据角色过滤）
   */
  async getLeaves(filters: {
    studentId?: string;
    classId?: string;
    status?: string;
    isClassTeacher?: boolean;
    isAdmin?: boolean;
    userId?: string;
  }) {
    const where: any = {};

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // 班主任：只能看本班的请假
    if (filters.isClassTeacher && filters.userId) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: filters.userId },
      });
      if (teacher) {
        const classes = await this.prisma.class.findMany({
          where: { classTeacherId: teacher.id },
        });
        where.student = { classId: { in: classes.map(c => c.id) } };
      }
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        student: { include: { user: true, class: true } },
        steps: { include: { approver: { include: { user: true } } } },
        classTeacher: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个请假详情
   */
  async getLeaveById(leaveId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        student: { include: { user: true, class: true } },
        steps: { include: { approver: { include: { user: true } } } },
        classTeacher: { include: { user: true } },
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    return leave;
  }

  /**
   * 班主任审批请假
   */
  async approveLeave(leaveId: string, approverId: string, decision: ApprovalDecision, comment?: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        student: { include: { class: true } },
        steps: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Leave already processed');
    }

    // 获取审批人信息
    const approver = await this.prisma.teacher.findFirst({
      where: { userId: approverId },
      include: { user: true },
    });

    if (!approver) {
      throw new ForbiddenException('Only teachers can approve');
    }

    // 验证是否是该学生的班主任
    const isClassTeacher = leave.student.class.classTeacherId === approver.id;
    if (!isClassTeacher) {
      throw new ForbiddenException('Only the class teacher can approve this leave');
    }

    let newStatus: string = leave.status;

    if (decision === ApprovalDecision.REJECT) {
      newStatus = 'REJECTED';
      await this.prisma.leaveStep.create({
        data: {
          leaveRequestId: leaveId,
          step: 1,
          approverType: 'CLASS_TEACHER',
          approverId: approver.id,
          action: 'REJECT',
          comment,
          actedAt: new Date(),
        },
      });
    } else if (decision === ApprovalDecision.APPROVE) {
      // 班主任直接审批通过
      await this.prisma.leaveStep.create({
        data: {
          leaveRequestId: leaveId,
          step: 1,
          approverType: 'CLASS_TEACHER',
          approverId: approver.id,
          action: 'APPROVE',
          comment,
          actedAt: new Date(),
        },
      });
      newStatus = 'APPROVED';
    }

    // 更新请假状态和审批信息
    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: newStatus as any,
        classTeacherId: approver.id,
        reviewedAt: new Date(),
        reviewedComment: comment,
      },
      include: {
        student: { include: { user: true, class: true } },
        steps: { include: { approver: { include: { user: true } } } },
        classTeacher: { include: { user: true } },
      },
    });
  }

  /**
   * 取消请假（学生只能取消自己的未审批请假）
   */
  async cancelLeave(leaveId: string, studentId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    if (leave.studentId !== studentId) {
      throw new ForbiddenException('You can only cancel your own leave');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending leaves');
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
    });
  }
}
