import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolsModule } from './schools/schools.module';
import { DepartmentsModule } from './departments/departments.module';
import { MajorsModule } from './majors/majors.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { DevelopmentPlansModule } from './development-plans/development-plans.module';
import { TeacherTemplatesModule } from './teacher-templates/teacher-templates.module';
import { RoomsModule } from './rooms/rooms.module';
import { SemesterWeekConfigsModule } from './semester-week-configs/semester-week-configs.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SchedulingExportModule } from './scheduling-export/scheduling-export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    DepartmentsModule,
    MajorsModule,
    ClassesModule,
    StudentsModule,
    CoursesModule,
    DevelopmentPlansModule,
    TeacherTemplatesModule,
    RoomsModule,
    SemesterWeekConfigsModule,
    SchedulingModule,
    SchedulingExportModule,
  ],
})
export class AppModule {}
