import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulingService } from './scheduling.service';
import {
  CreateScheduleVersionDto,
  AddScheduleEntryDto,
  UpdateScheduleEntryDto,
  AutoScheduleDto,
} from './dto/scheduling.dto';

@Controller('api/v1/scheduling')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  // ============ 版本管理 ============

  // 创建排课版本
  @Post('versions')
  createVersion(@Body() data: CreateScheduleVersionDto) {
    return this.service.createVersion(data);
  }

  // 获取排课版本列表
  @Get('versions')
  getVersions(@Query('semesterId') semesterId: string) {
    return this.service.getVersions(semesterId);
  }

  // 获取排课版本详情
  @Get('versions/:id')
  getVersionDetail(@Param('id') id: string) {
    return this.service.getVersionDetail(id);
  }

  // 发布排课版本
  @Post('versions/:id/publish')
  publishVersion(@Param('id') id: string) {
    return this.service.publishVersion(id);
  }

  // ============ 排课条目 ============

  // 添加排课条目
  @Post('entries')
  addEntry(@Body() data: AddScheduleEntryDto) {
    return this.service.addEntry(data);
  }

  // 更新排课条目
  @Put('entries/:id')
  updateEntry(@Param('id') id: string, @Body() data: UpdateScheduleEntryDto) {
    return this.service.updateEntry(id, data);
  }

  // 删除排课条目
  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string) {
    return this.service.deleteEntry(id);
  }

  // ============ 自动排课 ============

  // 自动排课
  @Post('auto')
  autoSchedule(@Body() data: AutoScheduleDto) {
    return this.service.autoSchedule(data);
  }

  // ============ 查询 ============

  // 班级课表
  @Get('class/:classId')
  getClassSchedule(
    @Param('classId') classId: string,
    @Query('versionId') versionId?: string,
  ) {
    return this.service.getClassSchedule(classId, versionId);
  }

  // 教师课表
  @Get('teacher/:teacherId')
  getTeacherSchedule(
    @Param('teacherId') teacherId: string,
    @Query('versionId') versionId?: string,
  ) {
    return this.service.getTeacherSchedule(teacherId, versionId);
  }

  // 教室课表
  @Get('room/:roomId')
  getRoomSchedule(
    @Param('roomId') roomId: string,
    @Query('versionId') versionId?: string,
  ) {
    return this.service.getRoomSchedule(roomId, versionId);
  }

  // 冲突检测
  @Post('check-conflicts')
  checkConflicts(@Body() data: any) {
    return this.service.checkConflicts(
      data.scheduleVersionId,
      data.roomId,
      data.teacherId,
      data.classId,
      data.weekday,
      data.periodStart,
      data.periodEnd,
    );
  }
}
