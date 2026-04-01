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

    // 补充关联信息
    const courseIds = [...new Set(existingEntries.map(e => e.courseId))];
    const teacherIds = [...new Set(existingEntries.map(e => e.teacherId))];
    const classIds = [...new Set(existingEntries.map(e => e.classId))];
    const roomIds = [...new Set(existingEntries.filter(e => e.roomId).map(e => e.roomId!))];

    const [courses, teachers, classes, rooms] = await Promise.all([
      courseIds.length ? this.prisma.course.findMany({ where: { id: { in: courseIds } } }) : [],
      teacherIds.length ? this.prisma.teacher.findMany({ where: { id: { in: teacherIds } }, include: { user: true } }) : [],
      classIds.length ? this.prisma.class.findMany({ where: { id: { in: classIds } } }) : [],
      roomIds.length ? this.prisma.room.findMany({ where: { id: { in: roomIds } } }) : [],
    ]);

    const courseMap = new Map(courses.map(c => [c.id, c]));
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const classMap = new Map(classes.map(c => [c.id, c]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));

    for (const entry of existingEntries) {
      const entryCourse = courseMap.get(entry.courseId);
      const entryTeacher = teacherMap.get(entry.teacherId);
      const entryClass = classMap.get(entry.classId);
      const entryRoom = entry.roomId ? roomMap.get(entry.roomId) : null;

      // 教室冲突
      if (roomId && entry.roomId === roomId) {
        conflicts.push({
          type: 'ROOM_CONFLICT',
          roomId,
          courseName: entryCourse?.name || '未知课程',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: entryCourse?.name || '未知课程',
            roomId: entry.roomId,
            roomName: entryRoom?.name,
          },
        });
      }

      // 教师冲突：同一时段同一教师只能在一个班级教一门课
      if (entry.teacherId === teacherId) {
        conflicts.push({
          type: 'TEACHER_CONFLICT',
          teacherId,
          courseName: entryCourse?.name || '未知课程',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: entryCourse?.name || '未知课程',
            teacherId: entry.teacherId,
            teacherName: entryTeacher?.user?.name,
            className: entryClass?.name,
          },
        });
      }

      // 班级冲突：同一时段同一班级只能上一门课
      if (entry.classId === classId) {
        conflicts.push({
          type: 'CLASS_CONFLICT',
          classId,
          courseName: entryCourse?.name || '未知课程',
          weekday,
          periodStart,
          periodEnd,
          conflictWith: {
            courseName: entryCourse?.name || '未知课程',
            classId: entry.classId,
            className: entryClass?.name,
          },
        });
      }
    }

    return conflicts;
  }

  // ============ 自动排课 ============

  /**
   * 自动排课
   * 规则：
   * 1. 课时必须两节一起排：1-2, 3-4, 5-6, 7-8
   * 2. 同一时段一个教师只能在一个班级教一门课
   * 3. 同一时段一个班级只能上一门课
   * 4. 上机课必须分配机房
   */
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

    // 7.1 补充已排课程的关联信息
    const existingCourseIds = [...new Set(existingEntries.map(e => e.courseId))];
    const existingTeacherIds = [...new Set(existingEntries.map(e => e.teacherId))];
    const existingClassIds = [...new Set(existingEntries.map(e => e.classId))];
    const existingRoomIds = [...new Set(existingEntries.filter(e => e.roomId).map(e => e.roomId!))];

    const [existingCourses, existingTeachers, existingClasses, existingRooms] = await Promise.all([
      existingCourseIds.length ? this.prisma.course.findMany({ where: { id: { in: existingCourseIds } } }) : [],
      existingTeacherIds.length ? this.prisma.teacher.findMany({ where: { id: { in: existingTeacherIds } }, include: { user: true } }) : [],
      existingClassIds.length ? this.prisma.class.findMany({ where: { id: { in: existingClassIds } } }) : [],
      existingRoomIds.length ? this.prisma.room.findMany({ where: { id: { in: existingRoomIds } } }) : [],
    ]);

    const existingCourseMap = new Map(existingCourses.map(c => [c.id, c]));
    const existingTeacherMap = new Map(existingTeachers.map(t => [t.id, t]));
    const existingClassMap = new Map(existingClasses.map(c => [c.id, c]));
    const existingRoomMap = new Map(existingRooms.map(r => [r.id, r]));

    // 为已排课程补充名称
    const existingEntriesWithNames = existingEntries.map(e => ({
      ...e,
      courseName: existingCourseMap.get(e.courseId)?.name,
      teacherName: existingTeacherMap.get(e.teacherId)?.user?.name,
      className: existingClassMap.get(e.classId)?.name,
      roomName: e.roomId ? existingRoomMap.get(e.roomId)?.name : null,
    }));

    // 8. 按模板自动排课
    const results: any[] = [];
    const conflicts: any[] = [];

    // 有效节次对：(1,2), (3,4), (5,6), (7,8)
    const PERIOD_PAIRS = [
      { start: 1, end: 2 },
      { start: 3, end: 4 },
      { start: 5, end: 6 },
      { start: 7, end: 8 },
    ];

    for (const template of templates) {
      const teachingClasses = (template.teachingClasses as any[]) || [];
      const course = courseMap.get(template.courseId);
      const teacher = teacherMap.get(template.teacherId);

      // 计算需要排课的节次对数（每周课时 / 2，因为两节一起排）
      const totalPeriodPairs = Math.floor(template.weekHours / 2);
      let placedPairs = 0;

      // 优先排课时间段
      const preferredSlots = (template.preferredSlots as any[]) || [];
      const forbiddenSlots = (template.forbiddenSlots as any[]) || [];

      // 遍历每周的每一天 (1-5，周一到周五)
      for (let day = 1; day <= 5 && placedPairs < totalPeriodPairs; day++) {
        // 检查是否在禁止时间段
        const isForbidden = forbiddenSlots.some(
          (s: any) => s.dayOfWeek === day,
        );
        if (isForbidden) continue;

        // 检查该天已有排课的节次对
        const dayEntries = existingEntriesWithNames.filter(e => e.weekday === day);
        const usedPeriodPairs = new Set(
          dayEntries.map(e => `${e.periodStart}-${e.periodEnd}`)
        );

        // 遍历每个节次对
        for (const pair of PERIOD_PAIRS) {
          if (placedPairs >= totalPeriodPairs) break;

          // 检查该节次对是否已被使用
          const pairKey = `${pair.start}-${pair.end}`;
          if (usedPeriodPairs.has(pairKey)) continue;

          // 检查该节次对的教室是否冲突
          let assignedRoom: any = null;
          const isLabCourse = template.practiceHours > 0 && template.recommendedRoomType;

          if (isLabCourse) {
            // 上机课，找对应类型机房
            const suitableRooms = rooms.filter(
              r => r.type === template.recommendedRoomType
            );
            for (const room of suitableRooms) {
              const roomBusy = dayEntries.some(
                e => e.roomId === room.id &&
                  e.periodStart === pair.start &&
                  e.periodEnd === pair.end
              );
              if (!roomBusy) {
                assignedRoom = room;
                break;
              }
            }
            // 上机课必须有机房，否则跳过
            if (!assignedRoom) continue;
          }

          // 检查该班级在该节次对是否有其他课程（班级冲突）
          for (const tc of teachingClasses) {
            const classBusy = dayEntries.some(
              e => e.classId === tc.classId &&
                e.periodStart === pair.start &&
                e.periodEnd === pair.end
            );
            if (classBusy) {
              conflicts.push({
                templateId: template.id,
                courseName: course?.name,
                teacherName: teacher?.user?.name,
                className: tc.className,
                weekday: day,
                periodPair: pairKey,
                message: `班级 ${tc.className} 在周${day}第${pairKey}节已有课程`,
                type: 'CLASS_CONFLICT',
              });
              continue; // 跳到下一个班级
            }
          }

          // 检查该教师在该节次对是否已在其他班级上课（教师冲突）
          const teacherBusyInOtherClass = dayEntries.some(
            e => e.teacherId === template.teacherId &&
              e.periodStart === pair.start &&
              e.periodEnd === pair.end &&
              // 确保不是教同一个班级的同一门课
              !(teachingClasses.some((tc: any) => tc.classId === e.classId))
          );
          if (teacherBusyInOtherClass) {
            conflicts.push({
              templateId: template.id,
              courseName: course?.name,
              teacherName: teacher?.user?.name,
              weekday: day,
              periodPair: pairKey,
              message: `教师 ${teacher?.user?.name} 在周${day}第${pairKey}节已在其他班级上课`,
              type: 'TEACHER_CONFLICT',
            });
            continue; // 跳到下一个节次对
          }

          // 创建排课条目（为每个班级创建一条）
          for (const tc of teachingClasses) {
            const entry = await this.prisma.scheduleEntry.create({
              data: {
                scheduleVersionId: version.id,
                classId: tc.classId,
                courseId: template.courseId,
                teacherId: template.teacherId,
                roomId: assignedRoom?.id || null,
                weekday: day,
                periodStart: pair.start,
                periodEnd: pair.end,
                lessonType: assignedRoom ? 'LAB' : 'THEORY',
              },
            });

            // 更新本地缓存
            existingEntries.push(entry);
            existingEntriesWithNames.push({
              ...entry,
              courseName: course?.name,
              teacherName: teacher?.user?.name,
              className: tc.className,
              roomName: assignedRoom?.name || null,
            });

            results.push({
              ...entry,
              courseName: course?.name,
              className: tc.className,
              teacherName: teacher?.user?.name,
              roomName: assignedRoom?.name || null,
            });
          }

          placedPairs++;
        }
      }

      // 检查是否排完
      if (placedPairs < totalPeriodPairs) {
        conflicts.push({
          templateId: template.id,
          courseName: course?.name,
          teacherName: teacher?.user?.name,
          requestedPeriods: totalPeriodPairs * 2,
          placedPeriods: placedPairs * 2,
          message: `只能排 ${placedPairs * 2}/${template.weekHours} 节（${placedPairs}/${totalPeriodPairs} 节次对）`,
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
