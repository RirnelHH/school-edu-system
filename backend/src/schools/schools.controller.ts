import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Post()
  create(@Body() data: { name: string; code: string; address?: string; contact?: string }) {
    return this.schoolsService.create(data);
  }

  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; address?: string; contact?: string }) {
    return this.schoolsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.schoolsService.delete(id);
  }
}
