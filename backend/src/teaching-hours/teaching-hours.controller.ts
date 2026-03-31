import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TeachingHoursService } from './teaching-hours.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/teaching-hours')
@UseGuards(JwtAuthGuard)
export class TeachingHoursController {
  constructor(private readonly teachingHoursService: TeachingHoursService) {}

  /**
   * 计算单个教师的课时
   */
  @Post('calculate/:teacherId')
  async calculateTeacherHours(
    @Param('teacherId') teacherId: string,
    @Body() body: { semesterId: string },
  ) {
    const result = await this.teachingHoursService.calculateTeacherHours(teacherId, body.semesterId);
    return { success: true, data: result };
  }

  /**
   * 获取所有教师的课时统计
   */
  @Post('calculate-all')
  async calculateAllTeachersHours(@Body() body: { semesterId: string }) {
    const results = await this.teachingHoursService.calculateAllTeachersHours(body.semesterId);
    return { success: true, data: results };
  }

  /**
   * 获取班级人数系数配置
   */
  @Get('coefficients/class-size')
  async getClassSizeCoefficients() {
    return {
      success: true,
      data: [
        { range: '≤20', coefficient: 0.80 },
        { range: '21-30', coefficient: 0.90 },
        { range: '31-40', coefficient: 1.00 },
        { range: '41-50', coefficient: 1.15 },
        { range: '51-60', coefficient: 1.30 },
        { range: '≥61', coefficient: 1.50 },
      ],
    };
  }

  /**
   * 获取重复课时系数配置
   */
  @Get('coefficients/duplicate')
  async getDuplicateCoefficients() {
    return {
      success: true,
      data: [
        { rank: 1, coefficient: 1.0, description: '同一课程教1个班' },
        { rank: 2, coefficient: 0.9, description: '同一课程教2个班（第2名）' },
        { rank: 3, coefficient: 0.8, description: '同一课程教3个班（第3名）' },
        { rank: 4, coefficient: 0.7, description: '同一课程教4个班（第4名）' },
        { rank: 5, coefficient: 0.6, description: '同一课程教5个班及以上' },
      ],
    };
  }
}
