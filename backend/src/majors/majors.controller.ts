import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMajorDto, UpdateMajorDto, QueryMajorDto } from './dto/major.dto';

@Controller('api/v1/majors')
@UseGuards(JwtAuthGuard)
export class MajorsController {
  constructor(private majorsService: MajorsService) {}

  @Post()
  create(@Body() data: CreateMajorDto) {
    return this.majorsService.create(data);
  }

  @Get()
  findAll(@Query() query: QueryMajorDto) {
    return this.majorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateMajorDto) {
    return this.majorsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.majorsService.delete(id);
  }

  @Get('stats/summary')
  getStats(@Query('departmentId') departmentId?: string) {
    return this.majorsService.getStats(departmentId);
  }

  // 判断班级是否为毕业班
  @Get('class/:classId/graduating')
  isGraduating(
    @Param('classId') classId: string,
    @Query('semester') semester: number, // 1 or 2
  ) {
    return this.majorsService.findOne(classId).then(major => {
      const classEntity = major.classes.find(c => c.id === classId);
      if (!classEntity) {
        return { error: '班级不存在' };
      }
      const isGraduating = this.majorsService.isGraduatingClass(
        major.duration,
        classEntity.grade,
        semester,
      );
      return {
        classId,
        className: classEntity.name,
        grade: classEntity.grade,
        majorDuration: major.duration,
        currentSemester: semester,
        isGraduating,
        graduatingGrade: this.majorsService.getGraduatingGrade(major.duration),
      };
    });
  }
}
