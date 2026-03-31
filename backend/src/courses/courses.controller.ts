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
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Controller('api/v1/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ========== 课程管理 ==========

  @Post()
  createCourse(@Body() data: CreateCourseDto) {
    return this.coursesService.createCourse(data);
  }

  @Get()
  findAllCourses(@Query('category') category?: string) {
    return this.coursesService.findAllCourses(category);
  }

  @Get(':id')
  findCourse(@Param('id') id: string) {
    return this.coursesService.findCourseById(id);
  }

  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() data: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, data);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  // ========== 课程标准管理 ==========

  @Post('standards')
  createStandard(@Body() body: { courseId: string; content: string }) {
    return this.coursesService.createStandard(body.courseId, body.content);
  }

  @Get('standards/:courseId')
  getStandard(@Param('courseId') courseId: string) {
    return this.coursesService.getStandard(courseId);
  }
}
