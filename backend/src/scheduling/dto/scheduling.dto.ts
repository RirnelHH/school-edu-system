import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LessonType } from '@prisma/client';

// 创建排课版本
export class CreateScheduleVersionDto {
  @IsString()
  semesterId: string;

  @IsOptional()
  @IsInt()
  versionNumber?: number; // 不传则自动+1
}

// 手动添加排课条目
export class AddScheduleEntryDto {
  @IsString()
  scheduleVersionId: string;

  @IsString()
  classId: string;

  @IsString()
  courseId: string;

  @IsString()
  teacherId: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  weekday: number; // 1=周一 ~ 5=周五

  @IsInt()
  @Min(1)
  @Max(8)
  periodStart: number; // 第几节课开始

  @IsInt()
  @Min(1)
  @Max(8)
  periodEnd: number; // 第几节课结束

  @IsEnum(LessonType)
  lessonType: LessonType;
}

// 更新排课条目
export class UpdateScheduleEntryDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  weekday?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  periodStart?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  periodEnd?: number;

  @IsOptional()
  @IsEnum(LessonType)
  lessonType?: LessonType;
}

// 自动排课参数
export class AutoScheduleDto {
  @IsString()
  semesterId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  versionNumber?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTeacherIds?: string[]; // 排除的教师ID

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeClassIds?: string[]; // 排除的班级ID
}

// 排课冲突检测结果
export interface ScheduleConflict {
  type: 'ROOM_CONFLICT' | 'TEACHER_CONFLICT' | 'CLASS_CONFLICT';
  teacherId?: string;
  classId?: string;
  roomId?: string;
  courseName: string;
  weekday: number;
  periodStart: number;
  periodEnd: number;
  conflictWith?: {
    courseName: string;
    teacherId?: string;
    classId?: string;
    roomId?: string;
  };
}
