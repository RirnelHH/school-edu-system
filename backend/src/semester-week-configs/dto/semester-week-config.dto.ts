import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

// 创建/更新学期周数配置
export class CreateOrUpdateSemesterWeekConfigDto {
  @IsString()
  semesterId: string; // 学期ID

  @IsBoolean()
  isGraduating: boolean; // 是否毕业班

  @IsInt()
  @Min(1)
  @Max(30)
  weekCount: number; // 周数
}

// 批量更新
export class BatchUpdateSemesterWeekConfigDto {
  @IsString()
  semesterId: string;

  @IsInt()
  @Min(1)
  @Max(30)
  graduatingWeekCount: number; // 毕业班周数

  @IsInt()
  @Min(1)
  @Max(30)
  normalWeekCount: number; // 非毕业班周数
}
