import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

// 创建班级
export class CreateClassDto {
  @IsString()
  majorId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(5)
  grade: number; // 年级 1-5

  @IsOptional()
  @IsInt()
  @Min(1)
  studentCount?: number;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsInt()
  enrollmentYear?: number; // 入学年份
}

// 更新班级
export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  grade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  studentCount?: number;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsInt()
  enrollmentYear?: number;
}

// 查询班级
export class QueryClassDto {
  @IsOptional()
  @IsString()
  majorId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  grade?: number;

  @IsOptional()
  @IsInt()
  enrollmentYear?: number;
}
