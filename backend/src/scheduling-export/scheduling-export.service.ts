import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType, ShadingType } from 'docx';

@Injectable()
export class SchedulingExportService {
  constructor(private prisma: PrismaService) {}

  async exportClassSchedule(classId: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { major: true },
    });
    if (!cls) {
      throw new Error('Class not found');
    }
    const schedule = await this.getClassScheduleData(classId);
    const doc = this.generateClassDoc(cls, schedule);
    const filename = cls.name + '_schedule.docx';
    return { doc, filename };
  }

  async exportTeacherSchedule(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    const schedule = await this.getTeacherScheduleData(teacherId);
    const doc = this.generateTeacherDoc(teacher, schedule);
    const filename = (teacher.user?.name || 'unknown') + '_schedule.docx';
    return { doc, filename };
  }

  private async getClassScheduleData(classId: string) {
    const latest = await this.prisma.scheduleVersion.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
    const entries = await this.prisma.scheduleEntry.findMany({
      where: { classId, scheduleVersionId: latest?.id },
    });
    const scheduleData = new Map<number, Map<number, any>>();
    for (let d = 1; d <= 5; d++) {
      scheduleData.set(d, new Map<number, any>());
    }
    const teacherIds = entries.map(e => e.teacherId);
    const courseIds = entries.map(e => e.courseId);
    const roomIdList = entries.filter(e => e.roomId != null).map(e => e.roomId as string);
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: { user: true },
    });
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });
    const rooms = await this.prisma.room.findMany({
      where: { id: { in: roomIdList } },
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const courseMap = new Map(courses.map(c => [c.id, c]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));
    for (const entry of entries) {
      const dayMap = scheduleData.get(entry.weekday);
      if (!dayMap) continue;
      for (let p = entry.periodStart; p <= entry.periodEnd; p++) {
        dayMap.set(p, {
          courseName: courseMap.get(entry.courseId)?.name || '-',
          teacherName: teacherMap.get(entry.teacherId)?.user?.name || '-',
          roomName: entry.roomId && roomMap.has(entry.roomId) ? roomMap.get(entry.roomId)?.name : '-',
          lessonType: entry.lessonType,
        });
      }
    }
    return scheduleData;
  }

  private async getTeacherScheduleData(teacherId: string) {
    const latest = await this.prisma.scheduleVersion.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
    const entries = await this.prisma.scheduleEntry.findMany({
      where: { teacherId, scheduleVersionId: latest?.id },
    });
    const scheduleData = new Map<number, Map<number, any>>();
    for (let d = 1; d <= 5; d++) {
      scheduleData.set(d, new Map<number, any>());
    }
    const classIds = entries.map(e => e.classId);
    const courseIds = entries.map(e => e.courseId);
    const roomIdList = entries.filter(e => e.roomId != null).map(e => e.roomId as string);
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { major: true, classTeacher: { include: { user: true } } },
    });
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });
    const rooms = await this.prisma.room.findMany({
      where: { id: { in: roomIdList } },
    });
    const classMap = new Map(classes.map(c => [c.id, c]));
    const courseMap = new Map(courses.map(c => [c.id, c]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));
    for (const entry of entries) {
      const dayMap = scheduleData.get(entry.weekday);
      if (!dayMap) continue;
      for (let p = entry.periodStart; p <= entry.periodEnd; p++) {
        const cls = classMap.get(entry.classId);
        dayMap.set(p, {
          courseName: courseMap.get(entry.courseId)?.name || '-',
          className: cls?.name || '-',
          classInfo: cls ? `${cls.name}${cls.studentCount ? `（${cls.studentCount}人）` : ''}` : '-',
          roomName: entry.roomId && roomMap.has(entry.roomId) ? roomMap.get(entry.roomId)?.name : '-',
          lessonType: entry.lessonType,
        });
      }
    }
    return scheduleData;
  }

  private generateClassDoc(cls: any, scheduleData: Map<number, Map<number, any>>) {
    const dayNames = ['星期一', '星期二', '星期三', '星期四', '星期五'];
    const periodSlots = [
      { label: '1-2', time: '8:30-10:00' },
      { label: '3-4', time: '10:30-12:00' },
      { label: '5-6', time: '14:00-15:30' },
      { label: '7-8', time: '15:40-17:10' },
    ];

    const headerRow = new TableRow({
      children: [
        this.createHeaderCell('节次'),
        ...dayNames.map(d => this.createHeaderCell(d)),
      ],
    });

    const dataRows: TableRow[] = [];
    for (let pi = 0; pi < 4; pi++) {
      const periodStart = pi * 2 + 1;
      const config = periodSlots[pi];
      const cells: TableCell[] = [this.createPeriodCell(config.label + '\n' + config.time)];

      for (let day = 1; day <= 5; day++) {
        const dayMap = scheduleData.get(day);
        const entry1 = dayMap?.get(periodStart);
        const entry2 = dayMap?.get(periodStart + 1);
        let cellText = '';

        // 合并相邻节次的同一课程
        if (entry1 && entry2 && entry1.courseName === entry2.courseName) {
          cellText = entry1.courseName + '\n' + entry1.teacherName + '\n' + entry1.roomName;
        } else if (entry1) {
          cellText = entry1.courseName + '\n' + entry1.teacherName + '\n' + entry1.roomName;
        } else if (entry2) {
          cellText = entry2.courseName + '\n' + entry2.teacherName + '\n' + entry2.roomName;
        }

        // 特殊标注实训室
        if ((entry1?.roomName && entry1.roomName.includes('G606') || entry2?.roomName && entry2.roomName.includes('G606'))) {
          cellText = cellText.replace('G606', 'G606\n（机房，实训室至11:50）');
        }

        cells.push(this.createCell(cellText));
      }
      dataRows.push(new TableRow({ children: cells }));
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    });

    const title = new Paragraph({
      children: [new TextRun({ text: '2025-2026学年第二学期功课表', size: 28, bold: true })],
      alignment: AlignmentType.CENTER,
    });

    const classInfoLine1 = new Paragraph({
      children: [new TextRun({ text: `班级：${cls.name}          班主任：${cls.teacher?.user?.name || '-'}`,
        size: 24 })],
      alignment: AlignmentType.LEFT,
    });

    const classInfoLine2 = new Paragraph({
      children: [new TextRun({ text: `班级人数：${cls.studentCount || 0}人`,
        size: 24 })],
      alignment: AlignmentType.LEFT,
    });

    const weekDayHeader = new Paragraph({
      children: [new TextRun({ text: '    星期', size: 24 })],
    });

    const spacer = new Paragraph({ text: '' });

    const deptRow = new Paragraph({
      children: [new TextRun({ text: '信息技术与设计系', size: 21 })],
      alignment: AlignmentType.LEFT,
    });

    const dateRow = new Paragraph({
      children: [new TextRun({ text: '2026年3月1日', size: 21 })],
      alignment: AlignmentType.LEFT,
    });

    return new Document({
      sections: [{
        properties: {},
        children: [
          title,
          classInfoLine1,
          classInfoLine2,
          spacer,
          weekDayHeader,
          table,
          spacer,
          deptRow,
          dateRow,
        ],
      }],
    });
  }

  private generateTeacherDoc(teacher: any, scheduleData: Map<number, Map<number, any>>) {
    const dayNames = ['星期一', '星期二', '星期三', '星期四', '星期五'];
    const periodSlots = [
      { label: '1-2', time: '8:30-10:00' },
      { label: '3-4', time: '10:30-12:00' },
      { label: '5-6', time: '14:00-15:30' },
      { label: '7-8', time: '15:40-17:10' },
    ];

    const headerRow = new TableRow({
      children: [
        this.createHeaderCell('节次'),
        ...dayNames.map(d => this.createHeaderCell(d)),
      ],
    });

    const dataRows: TableRow[] = [];
    for (let pi = 0; pi < 4; pi++) {
      const periodStart = pi * 2 + 1;
      const config = periodSlots[pi];
      const cells: TableCell[] = [this.createPeriodCell(config.label + '\n' + config.time)];

      for (let day = 1; day <= 5; day++) {
        const dayMap = scheduleData.get(day);
        const entry1 = dayMap?.get(periodStart);
        const entry2 = dayMap?.get(periodStart + 1);
        let cellText = '';

        // 合并相邻节次的同一课程
        if (entry1 && entry2 && entry1.courseName === entry2.courseName) {
          cellText = entry1.courseName + '\n' + entry1.classInfo + '\n' + entry1.roomName;
        } else if (entry1) {
          cellText = entry1.courseName + '\n' + entry1.classInfo + '\n' + entry1.roomName;
        } else if (entry2) {
          cellText = entry2.courseName + '\n' + entry2.classInfo + '\n' + entry2.roomName;
        }

        // 特殊标注机房
        if ((entry1?.roomName && entry1.roomName.includes('G606') || entry2?.roomName && entry2.roomName.includes('G606'))) {
          cellText = cellText.replace('G606', 'G606\n（机房，实训室至11:50）');
        }

        cells.push(this.createCell(cellText));
      }
      dataRows.push(new TableRow({ children: cells }));
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    });

    const title = new Paragraph({
      children: [new TextRun({ text: '2025-2026学年 第二学期教师功课表', size: 28, bold: true })],
      alignment: AlignmentType.CENTER,
    });

    const teacherNameRow = new Paragraph({
      children: [new TextRun({ text: `教师姓名：${teacher.user?.name || '-'}`,
        size: 24 })],
    });

    const weekDayHeader = new Paragraph({
      children: [new TextRun({ text: '    星期', size: 24 })],
    });

    const spacer = new Paragraph({ text: '' });

    const deptRow = new Paragraph({
      children: [new TextRun({ text: '教务科', size: 21 })],
      alignment: AlignmentType.LEFT,
    });

    const dateRow = new Paragraph({
      children: [new TextRun({ text: '2026年3月1日', size: 21 })],
      alignment: AlignmentType.LEFT,
    });

    return new Document({
      sections: [{
        properties: {},
        children: [
          title,
          teacherNameRow,
          spacer,
          weekDayHeader,
          table,
          spacer,
          deptRow,
          dateRow,
        ],
      }],
    });
  }

  private createHeaderCell(text: string): TableCell {
    return new TableCell({
      children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
      shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }

  private createPeriodCell(text: string): TableCell {
    return new TableCell({
      children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
      width: { size: 15, type: WidthType.PERCENTAGE },
      shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }

  private createCell(text: string): TableCell {
    return new TableCell({
      children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }
}
