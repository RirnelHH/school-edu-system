import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { EducationType } from '@prisma/client';

// 创建专业
export class CreateMajorDto {
  @IsString()
  departmentId: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(EducationType)
  educationType?: EducationType; // HIGH_TECH=高技, SECONDARY=中技

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(5)
  duration?: number; // 学制年限：3或5
}

// 更新专业
export class UpdateMajorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(EducationType)
  educationType?: EducationType;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(5)
  duration?: number;
}

// 查询专业
export class QueryMajorDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(EducationType)
  educationType?: EducationType;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(5)
  duration?: number;
}
