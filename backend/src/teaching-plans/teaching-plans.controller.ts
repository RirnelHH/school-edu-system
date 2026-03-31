import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeachingPlansService } from './teaching-plans.service';
import { CreateTeachingPlanDto, SubmitTeachingPlanDto, TeacherApprovalDto, LeaderApprovalDto, CreateLessonPlanDto, UpdateLessonPlanDto } from './dto/teaching-plan.dto';

@Controller('api/v1/teaching-plans')
@UseGuards(JwtAuthGuard)
export class TeachingPlansController {
  constructor(private readonly service: TeachingPlansService) {}

  // ========== 授课计划 ==========

  /**
   * 创建授课计划（管理员）
   */
  @Post()
  create(@Body() body: CreateTeachingPlanDto & { teacherIds: string[]; groupLeaderId: string }) {
    return this.service.createTeachingPlan(body, body.teacherIds, body.groupLeaderId);
  }

  /**
   * 获取授课计划列表
   */
  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('semesterId') semesterId?: string,
    @Query('status') status?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.service.getTeachingPlans({ courseId, semesterId, status, teacherId });
  }

  /**
   * 获取单个授课计划
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getTeachingPlanById(id);
  }

  /**
   * 提交授课计划（上传Excel）
   */
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitTeachingPlanDto) {
    return this.service.submitTeachingPlan(id, dto);
  }

  /**
   * 多教师审核授课计划
   */
  @Post(':id/teacher-approve')
  teacherApprove(@Param('id') id: string, @Request() req: any, @Body() dto: TeacherApprovalDto) {
    return this.service.teacherApproveTeachingPlan(id, req.user.userId, dto);
  }

  /**
   * 教研组长审核授课计划
   */
  @Post(':id/group-leader-approve')
  groupLeaderApprove(@Param('id') id: string, @Request() req: any, @Body() dto: LeaderApprovalDto) {
    return this.service.groupLeaderApproveTeachingPlan(id, req.user.userId, dto);
  }

  /**
   * 导入Excel数据到授课计划
   */
  @Post(':id/import-excel')
  importExcel(@Param('id') id: string, @Body() body: { data: any }) {
    return this.service.importFromExcel(id, body.data);
  }

  /**
   * 解析XLS文件并导入授课计划
   */
  @Post(':id/parse-xls')
  parseXls(@Param('id') id: string, @Body() body: { filePath: string }) {
    return this.service.parseAndImportXls(body.filePath, id);
  }

  /**
   * 获取授课计划（含内容条目）
   */
  @Get(':id/entries')
  getWithEntries(@Param('id') id: string) {
    return this.service.getTeachingPlanWithEntries(id);
  }

  /**
   * 计算课程总课时
   */
  @Get('calculate-hours/:courseId')
  calculateHours(@Param('courseId') courseId: string, @Query('semesterId') semesterId: string) {
    return this.service.calculateTotalHours(courseId, semesterId);
  }

  // ========== 教案 ==========

  /**
   * 创建教案
   */
  @Post('lesson-plans')
  createLessonPlan(@Body() dto: CreateLessonPlanDto) {
    return this.service.createLessonPlan(dto);
  }

  /**
   * 获取授课计划的所有教案
   */
  @Get('lesson-plans/:teachingPlanId')
  getLessonPlans(@Param('teachingPlanId') teachingPlanId: string) {
    return this.service.getLessonPlans(teachingPlanId);
  }

  /**
   * 获取单个教案（含下载链接）
   */
  @Get('lesson-plans/detail/:id')
  getLessonPlan(@Param('id') id: string) {
    return this.service.getLessonPlanById(id);
  }

  /**
   * 上传教案Word文档
   */
  @Put('lesson-plans/:id/attachment')
  uploadLessonPlan(@Param('id') id: string, @Body() body: { attachmentUrl: string }) {
    return this.service.uploadLessonPlan(id, body.attachmentUrl);
  }

  /**
   * 提交教案
   */
  @Post('lesson-plans/:id/submit')
  submitLessonPlan(@Param('id') id: string) {
    return this.service.submitLessonPlan(id);
  }

  /**
   * 多教师审核教案
   */
  @Post('lesson-plans/:id/teacher-approve')
  teacherApproveLessonPlan(@Param('id') id: string, @Request() req: any, @Body() dto: TeacherApprovalDto) {
    return this.service.teacherApproveLessonPlan(id, req.user.userId, dto);
  }

  /**
   * 教研组长审核教案
   */
  @Post('lesson-plans/:id/group-leader-approve')
  groupLeaderApproveLessonPlan(@Param('id') id: string, @Request() req: any, @Body() dto: LeaderApprovalDto) {
    return this.service.groupLeaderApproveLessonPlan(id, req.user.userId, dto);
  }

  /**
   * 主任审批教案
   */
  @Post('lesson-plans/:id/director-approve')
  directorApproveLessonPlan(@Param('id') id: string, @Request() req: any, @Body() dto: LeaderApprovalDto) {
    return this.service.directorApproveLessonPlan(id, req.user.userId, dto);
  }
}
