import { Module } from '@nestjs/common';
import { SemesterWeekConfigsController } from './semester-week-configs.controller';
import { SemesterWeekConfigsService } from './semester-week-configs.service';

@Module({
  controllers: [SemesterWeekConfigsController],
  providers: [SemesterWeekConfigsService],
  exports: [SemesterWeekConfigsService],
})
export class SemesterWeekConfigsModule {}
