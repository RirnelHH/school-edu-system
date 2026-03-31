import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemesterWeekConfigsService } from '../semester-week-configs/semester-week-configs.service';

export interface CoefficientConfig {
  duplicateCoefficient: number;  // 重复课时系数
  classSizeCoefficient: number;   // 班级人数系数
}

export interface TeachingHoursDetail {
  classId: string;
  className: string;
  courseName: string;
  originalHours: number;        // 原始课时
  duplicateCoefficient: number;  // 重复系数
  classSizeCoefficient: number;  // 人数系数
  finalHours: number;           // 最终课时
  duplicateRank?: number;       // 重复排名
}

export interface TeachingHoursSummary {
  teacherId: string;
  teacherName: string;
  semesterId: string;
  semesterName: string;
  totalOriginalHours: number;
  totalFinalHours: number;
  suspensionDeductions: number;
  details: TeachingHoursDetail[];
}

// 班级人数系数配置
const CLASS_SIZE_COEFFICIENTS = [
  { min: 0, max: 20, coefficient: 0.80 },
  { min: 21, max: 30, coefficient: 0.90 },
  { min: 31, max: 40, coefficient: 1.00 },
  { min: 41, max: 50, coefficient: 1.15 },
  { min: 51, max: 60, coefficient: 1.30 },
  { min: 61, max: 999, coefficient: 1.50 },
];

// 重复课时系数配置（按排名）
const DUPLICATE_COEFFICIENTS = [
  { rank: 1, coefficient: 1.0 },
  { rank: 2, coefficient: 0.9 },
  { rank: 3, coefficient: 0.8 },
  { rank: 4, coefficient: 0.7 },
  { rank: 5, coefficient: 0.6 },
];

@Injectable()
export class TeachingHoursService {
  constructor(
    private prisma: PrismaService,
    private semesterWeekConfigs: SemesterWeekConfigsService,
  ) {}

  /**
   * 计算班级人数系数
   */
  getClassSizeCoefficient(studentCount: number): number {
    const config = CLASS_SIZE_COEFFICIENTS.find(
      c => studentCount >= c.min && studentCount <= c.max
    );
    return config?.coefficient || 1.0;
  }

  /**
   * 获取重复课时系数
   */
  getDuplicateCoefficient(rank: number): number {
    const config = DUPLICATE_COEFFICIENTS.find(c => c.rank === rank);
    return config?.coefficient || 0.5;
  }

  /**
   * 计算单个教师的课时
   */
  async calculateTeacherHours(teacherId: string, semesterId: string) {
    // 获取学期信息
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
      include: { academicYear: true },
    });
    if (!semester) {
      throw new Error('Semester not found');
    }

    // 获取学期周数配置（使用有效教学周数，扣除劳动周）
    const weekConfig = await this.prisma.semesterWeekConfig.findUnique({
      where: { semesterId },
    });
    const laborWeekCount = weekConfig?.laborWeekCount || 0;
    const totalWeekCount = weekConfig?.weekCount || 18;
    const effectiveWeeks = Math.max(0, totalWeekCount - laborWeekCount);

    // 获取教师信息
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // 获取该教师在该学期的所有排课记录
    const entries = await this.prisma.scheduleEntry.findMany({
      where: {
        teacherId,
        scheduleVersion: {
          semesterId,
          status: 'PUBLISHED',
        },
      },
      include: {
        scheduleVersion: true,
      },
    });

    // 获取相关的班级和课程信息
    const classIds = [...new Set(entries.map(e => e.classId))];
    const courseIds = [...new Set(entries.map(e => e.courseId))];

    const [classes, courses] = await Promise.all([
      this.prisma.class.findMany({ where: { id: { in: classIds } } }),
      this.prisma.course.findMany({ where: { id: { in: courseIds } } }),
    ]);

    const classMap = new Map(classes.map(c => [c.id, c]));
    const courseMap = new Map(courses.map(c => [c.id, c]));

    // 按班级和课程分组，计算原始课时
    const classCourseMap = new Map<string, {
      classId: string;
      className: string;
      courseName: string;
      studentCount: number;
      periodsPerWeek: number;
      weeksCount: number;
    }>();

    for (const entry of entries) {
      const key = `${entry.classId}-${entry.courseId}`;
      if (!classCourseMap.has(key)) {
        const cls = classMap.get(entry.classId);
        const course = courseMap.get(entry.courseId);
        classCourseMap.set(key, {
          classId: entry.classId,
          className: cls?.name || '-',
          courseName: course?.name || '-',
          studentCount: cls?.studentCount || 0,
          periodsPerWeek: entry.periodEnd - entry.periodStart + 1,
          weeksCount: effectiveWeeks,
        });
      }
    }

    // 计算重复系数（同一课程教多个班级的排名）
    const courseClassesMap = new Map<string, string[]>();
    for (const [key, data] of classCourseMap) {
      const courseName = data.courseName;
      if (!courseClassesMap.has(courseName)) {
        courseClassesMap.set(courseName, []);
      }
      courseClassesMap.get(courseName)!.push(key);
    }

    // 计算每个班级-课程的详细课时
    const details: TeachingHoursDetail[] = [];
    let totalOriginalHours = 0;
    let totalFinalHours = 0;

    for (const [key, data] of classCourseMap) {
      const originalHours = data.periodsPerWeek * data.weeksCount;
      const classSizeCoefficient = this.getClassSizeCoefficient(data.studentCount);

      // 该课程教多少个班
      const sameCourseClasses = courseClassesMap.get(data.courseName) || [];
      const rank = sameCourseClasses.indexOf(key) + 1;
      const duplicateCoefficient = this.getDuplicateCoefficient(rank);

      const finalHours = Math.round(originalHours * duplicateCoefficient * classSizeCoefficient * 10) / 10;

      totalOriginalHours += originalHours;
      totalFinalHours += finalHours;

      details.push({
        classId: data.classId,
        className: data.className,
        courseName: data.courseName,
        originalHours,
        duplicateCoefficient,
        classSizeCoefficient,
        finalHours,
        duplicateRank: rank,
      });
    }

    // 获取停课记录并扣减
    const suspensions = await this.prisma.scheduleSuspension.findMany({
      where: {
        scheduleEntry: {
          teacherId,
          scheduleVersion: {
            semesterId,
          },
        },
      },
    });

    const suspensionDeductions = suspensions.length * 2; // 每次停课扣2课时

    return {
      teacherId,
      teacherName: teacher.user?.name || '-',
      semesterId,
      semesterName: `第${semester.number}学期`,
      totalOriginalHours,
      totalFinalHours: Math.round((totalFinalHours - suspensionDeductions) * 10) / 10,
      suspensionDeductions,
      details,
    };
  }

  /**
   * 获取所有教师的课时统计
   */
  async calculateAllTeachersHours(semesterId: string) {
    const teachers = await this.prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
    });

    const results: TeachingHoursSummary[] = [];
    for (const teacher of teachers) {
      try {
        const summary = await this.calculateTeacherHours(teacher.id, semesterId);
        results.push(summary);
      } catch (e) {
        // 跳过计算失败的教师
      }
    }

    // 按最终课时降序排列
    return results.sort((a, b) => b.totalFinalHours - a.totalFinalHours);
  }
}
