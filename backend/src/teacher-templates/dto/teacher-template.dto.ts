import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { RoomType, TemplateStatus } from '@prisma/client';

// ============================================
// 排课时间段
// ============================================
export class TimeSlotDto {
  @IsInt()
  @Min(1)
  @Max(5)
  dayOfWeek: number; // 1=周一, 5=周五

  @IsInt()
  @Min(1)
  @Max(8)
  periodStart: number; // 第几节课开始

  @IsInt()
  @Min(1)
  @Max(8)
  periodEnd: number; // 第几节课结束
}

// ============================================
// 教学班信息（合班）
// ============================================
export class TeachingClassDto {
  @IsString()
  classId: string;

  @IsString()
  className: string;

  @IsInt()
  @Min(1)
  studentCount: number;
}

// ============================================
// 创建师资模板
// ============================================
export class CreateTeacherTemplateDto {
  @IsString()
  teacherId: string;

  @IsString()
  semesterId: string;

  @IsString()
  courseId: string;

  @IsString()
  courseName: string;

  @IsInt()
  @Min(1)
  weekHours: number; // 周节数

  @IsInt()
  @Min(0)
  theoryHours: number; // 理论课时

  @IsInt()
  @Min(0)
  practiceHours: number; // 上机课时

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeachingClassDto)
  teachingClasses: TeachingClassDto[]; // 合班信息

  @IsOptional()
  @IsEnum(RoomType)
  recommendedRoomType?: RoomType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  preferredSlots?: TimeSlotDto[]; // 优先排课区间

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  forbiddenSlots?: TimeSlotDto[]; // 不可排课区间
}

// ============================================
// 更新师资模板
// ============================================
export class UpdateTeacherTemplateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  weekHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  theoryHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  practiceHours?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeachingClassDto)
  teachingClasses?: TeachingClassDto[];

  @IsOptional()
  @IsEnum(RoomType)
  recommendedRoomType?: RoomType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  preferredSlots?: TimeSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  forbiddenSlots?: TimeSlotDto[];
}

// ============================================
// 提交师资模板（审批流程）
// ============================================
export class SubmitTemplateDto {
  @IsBoolean()
  submit: boolean; // true=提交, false=撤回
}

// ============================================
// 审批/驳回
// ============================================
export class ApproveTemplateDto {
  @IsBoolean()
  approved: boolean; // true=通过, false=驳回

  @IsOptional()
  @IsString()
  reason?: string; // 驳回原因
}

// ============================================
// 查询条件
// ============================================
export class QueryTeacherTemplateDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  semesterId?: string;

  @IsOptional()
  @IsString()
  status?: TemplateStatus;

  @IsOptional()
  @IsInt()
  grade?: number; // 年级
}

// ============================================
// 导入Excel模板行
// ============================================
export class ImportTemplateRowDto {
  @IsString()
  teacherName: string; // 教师姓名

  @IsString()
  courseName: string; // 课程名称

  @IsInt()
  @Min(1)
  weekHours: number; // 周节数

  @IsInt()
  @Min(0)
  theoryHours: number; // 理论课时

  @IsInt()
  @Min(0)
  practiceHours: number; // 上机课时

  @IsString()
  classNames: string; // 授课班级（逗号分隔，支持合班）

  @IsOptional()
  @IsEnum(RoomType)
  recommendedRoomType?: RoomType;

  @IsOptional()
  @IsString()
  preferredSlots?: string; // 优先排课区间，如"周一(7-8),周二(3-4)"

  @IsOptional()
  @IsString()
  forbiddenSlots?: string; // 不可排课区间
}

// ============================================
// 师资模板统计（用于校验）
// ============================================
export interface TeacherWorkloadSummary {
  teacherId: string;
  teacherName: string;
  semesterId: string;
  totalWeekHours: number; // 周总节数
  totalHours: number; // 学期总课时
  courseCount: number; // 课程数量
  templates: {
    courseName: string;
    weekHours: number;
    theoryHours: number;
    practiceHours: number;
    teachingClasses: string; // 合班后的班级名称
  }[];
}

export interface RoomCapacityCheck {
  roomType: RoomType;
  totalPracticeHoursNeeded: number; // 需要的上机总课时
  roomCount: number; // 可用机房数量
  totalCapacity: number; // 总容量
  hasWarnings: boolean; // 是否有警告
  warnings?: string[]; // 告警信息（仅提醒，不阻塞）
}
