import { Module } from '@nestjs/common';
import { TeachingPlansController } from './teaching-plans.controller';
import { TeachingPlansService } from './teaching-plans.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TeachingPlansController],
  providers: [TeachingPlansService, PrismaService],
  exports: [TeachingPlansService],
})
export class TeachingPlansModule {}
