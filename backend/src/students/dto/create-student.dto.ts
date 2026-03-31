import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, ValidateIf } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  studentNumber: string; // 学号

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @ValidateIf((o) => o.phone !== null)
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ValidateIf((o) => o.email !== null)
  @IsOptional()
  @IsString()
  email?: string | null;

  @IsString()
  classId: string;

  @IsNumber()
  @Min(2000)
  @Max(2100)
  enrollmentYear: number; // 入学年份

  // For import - 班级名称（用于查找班级ID）
  @IsOptional()
  @IsString()
  className?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class ImportStudentDto {
  @IsString()
  studentNumber: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  className: string; // 班级名称（用于查找班级ID）
}
