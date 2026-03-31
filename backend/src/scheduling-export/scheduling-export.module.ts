import { Module } from '@nestjs/common';
import { SchedulingExportController } from './scheduling-export.controller';
import { SchedulingExportService } from './scheduling-export.service';

@Module({
  controllers: [SchedulingExportController],
  providers: [SchedulingExportService],
  exports: [SchedulingExportService],
})
export class SchedulingExportModule {}
