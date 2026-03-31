import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScheduleVersionDto,
  AddScheduleEntryDto,
  UpdateScheduleEntryDto,
  AutoScheduleDto,
  ScheduleConflict,
} from './dto/scheduling.dto';
import { LessonType, RoomType } from '@prisma/client';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  // ============ 版本管理 ============

  // 创建排课版本
  async createVersion(data: CreateScheduleVersionDto) {
    // 获取该学期最新版本号
    const latest = await this.prisma.scheduleVersion.findFirst({
      where: { semesterId: data.semesterId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = data.versionNumber || (latest?.versionNumber || 0) + 1;

    // 检查是否已存在
    const existing = await this.prisma.scheduleVersion.findUnique({
      where: {
        semesterId_versionNumber: {
          semesterId: data.semesterId,
          versionNumber,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`版本 ${versionNumber} 已存在`);
    }

    return this.prisma.scheduleVersion.create({
      data: {
        semesterId: data.semesterId,
        versionNumber,
        status: 'DRAFT',
        createdBy: 'system',
      },
      include: { ScheduleEntry: true },
    });
  }

  // 获取排课版本列表
  async getVersions(semesterId: string) {
    return this.prisma.scheduleVersion.findMany({
      where: { semesterId },
      orderBy: { versionNumber: 'desc' },
      include: {
        _count: { select: { ScheduleEntry: true } },
      },
    });
  }

  // 获取某个版本的排课详情
  async getVersionDetail(versionId: string) {
    const version = await this.prisma.scheduleVersion.findUnique({
      where: { id: versionId },
      include: {
        ScheduleEntry: true,
      },
    });
    if (!version) {
      throw new NotFoundException('排课版本不存在');
    }

    // 获取所有条目及其关联
    const entries = await this.prisma.scheduleEntry.findMany({
      where: { scheduleVersionId: versionId },
    });

    return { version, entries };
  }

  // 发布排课版本
  async publishVersion(versionId: string) {
    const version = await this.prisma.scheduleVersion.findUnique({
      where: { id: versionId },
    });
    if (!version) {
      throw new NotFoundException('排课版本不存在');
    }

    return this.prisma.scheduleVersion.update({
      where: { id: versionId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  // ============ 排课条目管理 ============

  // 添加排课条目（手动）
  async addEntry(data: AddScheduleEntryDto) {
    // 冲突检测
    const conflicts = await this.checkConflicts(
      data.scheduleVersionId,
      data.roomId || null,
      data.teacherId,
      data.classId,
      data.weekday,
      data.periodStart,
      data.periodEnd,
    );
    if (conflicts.length > 0) {
      throw new ConflictException({
        message: '排课冲突',
        conflicts,
      });
    }

    return this.prisma.scheduleEntry.create({
      data: {
        scheduleVersionId: data.scheduleVersionId,
        classId: data.classId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        roomId: data.roomId,
        weekday: data.weekday,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        lessonType: data.lessonType,
      },
    });
  }

  // 更新排课条目
  async updateEntry(entryId: string, data: UpdateScheduleEntryDto) {
    const entry = await this.prisma.scheduleEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) {
      throw new NotFoundException('排课条目不存在');
    }

    // 如果改变了时间/教室/教师，检查冲突
    if (data.weekday || data.periodStart || data.periodEnd || data.roomId || data.teacherId) {
      const conflicts = await this.checkConflicts(
        entry.scheduleVersionId,
        data.roomId || entry.roomId,
        data.teacherId || entry.teacherId,
        entry.classId,
        data.weekday || entry.weekday,
        data.periodStart || entry.periodStart,
        data.periodEnd || entry.periodEnd,
        entryId, // 排除自身
      );
      if (conflicts.length > 0) {
        throw new ConflictException({
          message: '排课冲突',
          conflicts,
        });
      }
    }

    return this.prisma.scheduleEntry.update({
      where: { id: entryId },
      data,
    });
  }

  // 删除排课条目
  async deleteEntry(entryId: string) {
    const entry = await this.prisma.scheduleEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) {
      throw new NotFoundException('排课条目不存在');
    }

    return this.prisma.scheduleEntry.delete({
      where: { id: entryId },
    });
  }

  // ============ 冲突检测 ============

  async checkConflicts(
    scheduleVersionId: string,
    roomId: string | null,
    teacherId: string,
    classId: string,
    weekday: number,
    periodStart: number,
    periodEnd: number,
    excludeEntryId?: string,
  ): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // 时间重叠检测
    const whereClause: any = {
      scheduleVersionId,
      weekday,
      OR: [
        {
          AND: [
            { periodStart: { lte: periodStart } },
            { periodEnd: { gte: periodStart } },
          ],
        },
        {
          AND: [
            { periodStart: { lte: periodEnd } },
            { periodEnd: { gte: periodEnd } },
          ],
        },
        {
          AND: [
            { periodStart: { gte: periodStart } },
            { periodEnd: { lte: periodEnd } },
          ],
        },
      ],
    };

    if (excludeEntryId) {
      (whereClause as any).NOT = { id: excludeEntryId };
    }

    const existingEntries = await this.prisma.scheduleEntry.findMany({
      where: whereClause,
    });

    for (const entry of existingEntries) {
      // 教室冲突
      if (roomId && entry.roomId === roomId) {
        conflicts.push({
          type: 'ROOM_CONFLICT',
          roomId,
          courseName: '待查',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: '已排课程',
            roomId: entry.roomId,
          },
        });
      }

      // 教师冲突
      if (entry.teacherId === teacherId) {
        conflicts.push({
          type: 'TEACHER_CONFLICT',
          teacherId,
          courseName: '待查',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: '已排课程',
            teacherId: entry.teacherId,
          },
        });
      }

      // 班级冲突
      if (entry.classId === classId) {
        conflicts.push({
          type: 'CLASS_CONFLICT',
          classId,
          courseName: '待查',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: '已排课程',
            classId: entry.classId,
          },
        });
      }
    }

    return conflicts;
  }

  // ============ 自动排课 ============

  async autoSchedule(data: AutoScheduleDto) {
    // 1. 创建或获取排课版本
    let version = await this.prisma.scheduleVersion.findFirst({
      where: {
        semesterId: data.semesterId,
        status: 'DRAFT',
      },
    });

    if (!version) {
      version = await this.createVersion({
        semesterId: data.semesterId,
        versionNumber: data.versionNumber,
      });
    }

    // 2. 获取已审批的师资模板
    const templateWhere: any = {
      semesterId: data.semesterId,
      status: 'APPROVED',
    };
    if (data.excludeTeacherIds?.length) {
      templateWhere.teacherId = { notIn: data.excludeTeacherIds };
    }

    const templates = await this.prisma.teacherCourseTemplate.findMany({
      where: templateWhere,
    });

    if (templates.length === 0) {
      throw new BadRequestException('没有可排课的师资模板');
    }

    // 3. 获取可用教室
    const rooms = await this.prisma.room.findMany({
      where: { status: 'ACTIVE' },
    });

    // 4. 获取班级信息
    const classIds = [...new Set(
      templates.flatMap(t => (t.teachingClasses as any[])?.map(c => c.classId) || [])
    )];
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { major: true },
    });
    const classMap = new Map(classes.map(c => [c.id, c]));

    // 5. 获取教师信息
    const teacherIds = [...new Set(templates.map(t => t.teacherId))];
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: { user: true },
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    // 6. 获取课程信息
    const courseIds = [...new Set(templates.map(t => t.courseId))];
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });
    const courseMap = new Map(courses.map(c => [c.id, c]));

    // 7. 获取已排课程（用于冲突避免）
    const existingEntries = await this.prisma.scheduleEntry.findMany({
      where: { scheduleVersionId: version.id },
    });

    // 8. 按模板自动排课
    const results: any[] = [];
    const conflicts: any[] = [];

    for (const template of templates) {
      const teachingClasses = (template.teachingClasses as any[]) || [];
      const course = courseMap.get(template.courseId);
      const teacher = teacherMap.get(template.teacherId);

      // 计算需要排课的节次
      const totalPeriods = template.weekHours;
      let placedPeriods = 0;

      // 优先排课时间段
      const preferredSlots = (template.preferredSlots as any[]) || [];
      const forbiddenSlots = (template.forbiddenSlots as any[]) || [];

      // 遍历每周的每一天
      for (let day = 1; day <= 5 && placedPeriods < totalPeriods; day++) {
        // 检查是否在禁止时间段
        const isForbidden = forbiddenSlots.some(
          (s: any) => s.dayOfWeek === day,
        );
        if (isForbidden) continue;

        // 检查该天已有排课
        const dayEntries = existingEntries.filter(e => e.weekday === day);
        const usedPeriods = new Set(
          dayEntries.flatMap(e =>
            Array.from({ length: e.periodEnd - e.periodStart + 1 }, (_, i) => e.periodStart + i)
          )
        );

        // 找空闲节次
        for (let period = 1; period <= 8 && placedPeriods < totalPeriods; period++) {
          if (usedPeriods.has(period)) continue;

          // 检查教师偏好
          const prefersThisSlot = preferredSlots.some(
            (s: any) => s.dayOfWeek === day && s.periodStart <= period && s.periodEnd >= period
          );

          // 分配教室
          let assignedRoom: any = null;
          if (template.practiceHours > 0 && template.recommendedRoomType) {
            // 上机课，找对应类型机房
            const suitableRooms = rooms.filter(
              r => r.type === template.recommendedRoomType
            );
            // 找该时段空闲的
            for (const room of suitableRooms) {
              const roomBusy = dayEntries.some(
                e => e.roomId === room.id &&
                  period >= e.periodStart &&
                  period <= e.periodEnd
              );
              if (!roomBusy) {
                assignedRoom = room;
                break;
              }
            }
          }

          // 创建排课条目
          for (const tc of teachingClasses) {
            const entry = await this.prisma.scheduleEntry.create({
              data: {
                scheduleVersionId: version.id,
                classId: tc.classId,
                courseId: template.courseId,
                teacherId: template.teacherId,
                roomId: assignedRoom?.id,
                weekday: day,
                periodStart: period,
                periodEnd: period,
                lessonType: assignedRoom ? 'LAB' : 'THEORY',
              },
            });

            existingEntries.push(entry); // 更新已排记录
            results.push({
              ...entry,
              courseName: course?.name,
              className: tc.className,
              teacherName: teacher?.user?.name,
              roomName: assignedRoom?.name,
            });

            placedPeriods++;
            usedPeriods.add(period);
          }
        }
      }

      if (placedPeriods < template.weekHours) {
        conflicts.push({
          templateId: template.id,
          courseName: course?.name,
          teacherName: teacher?.user?.name,
          requestedHours: template.weekHours,
          placedHours: placedPeriods,
          message: `只能排 ${placedPeriods}/${template.weekHours} 节`,
        });
      }
    }

    return {
      versionId: version.id,
      versionNumber: version.versionNumber,
      totalEntries: results.length,
      entries: results,
      unplaced: conflicts,
    };
  }

  // ============ 查询 ============

  // 按班级查询课表
  async getClassSchedule(classId: string, versionId?: string) {
    const where: any = { classId };
    if (versionId) {
      where.scheduleVersionId = versionId;
    } else {
      // 取最新已发布版本
      const latest = await this.prisma.scheduleVersion.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { versionNumber: 'desc' },
      });
      if (latest) {
        where.scheduleVersionId = latest.id;
      }
    }

    const entries = await this.prisma.scheduleEntry.findMany({
      where,
      orderBy: [{ weekday: 'asc' }, { periodStart: 'asc' }],
    });

    // 补充关联信息
    const classIds = [...new Set(entries.map(e => e.classId))];
    const teacherIds = [...new Set(entries.map(e => e.teacherId))];
    const courseIds = [...new Set(entries.map(e => e.courseId))];
    const roomIds = [...new Set(entries.filter(e => e.roomId).map(e => e.roomId!))];

    const [classes, teachers, courses, rooms] = await Promise.all([
      this.prisma.class.findMany({ where: { id: { in: classIds } } }),
      this.prisma.teacher.findMany({ where: { id: { in: teacherIds } }, include: { user: true } }),
      this.prisma.course.findMany({ where: { id: { in: courseIds } } }),
      this.prisma.room.findMany({ where: { id: { in: roomIds } } }),
    ]);

    const classMap = new Map(classes.map(c => [c.id, c]));
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const courseMap = new Map(courses.map(c => [c.id, c]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));

    return entries.map(e => ({
      ...e,
      className: classMap.get(e.classId)?.name,
      courseName: courseMap.get(e.courseId)?.name,
      teacherName: teacherMap.get(e.teacherId)?.user?.name,
      roomName: e.roomId ? roomMap.get(e.roomId)?.name : null,
    }));
  }

  // 按教师查询课表
  async getTeacherSchedule(teacherId: string, versionId?: string) {
    const where: any = { teacherId };
    if (versionId) {
      where.scheduleVersionId = versionId;
    } else {
      const latest = await this.prisma.scheduleVersion.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { versionNumber: 'desc' },
      });
      if (latest) {
        where.scheduleVersionId = latest.id;
      }
    }

    const entries = await this.prisma.scheduleEntry.findMany({
      where,
      orderBy: [{ weekday: 'asc' }, { periodStart: 'asc' }],
    });

    // 补充关联信息
    const classIds = [...new Set(entries.map(e => e.classId))];
    const courseIds = [...new Set(entries.map(e => e.courseId))];
    const roomIds = [...new Set(entries.filter(e => e.roomId).map(e => e.roomId!))];

    const [classes, courses, rooms] = await Promise.all([
      this.prisma.class.findMany({ where: { id: { in: classIds } } }),
      this.prisma.course.findMany({ where: { id: { in: courseIds } } }),
      this.prisma.room.findMany({ where: { id: { in: roomIds } } }),
    ]);

    const classMap = new Map(classes.map(c => [c.id, c]));
    const courseMap = new Map(courses.map(c => [c.id, c]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));

    return entries.map(e => ({
      ...e,
      className: classMap.get(e.classId)?.name,
      courseName: courseMap.get(e.courseId)?.name,
      roomName: e.roomId ? roomMap.get(e.roomId)?.name : null,
    }));
  }

  // 按教室查询课表
  async getRoomSchedule(roomId: string, versionId?: string) {
    const where: any = { roomId };
    if (versionId) {
      where.scheduleVersionId = versionId;
    } else {
      const latest = await this.prisma.scheduleVersion.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { versionNumber: 'desc' },
      });
      if (latest) {
        where.scheduleVersionId = latest.id;
      }
    }

    return this.prisma.scheduleEntry.findMany({
      where,
      orderBy: [{ weekday: 'asc' }, { periodStart: 'asc' }],
    });
  }
}
