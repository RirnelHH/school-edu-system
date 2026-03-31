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
import { SemesterWeekConfigsService } from './semester-week-configs.service';
import { CreateOrUpdateSemesterWeekConfigDto, BatchUpdateSemesterWeekConfigDto } from './dto/semester-week-config.dto';

@Controller('api/v1/semester-week-configs')
@UseGuards(JwtAuthGuard)
export class SemesterWeekConfigsController {
  constructor(private readonly service: SemesterWeekConfigsService) {}

  // 创建或更新配置
  @Post()
  upsert(@Body() data: CreateOrUpdateSemesterWeekConfigDto) {
    return this.service.upsert(data);
  }

  // 批量更新（同时设置毕业班和非毕业班周数）
  @Put('batch')
  batchUpdate(@Body() data: BatchUpdateSemesterWeekConfigDto) {
    return this.service.batchUpdate(data);
  }

  // 查询某学期的配置
  @Get()
  findBySemester(@Query('semesterId') semesterId: string) {
    return this.service.findBySemester(semesterId);
  }

  // 查询所有配置
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  // 获取周数（快速接口）
  @Get('week-count')
  async getWeekCount(
    @Query('semesterId') semesterId: string,
    @Query('isGraduating') isGraduating: string,
  ) {
    const weekCount = await this.service.getWeekCount(
      semesterId,
      isGraduating === 'true',
    );
    return { semesterId, isGraduating, weekCount };
  }

  // 删除配置
  @Delete()
  delete(
    @Query('semesterId') semesterId: string,
    @Query('isGraduating') isGraduating: string,
  ) {
    return this.service.delete(semesterId, isGraduating === 'true');
  }
}
