import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulingExportService } from './scheduling-export.service';
import { Response } from 'express';

@Controller('api/v1/scheduling/export')
@UseGuards(JwtAuthGuard)
export class SchedulingExportController {
  constructor(private readonly service: SchedulingExportService) {}

  @Get('teacher/:teacherId')
  async exportTeacherSchedule(
    @Param('teacherId') teacherId: string,
  ) {
    const { doc, filename } = await this.service.exportTeacherSchedule(teacherId);
    const buffer = await import('docx').then(m => m.Packer.toBuffer(doc));
    return { doc, filename, buffer };
  }

  @Get('class/:classId')
  async exportClassSchedule(
    @Param('classId') classId: string,
  ) {
    const { doc, filename } = await this.service.exportClassSchedule(classId);
    const buffer = await import('docx').then(m => m.Packer.toBuffer(doc));
    return { doc, filename, buffer };
  }
}
