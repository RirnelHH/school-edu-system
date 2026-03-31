import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PlanCourseDto {
  @IsString()
  courseId: string;

  @IsNumber()
  @Min(1)
  @Max(6)
  semester: number;

  @IsOptional()
  @IsNumber()
  hoursPerWeek?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  practiceHoursPercent?: number;
}

export class CreatePlanDto {
  @IsString()
  majorId: string;

  @IsNumber()
  @Min(1)
  @Max(6)
  grade: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanCourseDto)
  courses: PlanCourseDto[];
}

export class UpdatePlanDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanCourseDto)
  courses?: PlanCourseDto[];
}

export class SubmitPlanDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ApprovePlanDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectPlanDto {
  @IsString()
  reason: string;
}
