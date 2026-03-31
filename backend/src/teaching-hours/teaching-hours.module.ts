import { Module } from '@nestjs/common';
import { TeachingHoursService } from './teaching-hours.service';
import { TeachingHoursController } from './teaching-hours.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SemesterWeekConfigsModule } from '../semester-week-configs/semester-week-configs.module';

@Module({
  imports: [SemesterWeekConfigsModule],
  controllers: [TeachingHoursController],
  providers: [TeachingHoursService, PrismaService],
  exports: [TeachingHoursService],
})
export class TeachingHoursModule {}
