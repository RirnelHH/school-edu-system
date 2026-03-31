import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeacherTemplateDto,
  UpdateTeacherTemplateDto,
  QueryTeacherTemplateDto,
  TeacherWorkloadSummary,
  RoomCapacityCheck,
  ImportTemplateRowDto,
  TeachingClassDto,
} from './dto/teacher-template.dto';
import { RoomType, TemplateStatus } from '@prisma/client';

@Injectable()
export class TeacherTemplatesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 创建师资模板
  // ============================================
  async create(userId: string, data: CreateTeacherTemplateDto) {
    // 验证教师存在（包含用户信息）
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
      include: { user: true },
    });
    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    // 验证学期存在
    const semester = await this.prisma.semester.findUnique({
      where: { id: data.semesterId },
    });
    if (!semester) {
      throw new NotFoundException('学期不存在');
    }

    // 验证课程存在
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 获取学期周数配置
    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId: data.semesterId },
    });
    const weekCount = weekConfig?.weekCount || 18;

    // 计算总课时
    const totalHours = data.weekHours * weekCount;

    // 验证上机比例
    const practiceHoursPercent =
      (data.practiceHours + data.theoryHours) > 0
        ? data.practiceHours / (data.practiceHours + data.theoryHours)
        : 0;

    // 验证合班班级存在并计算总人数
    let totalStudents = 0;
    const teachingClassesDetail: TeachingClassDto[] = [];

    for (const tc of data.teachingClasses) {
      const classEntity = await this.prisma.class.findUnique({
        where: { id: tc.classId },
      });
      if (!classEntity) {
        throw new NotFoundException(`班级不存在: ${tc.className}`);
      }
      totalStudents += classEntity.studentCount;
      teachingClassesDetail.push({
        classId: tc.classId,
        className: classEntity.name,
        studentCount: classEntity.studentCount,
      });
    }

    // 校验机房承载力（如有上机课）- 仅警告，不阻塞
    const capacityWarnings: string[] = [];
    if (data.practiceHours > 0 && data.recommendedRoomType) {
      const capacityCheck = await this.checkRoomCapacity(
        data.semesterId,
        data.recommendedRoomType,
        data.practiceHours,
        totalStudents,
      );
      if (capacityCheck.hasWarnings) {
        capacityWarnings.push(...(capacityCheck.warnings || []));
      }
    }

    // 创建模板
    const template = await this.prisma.teacherCourseTemplate.create({
      data: {
        teacherId: data.teacherId,
        semesterId: data.semesterId,
        courseId: data.courseId,
        courseName: data.courseName,
        weekHours: data.weekHours,
        totalHours,
        theoryHours: data.theoryHours,
        practiceHours: data.practiceHours,
        practiceHoursPercent,
        teachingClasses: teachingClassesDetail as any,
        recommendedRoomType: data.recommendedRoomType,
        preferredSlots: data.preferredSlots as any,
        forbiddenSlots: data.forbiddenSlots as any,
        status: 'DRAFT',
        createdBy: userId,
      },
    });

    // 返回模板及警告信息
    return {
      ...template,
      warnings: capacityWarnings.length > 0 ? capacityWarnings : undefined,
    };

    return template;
  }

  // ============================================
  // 查询师资模板列表
  // ============================================
  async findAll(query: QueryTeacherTemplateDto) {
    const where: any = {};

    if (query.teacherId) {
      where.teacherId = query.teacherId;
    }
    if (query.semesterId) {
      where.semesterId = query.semesterId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const templates = await this.prisma.teacherCourseTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // 获取关联数据
    const teacherIds = [...new Set(templates.map((t) => t.teacherId))];
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: { user: true },
    });
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    return templates.map((t) => ({
      ...t,
      teacherName: teacherMap.get(t.teacherId)?.user?.name || '未知',
    }));
  }

  // ============================================
  // 查询单个模板详情
  // ============================================
  async findOne(id: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    // 获取关联信息
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: template.teacherId },
      include: { user: true },
    });
    const semester = await this.prisma.semester.findUnique({
      where: { id: template.semesterId },
    });

    return {
      ...template,
      teacherName: teacher?.user?.name || '未知',
      teacherCode: teacher?.employeeNumber || '',
      semesterName: semester
        ? `${semester.academicYearId}-第${semester.number}学期`
        : '未知',
    };
  }

  // ============================================
  // 更新模板
  // ============================================
  async update(id: string, userId: string, data: UpdateTeacherTemplateDto) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'DRAFT') {
      throw new BadRequestException('只有草稿状态的模板可以修改');
    }

    // 如果修改了课时，需要重新计算
    let totalHours = template.totalHours;
    if (data.weekHours) {
      const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
        where: { semesterId: template.semesterId },
      });
      const weekCount = weekConfig?.weekCount || 18;
      totalHours = data.weekHours * weekCount;
    }

    const theoryHours = data.theoryHours ?? template.theoryHours;
    const practiceHours = data.practiceHours ?? template.practiceHours;
    const practiceHoursPercent =
      (theoryHours + practiceHours) > 0
        ? practiceHours / (theoryHours + practiceHours)
        : 0;

    // 更新模板
    return this.prisma.teacherCourseTemplate.update({
      where: { id },
      data: {
        ...data,
        totalHours,
        practiceHoursPercent,
        teachingClasses: data.teachingClasses
          ? (data.teachingClasses as any)
          : undefined,
        preferredSlots: data.preferredSlots
          ? (data.preferredSlots as any)
          : undefined,
        forbiddenSlots: data.forbiddenSlots
          ? (data.forbiddenSlots as any)
          : undefined,
      },
    });
  }

  // ============================================
  // 提交模板审批
  // ============================================
  async submit(id: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'DRAFT') {
      throw new BadRequestException('只有草稿状态可以提交');
    }

    return this.prisma.teacherCourseTemplate.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
  }

  // ============================================
  // 撤回模板
  // ============================================
  async withdraw(id: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'SUBMITTED') {
      throw new BadRequestException('只有已提交状态可以撤回');
    }

    return this.prisma.teacherCourseTemplate.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  // ============================================
  // 审批通过
  // ============================================
  async approve(id: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'SUBMITTED') {
      throw new BadRequestException('只有已提交状态可以审批');
    }

    return this.prisma.teacherCourseTemplate.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  // ============================================
  // 驳回模板
  // ============================================
  async reject(id: string, reason: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'SUBMITTED') {
      throw new BadRequestException('只有已提交状态可以驳回');
    }

    return this.prisma.teacherCourseTemplate.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  // ============================================
  // 删除草稿模板
  // ============================================
  async delete(id: string) {
    const template = await this.prisma.teacherCourseTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (template.status !== 'DRAFT') {
      throw new BadRequestException('只有草稿状态可以删除');
    }

    await this.prisma.teacherCourseTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  // ============================================
  // 批量导入师资模板
  // ============================================
  async importFromExcel(
    userId: string,
    semesterId: string,
    rows: ImportTemplateRowDto[],
  ) {
    const results: { row: number; success: boolean; message: string }[] = [];

    // 获取学期周数
    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId },
    });
    const weekCount = weekConfig?.weekCount || 18;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // 查找教师（按姓名查找用户关联的教师）
        const teacher = await this.prisma.teacher.findFirst({
          where: { user: { name: row.teacherName } },
          include: { user: true },
        });
        if (!teacher) {
          results.push({
            row: i + 1,
            success: false,
            message: `教师不存在: ${row.teacherName}`,
          });
          continue;
        }

        // 查找课程
        const course = await this.prisma.course.findFirst({
          where: { name: row.courseName },
        });
        if (!course) {
          results.push({
            row: i + 1,
            success: false,
            message: `课程不存在: ${row.courseName}`,
          });
          continue;
        }

        // 解析班级（支持逗号分隔的合班）
        const classNames = row.classNames.split(/[,，]/).map((s) => s.trim());
        const teachingClasses: TeachingClassDto[] = [];

        for (const className of classNames) {
          const classEntity = await this.prisma.class.findFirst({
            where: { name: className },
          });
          if (!classEntity) {
            results.push({
              row: i + 1,
              success: false,
              message: `班级不存在: ${className}`,
            });
            continue;
          }
          teachingClasses.push({
            classId: classEntity.id,
            className: classEntity.name,
            studentCount: classEntity.studentCount,
          });
        }

        // 计算总课时
        const totalHours = row.weekHours * weekCount;
        const practiceHoursPercent =
          (row.practiceHours + row.theoryHours) > 0
            ? row.practiceHours / (row.practiceHours + row.theoryHours)
            : 0;

        // 创建模板
        await this.prisma.teacherCourseTemplate.create({
          data: {
            teacherId: teacher.id,
            semesterId,
            courseId: course.id,
            courseName: course.name,
            weekHours: row.weekHours,
            totalHours,
            theoryHours: row.theoryHours,
            practiceHours: row.practiceHours,
            practiceHoursPercent,
            teachingClasses: teachingClasses as any,
            recommendedRoomType: row.recommendedRoomType,
            status: 'DRAFT',
            createdBy: userId,
          },
        });

        results.push({
          row: i + 1,
          success: true,
          message: `成功导入: ${row.teacherName} - ${row.courseName}`,
        });
      } catch (error) {
        results.push({
          row: i + 1,
          success: false,
          message: `导入失败: ${error.message}`,
        });
      }
    }

    return results;
  }

  // ============================================
  // 获取教师课时统计
  // ============================================
  async getTeacherWorkload(
    teacherId: string,
    semesterId: string,
  ): Promise<TeacherWorkloadSummary> {
    const templates = await this.prisma.teacherCourseTemplate.findMany({
      where: {
        teacherId,
        semesterId,
        status: { in: ['SUBMITTED', 'APPROVED'] },
      },
    });

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    let totalWeekHours = 0;
    let totalHours = 0;

    const courseDetails = templates.map((t) => {
      totalWeekHours += t.weekHours;
      totalHours += t.totalHours;

      const classes = t.teachingClasses as TeachingClassDto[] | unknown;
      const classArray = Array.isArray(classes) ? classes : [];
      return {
        courseName: t.courseName,
        weekHours: t.weekHours,
        theoryHours: t.theoryHours,
        practiceHours: t.practiceHours,
        teachingClasses: classArray
          .map((c: any) => c.className)
          .filter(Boolean)
          .join('+'),
      };
    });

    return {
      teacherId,
      teacherName: teacher?.user?.name || '未知',
      semesterId,
      totalWeekHours,
      totalHours,
      courseCount: templates.length,
      templates: courseDetails,
    };
  }

  // ============================================
  // 校验机房承载力
  // ============================================
  async checkRoomCapacity(
    semesterId: string,
    roomType: RoomType,
    practiceHoursNeeded: number,
    studentCount: number,
  ): Promise<RoomCapacityCheck> {
    // 获取可用机房
    const rooms = await this.prisma.room.findMany({
      where: {
        type: roomType,
        status: 'ACTIVE',
      },
    });

    if (rooms.length === 0) {
      return {
        roomType,
        totalPracticeHoursNeeded: practiceHoursNeeded,
        roomCount: 0,
        totalCapacity: 0,
        hasWarnings: true,
        warnings: [`没有可用机房类型: ${roomType}`],
      };
    }

    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const warnings: string[] = [];

    // 检查容量是否足够（仅警告）
    if (totalCapacity < studentCount) {
      warnings.push(
        `⚠️ 告警: 学生人数(${studentCount})超过机房总容量(${totalCapacity})`,
      );
    }

    // 获取学期信息（计算周数）
    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId },
    });
    const weekCount = weekConfig?.weekCount || 18;

    // 计算每周需要的上机课时
    const weeklyPracticeHours = practiceHoursNeeded / weekCount;

    // 假设每个机房每天可用8节课（上午4节+下午4节），每周5天 = 40节/周
    const periodsPerRoomPerWeek = 40;
    const totalPeriodsAvailable = rooms.length * periodsPerRoomPerWeek;

    if (weeklyPracticeHours > totalPeriodsAvailable) {
      warnings.push(
        `⚠️ 告警: 上机课时需求较高: 每周需要${weeklyPracticeHours.toFixed(1)}节上机课，机房可提供${totalPeriodsAvailable}节/周`,
      );
    }

    return {
      roomType,
      totalPracticeHoursNeeded: practiceHoursNeeded,
      roomCount: rooms.length,
      totalCapacity,
      hasWarnings: warnings.length > 0,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // ============================================
  // 获取所有教师的课时汇总（用于批量校验）
  // ============================================
  async getAllTeachersWorkload(semesterId: string) {
    const templates = await this.prisma.teacherCourseTemplate.findMany({
      where: {
        semesterId,
        status: { in: ['SUBMITTED', 'APPROVED'] },
      },
    });

    // 按教师分组
    const byTeacher = new Map<
      string,
      {
        teacherId: string;
        weekHours: number;
        totalHours: number;
        practiceHours: number;
        templates: any[];
      }
    >();

    for (const t of templates) {
      if (!byTeacher.has(t.teacherId)) {
        byTeacher.set(t.teacherId, {
          teacherId: t.teacherId,
          weekHours: 0,
          totalHours: 0,
          practiceHours: 0,
          templates: [],
        });
      }
      const entry = byTeacher.get(t.teacherId)!;
      entry.weekHours += t.weekHours;
      entry.totalHours += t.totalHours;
      entry.practiceHours += t.practiceHours;

      const classes = t.teachingClasses as TeachingClassDto[] | unknown;
      const classArray = Array.isArray(classes) ? classes : [];

      entry.templates.push({
        courseName: t.courseName,
        weekHours: t.weekHours,
        teachingClasses: classArray
          .map((c: any) => c.className)
          .filter(Boolean)
          .join('+'),
      });
    }

    // 获取教师姓名
    const teacherIds = [...byTeacher.keys()];
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: { user: true },
    });
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    return [...byTeacher.values()].map((item) => ({
      ...item,
      teacherName: teacherMap.get(item.teacherId)?.user?.name || '未知',
    }));
  }
}
