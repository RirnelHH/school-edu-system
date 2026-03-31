import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum LeaveType {
  PERSONAL = 'PERSONAL',   // 事假
  SICK = 'SICK',          // 病假
  OTHER = 'OTHER',        // 其他
}

export enum LeaveStatus {
  PENDING = 'PENDING',    // 待审批
  APPROVED = 'APPROVED',  // 已批准
  REJECTED = 'REJECTED',  // 已拒绝
  CANCELLED = 'CANCELLED', // 已取消
}

export enum ApprovalDecision {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class CreateLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class ApprovalDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class QueryLeaveDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  classId?: string;
}
