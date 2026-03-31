import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClassDto, UpdateClassDto, QueryClassDto } from './dto/class.dto';

@Controller('api/v1/classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Post()
  create(@Body() data: CreateClassDto) {
    return this.classesService.create(data);
  }

  @Get()
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateClassDto) {
    return this.classesService.update(id, data);
  }

  @Post(':id/assign-teacher')
  assignTeacher(@Param('id') id: string, @Body() body: { teacherId: string }) {
    return this.classesService.assignTeacher(id, body.teacherId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.classesService.delete(id);
  }

  // 判断班级是否为毕业班
  @Get(':id/graduating')
  isGraduating(
    @Param('id') id: string,
    @Query('semester') semester: number, // 1 or 2
  ) {
    return this.classesService.isGraduatingClass(id, semester);
  }
}
