import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { RoomType, RoomStatus } from '@prisma/client';

// 创建场地
export class CreateRoomDto {
  @IsString()
  name: string; // 场地名称，如"G606"、"画室1"

  @IsEnum(RoomType)
  type: RoomType; // CLASSROOM/COMPUTER_LAB/ART_STUDIO/NETWORK_LAB

  @IsInt()
  @Min(1)
  capacity: number; // 可容纳人数（工位数）

  @IsOptional()
  @IsString()
  building?: string; // 所在楼栋
}

// 更新场地
export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

// XLS导入模板行
export class ImportRoomRowDto {
  @IsString()
  name: string; // 场地名称

  @IsString()
  type: string; // 场地类型：教室/机房/画室/网络综合布线室

  @IsInt()
  @Min(1)
  capacity: number; // 容量/工位数

  @IsOptional()
  @IsString()
  building?: string; // 楼栋
}
