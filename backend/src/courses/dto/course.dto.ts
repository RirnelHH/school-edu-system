import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export enum CourseCategory {
  PUBLIC = 'PUBLIC',           // 公共课
  BASIC = 'BASIC',             // 专业基础课
  PROFESSIONAL = 'PROFESSIONAL', // 专业课
  PRACTICAL = 'PRACTICAL',     // 实践课
  ELECTIVE = 'ELECTIVE',       // 选修课
}

export class CreateCourseDto {
  @IsString()
  code: string;  // 课程编号

  @IsString()
  name: string;  // 课程名称

  @IsNumber()
  @Min(0.5)
  @Max(20)
  credits: number;  // 学分

  @IsEnum(CourseCategory)
  category: CourseCategory;  // 课程类别

  @IsNumber()
  @Min(1)
  totalHours: number;  // 总课时
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(20)
  credits?: number;

  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalHours?: number;
}

// 课程标准（课标）- 简化版
export class CreateCourseStandardDto {
  @IsString()
  courseId: string;

  @IsString()
  content: string;  // 课标内容
}

export class UpdateCourseStandardDto {
  @IsOptional()
  @IsString()
  content?: string;
}
