import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsObject } from 'class-validator';

// 授课计划状态
export enum TeachingPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_TEACHER = 'PENDING_TEACHER',
  PENDING_GROUP_LEADER = 'PENDING_GROUP_LEADER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// 教案状态
export enum LessonPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_TEACHER = 'PENDING_TEACHER',
  PENDING_GROUP_LEADER = 'PENDING_GROUP_LEADER',
  PENDING_DIRECTOR = 'PENDING_DIRECTOR',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// 创建授课计划
export class CreateTeachingPlanDto {
  @IsString()
  courseId: string;

  @IsString()
  semesterId: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}

// 提交授课计划
export class SubmitTeachingPlanDto {
  @IsOptional()
  @IsString()
  excelUrl?: string;
}

// 多教师审核
export class TeacherApprovalDto {
  @IsEnum(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  comment?: string;
}

// 教研组长/主任审核
export class LeaderApprovalDto {
  @IsEnum(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  comment?: string;
}

// 创建教案
export class CreateLessonPlanDto {
  @IsString()
  teachingPlanId: string;

  @IsNumber()
  weekNumber: number;

  @IsString()
  lessonTitle: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

// 更新教案
export class UpdateLessonPlanDto {
  @IsOptional()
  @IsString()
  lessonTitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

// 导入授课计划（从Excel数据）
export class ImportExcelDto {
  @IsString()
  excelUrl: string;

  @IsObject()
  data: {
    totalHours?: number;
    completedHours?: number;
    remainingHours?: number;
    teachingWeekCount?: number;
    weeklyHours?: number;
    theoryHours?: number;
    labHours?: number;
    practiceHours?: number;
    examHours?: number;
    entries?: Array<{
      weekNumber: number;
      sequence: number;
      chapterTitle?: string;
      content?: string;
      theoryHours?: number;
      labHours?: number;
      practiceHours?: number;
      testHours?: number;
      examHours?: number;
      visitHours?: number;
      flexibleHours?: number;
      subtotal?: number;
      homework?: string;
    }>;
  };
}
