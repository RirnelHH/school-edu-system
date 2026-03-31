import { Module } from '@nestjs/common';
import { TeacherTemplatesController } from './teacher-templates.controller';
import { TeacherTemplatesService } from './teacher-templates.service';

@Module({
  controllers: [TeacherTemplatesController],
  providers: [TeacherTemplatesService],
  exports: [TeacherTemplatesService],
})
export class TeacherTemplatesModule {}
