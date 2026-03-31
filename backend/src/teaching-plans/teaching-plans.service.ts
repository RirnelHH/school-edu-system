import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TeachingPlanStatus,
  LessonPlanStatus,
  CreateTeachingPlanDto,
  SubmitTeachingPlanDto,
  TeacherApprovalDto,
  LeaderApprovalDto,
  CreateLessonPlanDto,
  ImportExcelDto,
} from './dto/teaching-plan.dto';

// xlsx for reading .xls and .xlsx files
const XLSX = require('xlsx');

@Injectable()
export class TeachingPlansService {
  constructor(private prisma: PrismaService) {}

  // ========== 授课计划 ==========

  /**
   * 创建授课计划（管理员操作）
   */
  async createTeachingPlan(dto: CreateTeachingPlanDto, teacherIds: string[], groupLeaderId: string) {
    // 检查是否已存在
    const existing = await this.prisma.teachingPlan.findUnique({
      where: { courseId_semesterId: { courseId: dto.courseId, semesterId: dto.semesterId } },
    });
    if (existing) {
      throw new BadRequestException('该课程在此学期已有授课计划');
    }

    // 获取学期的有效教学周数
    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId: dto.semesterId },
    });
    const effectiveWeeks = weekConfig ? weekConfig.weekCount - (weekConfig.laborWeekCount || 0) : 18;

    // 创建授课计划
    const teachingPlan = await this.prisma.teachingPlan.create({
      data: {
        courseId: dto.courseId,
        semesterId: dto.semesterId,
        academicYear: dto.academicYear || '2025-2026',
        status: 'DRAFT',
        calculatedHours: effectiveWeeks * 4,
        teacherId: teacherIds[0],
      },
    });

    // 添加参与教师
    for (const tid of teacherIds) {
      await this.prisma.teachingPlanTeacher.create({
        data: {
          teachingPlanId: teachingPlan.id,
          teacherId: tid,
          isGroupLeader: tid === groupLeaderId,
          status: 'PENDING',
        },
      });
    }

    return this.getTeachingPlanById(teachingPlan.id);
  }

  /**
   * 获取授课计划列表
   */
  async getTeachingPlans(filters: {
    courseId?: string;
    semesterId?: string;
    status?: string;
    teacherId?: string;
  }) {
    const where: any = {};
    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.semesterId) where.semesterId = filters.semesterId;
    if (filters.status) where.status = filters.status;
    if (filters.teacherId) {
      where.planTeachers = { some: { teacherId: filters.teacherId } };
    }

    return this.prisma.teachingPlan.findMany({
      where,
      include: {
        planTeachers: { include: { teacher: { include: { user: true } } } },
        lessonPlans: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个授课计划
   */
  async getTeachingPlanById(id: string) {
    const plan = await this.prisma.teachingPlan.findUnique({
      where: { id },
      include: {
        planTeachers: {
          include: { teacher: { include: { user: true } } },
        },
        lessonPlans: {
          orderBy: { weekNumber: 'asc' },
        },
      },
    });
    if (!plan) throw new NotFoundException('授课计划不存在');
    return plan;
  }

  /**
   * 提交授课计划（上传Excel）
   */
  async submitTeachingPlan(id: string, dto: SubmitTeachingPlanDto) {
    const plan = await this.getTeachingPlanById(id);

    if (plan.status !== 'DRAFT') {
      throw new BadRequestException('只能提交草稿状态的授课计划');
    }

    return this.prisma.teachingPlan.update({
      where: { id },
      data: {
        status: 'PENDING_TEACHER',
        excelUrl: dto.excelUrl,
        submittedAt: new Date(),
      },
      include: {
        planTeachers: { include: { teacher: { include: { user: true } } } },
        lessonPlans: true,
      },
    });
  }

  /**
   * 多教师审核授课计划
   */
  async teacherApproveTeachingPlan(id: string, teacherId: string, dto: TeacherApprovalDto) {
    const plan = await this.getTeachingPlanById(id);

    if (plan.status !== 'PENDING_TEACHER') {
      throw new BadRequestException('当前不在教师审核阶段');
    }

    const planTeacher = plan.planTeachers.find(pt => pt.teacherId === teacherId);
    if (!planTeacher) {
      throw new ForbiddenException('您不是该授课计划的参与教师');
    }

    // 更新教师审核状态
    await this.prisma.teachingPlanTeacher.update({
      where: { id: planTeacher.id },
      data: {
        status: dto.decision === 'approve' ? 'APPROVED' : 'REJECTED',
        decision: dto.decision.toUpperCase(),
        comment: dto.comment,
        approvedAt: new Date(),
      },
    });

    // 重新获取更新后的计划
    const updatedPlan = await this.getTeachingPlanById(id);

    // 检查是否所有教师都审核完毕
    const allApproved = updatedPlan.planTeachers.every(pt => pt.status === 'APPROVED');
    const anyRejected = updatedPlan.planTeachers.some(pt => pt.status === 'REJECTED');

    let newStatus: string = plan.status;
    if (anyRejected) {
      newStatus = 'REJECTED';
    } else if (allApproved) {
      newStatus = 'PENDING_GROUP_LEADER';
    }

    await this.prisma.teachingPlan.update({
      where: { id },
      data: { status: newStatus as any },
    });

    return this.getTeachingPlanById(id);
  }

  /**
   * 教研组长审核授课计划
   */
  async groupLeaderApproveTeachingPlan(id: string, leaderId: string, dto: LeaderApprovalDto) {
    const plan = await this.getTeachingPlanById(id);

    if (plan.status !== 'PENDING_GROUP_LEADER') {
      throw new BadRequestException('当前不在教研组长审核阶段');
    }

    const leader = plan.planTeachers.find(pt => pt.isGroupLeader && pt.teacherId === leaderId);
    if (!leader) {
      throw new ForbiddenException('您不是该课程的教研组长');
    }

    const newStatus = dto.decision === 'approve' ? 'APPROVED' : 'REJECTED';

    return this.prisma.teachingPlan.update({
      where: { id },
      data: {
        status: newStatus,
        groupLeaderId: leaderId,
        groupLeaderAt: new Date(),
        groupLeaderDecision: dto.decision.toUpperCase(),
        groupLeaderComment: dto.comment,
      },
      include: {
        planTeachers: { include: { teacher: { include: { user: true } } } },
        lessonPlans: true,
      },
    });
  }

  // ========== 教案 ==========

  /**
   * 创建教案
   */
  async createLessonPlan(dto: CreateLessonPlanDto) {
    const plan = await this.getTeachingPlanById(dto.teachingPlanId);

    if (plan.status !== 'APPROVED') {
      throw new BadRequestException('授课计划审核通过后才能创建教案');
    }

    // 检查是否已存在该周教案
    const existing = await this.prisma.lessonPlan.findUnique({
      where: {
        teachingPlanId_weekNumber: {
          teachingPlanId: dto.teachingPlanId,
          weekNumber: dto.weekNumber,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`第${dto.weekNumber}周教案已存在`);
    }

    return this.prisma.lessonPlan.create({
      data: {
        teachingPlanId: dto.teachingPlanId,
        weekNumber: dto.weekNumber,
        lessonTitle: dto.lessonTitle,
        content: dto.content,
        attachmentUrl: dto.attachmentUrl,
        status: 'DRAFT',
      },
    });
  }

  /**
   * 获取某授课计划的所有教案
   */
  async getLessonPlans(teachingPlanId: string) {
    return this.prisma.lessonPlan.findMany({
      where: { teachingPlanId },
      orderBy: { weekNumber: 'asc' },
      include: {
        teacherApprovals: { include: { teacher: { include: { user: true } } } },
      },
    });
  }

  /**
   * 提交教案（进入教师审核阶段）
   */
  async submitLessonPlan(id: string) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id },
      include: { teachingPlan: true },
    });

    if (!lessonPlan) throw new NotFoundException('教案不存在');

    if (lessonPlan.status !== 'DRAFT') {
      throw new BadRequestException('只能提交草稿状态的教案');
    }

    return this.prisma.lessonPlan.update({
      where: { id },
      data: { status: 'PENDING_TEACHER' },
    });
  }

  /**
   * 多教师审核教案
   */
  async teacherApproveLessonPlan(id: string, teacherId: string, dto: TeacherApprovalDto) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id },
      include: { teacherApprovals: true },
    });

    if (!lessonPlan) throw new NotFoundException('教案不存在');

    if (lessonPlan.status !== 'PENDING_TEACHER') {
      throw new BadRequestException('当前不在教师审核阶段');
    }

    // 检查是否已审核过
    const existing = lessonPlan.teacherApprovals.find(a => a.teacherId === teacherId);
    if (existing) {
      throw new BadRequestException('您已审核过该教案');
    }

    // 创建审核记录
    await this.prisma.lessonPlanTeacherApproval.create({
      data: {
        lessonPlanId: id,
        teacherId,
        status: dto.decision === 'approve' ? 'APPROVED' : 'REJECTED',
        decision: dto.decision.toUpperCase(),
        comment: dto.comment,
        approvedAt: new Date(),
      },
    });

    // 获取所有参与教师
    const planTeachers = await this.prisma.teachingPlanTeacher.findMany({
      where: { teachingPlanId: lessonPlan.teachingPlanId },
    });

    // 检查所有教师是否都审核完毕
    const allApprovals = await this.prisma.lessonPlanTeacherApproval.findMany({
      where: { lessonPlanId: id },
    });

    const allApproved = planTeachers.every(pt =>
      allApprovals.some(a => a.teacherId === pt.teacherId && a.decision === 'APPROVE')
    );
    const anyRejected = planTeachers.some(pt =>
      allApprovals.some(a => a.teacherId === pt.teacherId && a.decision === 'REJECT')
    );

    let newStatus: string = lessonPlan.status;
    if (anyRejected) {
      newStatus = 'REJECTED';
    } else if (allApproved) {
      newStatus = 'PENDING_GROUP_LEADER';
    }

    return this.prisma.lessonPlan.update({
      where: { id },
      data: { status: newStatus as any },
      include: { teacherApprovals: { include: { teacher: { include: { user: true } } } } },
    });
  }

  /**
   * 教研组长审核教案
   */
  async groupLeaderApproveLessonPlan(id: string, leaderId: string, dto: LeaderApprovalDto) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id },
      include: { teachingPlan: { include: { planTeachers: true } } },
    });

    if (!lessonPlan) throw new NotFoundException('教案不存在');

    if (lessonPlan.status !== 'PENDING_GROUP_LEADER') {
      throw new BadRequestException('当前不在教研组长审核阶段');
    }

    const leader = lessonPlan.teachingPlan.planTeachers.find(
      pt => pt.isGroupLeader && pt.teacherId === leaderId
    );
    if (!leader) {
      throw new ForbiddenException('您不是该课程的教研组长');
    }

    const newStatus = dto.decision === 'approve' ? 'PENDING_DIRECTOR' : 'REJECTED';

    return this.prisma.lessonPlan.update({
      where: { id },
      data: {
        status: newStatus,
        groupLeaderId: leaderId,
        groupLeaderAt: new Date(),
        groupLeaderDecision: dto.decision.toUpperCase(),
        groupLeaderComment: dto.comment,
      },
      include: { teacherApprovals: { include: { teacher: { include: { user: true } } } } },
    });
  }

  /**
   * 主任审批教案
   */
  async directorApproveLessonPlan(id: string, directorId: string, dto: LeaderApprovalDto) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id },
    });

    if (!lessonPlan) throw new NotFoundException('教案不存在');

    if (lessonPlan.status !== 'PENDING_DIRECTOR') {
      throw new BadRequestException('当前不在主任审批阶段');
    }

    const newStatus = dto.decision === 'approve' ? 'APPROVED' : 'REJECTED';

    return this.prisma.lessonPlan.update({
      where: { id },
      data: {
        status: newStatus,
        directorId,
        directorAt: new Date(),
        directorDecision: dto.decision.toUpperCase(),
        directorComment: dto.comment,
      },
    });
  }

  /**
   * 上传/更新教案Word文档
   */
  async uploadLessonPlan(id: string, attachmentUrl: string) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({ where: { id } });
    if (!lessonPlan) throw new NotFoundException('教案不存在');
    return this.prisma.lessonPlan.update({
      where: { id },
      data: { attachmentUrl },
    });
  }

  /**
   * 获取单个教案
   */
  async getLessonPlanById(id: string) {
    const plan = await this.prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        teachingPlan: { include: { planTeachers: { include: { teacher: { include: { user: true } } } } } },
        teacherApprovals: { include: { teacher: { include: { user: true } } } },
      },
    });
    if (!plan) throw new NotFoundException('教案不存在');
    return plan;
  }

  /**
   * 从Excel数据导入授课计划
   */
  async importFromExcel(teachingPlanId: string, data: ImportExcelDto['data']) {
    const plan = await this.getTeachingPlanById(teachingPlanId);

    // 更新授课计划说明（Sheet1）
    await this.prisma.teachingPlan.update({
      where: { id: teachingPlanId },
      data: {
        totalHours: data.totalHours,
        completedHours: data.completedHours,
        remainingHours: data.remainingHours,
        teachingWeekCount: data.teachingWeekCount,
        weeklyHours: data.weeklyHours,
        theoryHours: data.theoryHours,
        labHours: data.labHours,
        practiceHours: data.practiceHours,
        examHours: data.examHours,
      },
    });

    // 删除旧条目并创建新条目
    if (data.entries && data.entries.length > 0) {
      await this.prisma.teachingPlanEntry.deleteMany({
        where: { teachingPlanId },
      });

      for (const entry of data.entries) {
        await this.prisma.teachingPlanEntry.create({
          data: {
            teachingPlanId,
            weekNumber: entry.weekNumber,
            sequence: entry.sequence,
            chapterTitle: entry.chapterTitle,
            content: entry.content,
            theoryHours: entry.theoryHours,
            labHours: entry.labHours,
            practiceHours: entry.practiceHours,
            testHours: entry.testHours,
            examHours: entry.examHours,
            visitHours: entry.visitHours,
            flexibleHours: entry.flexibleHours,
            subtotal: entry.subtotal,
            homework: entry.homework,
          },
        });
      }
    }

    return this.getTeachingPlanById(teachingPlanId);
  }

  /**
   * 解析XLS/XLSX文件并导入
   */
  async parseAndImportXls(filePath: string, teachingPlanId: string) {
    const workbook = XLSX.readFile(filePath);

    // Sheet1 - 授课计划说明（索引1）
    const sheet1Name = workbook.SheetNames[1];
    const sheet1 = workbook.Sheets[sheet1Name];
    const totalHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[0] || 0;
    const completedHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[1] || 0;
    const remainingHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[2] || 0;
    const teachingWeekCount = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[3] || 0;
    const weeklyHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[4] || 0;
    const theoryHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[5] || 0;
    const labHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[7] || 0;
    const practiceHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[8] || 0;
    const examHours = XLSX.utils.sheet_to_json(sheet1, { header: 1 })[6]?.[9] || 0;

    // Sheet2-4 - 授课内容（索引2-4）
    const entries: ImportExcelDto['data']['entries'] = [];
    for (let sheetIdx = 2; sheetIdx < workbook.SheetNames.length; sheetIdx++) {
      const sName = workbook.SheetNames[sheetIdx];
      const sheet = workbook.Sheets[sName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      for (let r = 5; r < rows.length; r++) {
        const row = rows[r];
        const seq = row[0];
        if (typeof seq === 'number' && seq > 0) {
          const weekNum = row[1];
          const chapter = String(row[2] || '');
          const content = String(row[3] || '');
          const theory = row[4] || 0;
          const lab = row[5] || 0;
          const practice = row[6] || 0;
          const test = row[7] || 0;
          const exam = row[8] || 0;
          const visit = row[9] || 0;
          const flexible = row[10] || 0;
          const subtotal = row[11] || 0;
          const homework = String(row[12] || '');

          entries.push({
            weekNumber: typeof weekNum === 'number' ? weekNum : 0,
            sequence: seq,
            chapterTitle: chapter.replace(/\n/g, ' ').trim(),
            content: content.replace(/\n/g, ' ').trim(),
            theoryHours: theory,
            labHours: lab,
            practiceHours: practice,
            testHours: test,
            examHours: exam,
            visitHours: visit,
            flexibleHours: flexible,
            subtotal: subtotal,
            homework,
          });
        }
      }
    }

    return this.importFromExcel(teachingPlanId, {
      totalHours: Math.floor(totalHours),
      completedHours: Math.floor(completedHours),
      remainingHours: Math.floor(remainingHours),
      teachingWeekCount: Math.floor(teachingWeekCount),
      weeklyHours: Math.floor(weeklyHours),
      theoryHours: Math.floor(theoryHours),
      labHours: Math.floor(labHours),
      practiceHours: Math.floor(practiceHours),
      examHours: Math.floor(examHours),
      entries,
    });
  }

  /**
   * 获取授课计划（含内容条目）
   */
  async getTeachingPlanWithEntries(id: string) {
    const plan = await this.prisma.teachingPlan.findUnique({
      where: { id },
      include: {
        planTeachers: { include: { teacher: { include: { user: true } } } },
        lessonPlans: true,
        entries: { orderBy: [{ weekNumber: 'asc' }, { sequence: 'asc' }] },
      },
    });
    if (!plan) throw new NotFoundException('授课计划不存在');
    return plan;
  }

  /**
   * 计算课程总课时
   */
  async calculateTotalHours(courseId: string, semesterId: string): Promise<number> {
    const entries = await this.prisma.scheduleEntry.findMany({
      where: {
        courseId,
        scheduleVersion: {
          semesterId,
          status: 'PUBLISHED',
        },
      },
    });

    if (entries.length === 0) return 0;

    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId },
    });
    const effectiveWeeks = weekConfig
      ? weekConfig.weekCount - (weekConfig.laborWeekCount || 0)
      : 18;

    const periodsPerWeek = entries.reduce((sum, e) => sum + (e.periodEnd - e.periodStart + 1), 0);

    return periodsPerWeek * effectiveWeeks;
  }
}
