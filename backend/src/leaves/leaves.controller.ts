import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLeaveDto, ApprovalDto, LeaveStatus } from './dto/leave.dto';

@Controller('api/v1/leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  /**
   * 学生提交请假申请
   */
  @Post()
  async createLeave(@Request() req: any, @Body() dto: CreateLeaveDto) {
    const student = await this.leavesService.getStudentByUserId(req.user.userId);
    const result = await this.leavesService.createLeave(student.id, dto);
    return { success: true, data: result };
  }

  /**
   * 获取请假列表
   */
  @Get()
  async getLeaves(@Request() req: any, @Query('status') status?: LeaveStatus) {
    const userId = req.user.userId;
    const isAdmin = await this.leavesService.hasAdminRole(userId);
    const teacher = await this.leavesService.getTeacherByUserId(userId);
    const isClassTeacher = !!teacher;

    let studentId: string | undefined;
    if (req.user.accountType === 'STUDENT') {
      try {
        const student = await this.leavesService.getStudentByUserId(userId);
        studentId = student.id;
      } catch {
        // Not a student
      }
    }

    const result = await this.leavesService.getLeaves({
      userId,
      status,
      isAdmin,
      isClassTeacher,
      studentId,
    });

    return { success: true, data: result };
  }

  /**
   * 获取请假详情
   */
  @Get(':id')
  async getLeaveById(@Param('id') id: string) {
    const result = await this.leavesService.getLeaveById(id);
    return { success: true, data: result };
  }

  /**
   * 审批请假
   */
  @Post(':id/approve')
  async approveLeave(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ApprovalDto,
  ) {
    const result = await this.leavesService.approveLeave(
      id,
      req.user.userId,
      dto.decision,
      dto.comment,
    );
    return { success: true, data: result };
  }

  /**
   * 取消请假
   */
  @Delete(':id')
  async cancelLeave(@Param('id') id: string, @Request() req: any) {
    const student = await this.leavesService.getStudentByUserId(req.user.userId);
    const result = await this.leavesService.cancelLeave(id, student.id);
    return { success: true, data: result };
  }
}
