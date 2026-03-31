import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { AccountType } from '@prisma/client';

// 注册账号
export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string; // 用户名

  @IsString()
  @MinLength(6)
  password: string; // 密码

  @IsString()
  name: string; // 真实姓名

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  wechatOpenid?: string; // 微信openid

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType; // TEACHER/STUDENT/ADMIN，默认 STUDENT
}
