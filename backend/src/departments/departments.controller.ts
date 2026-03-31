import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() data: { schoolId: string; name: string; code: string }) {
    return this.departmentsService.create(data);
  }

  @Get()
  findAll(@Query('schoolId') schoolId?: string) {
    return this.departmentsService.findAll(schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; code?: string }) {
    return this.departmentsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
