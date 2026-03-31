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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';

@Controller('api/v1/students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.studentsService.create(data);
  }

  @Get()
  findAll(@Query('classId') classId?: string) {
    return this.studentsService.findAll(classId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.studentsService.findByUserId(userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateStudentDto) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importExcel(@UploadedFile() file: any) {
    // 解析 Excel 文件并导入
    // 这里简化处理，实际应该使用 xlsx 库解析
    return { message: 'Excel import not implemented yet', status: 'pending' };
  }

  @Post('import/json')
  importJson(@Body() data: { students: CreateStudentDto[] }) {
    return this.studentsService.importFromExcel(data.students);
  }
}
