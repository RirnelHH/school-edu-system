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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherTemplatesService } from './teacher-templates.service';
import {
  CreateTeacherTemplateDto,
  UpdateTeacherTemplateDto,
  QueryTeacherTemplateDto,
  SubmitTemplateDto,
  ApproveTemplateDto,
  ImportTemplateRowDto,
} from './dto/teacher-template.dto';

interface AuthRequest {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('api/v1/teacher-templates')
@UseGuards(JwtAuthGuard)
export class TeacherTemplatesController {
  constructor(private readonly service: TeacherTemplatesService) {}

  // 创建模板
  @Post()
  async create(
    @Request() req: AuthRequest,
    @Body() data: CreateTeacherTemplateDto,
  ) {
    return this.service.create(req.user.id, data);
  }

  // 查询模板列表
  @Get()
  async findAll(@Query() query: QueryTeacherTemplateDto) {
    return this.service.findAll(query);
  }

  // 查询单个模板详情
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 更新模板
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() data: UpdateTeacherTemplateDto,
  ) {
    return this.service.update(id, req.user.id, data);
  }

  // 提交/撤回模板
  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() body: SubmitTemplateDto) {
    if (body.submit) {
      return this.service.submit(id);
    } else {
      return this.service.withdraw(id);
    }
  }

  // 审批通过
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  // 驳回模板
  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: ApproveTemplateDto) {
    return this.service.reject(id, body.reason || '');
  }

  // 删除草稿
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // 批量导入（Excel数据）
  @Post('import')
  async import(
    @Request() req: AuthRequest,
    @Body()
    body: {
      semesterId: string;
      rows: ImportTemplateRowDto[];
    },
  ) {
    return this.service.importFromExcel(
      req.user.id,
      body.semesterId,
      body.rows,
    );
  }

  // 获取教师课时统计
  @Get('teacher/:teacherId/workload')
  async getTeacherWorkload(
    @Param('teacherId') teacherId: string,
    @Query('semesterId') semesterId: string,
  ) {
    return this.service.getTeacherWorkload(teacherId, semesterId);
  }

  // 获取所有教师课时汇总
  @Get('stats/workload-summary')
  async getAllTeachersWorkload(@Query('semesterId') semesterId: string) {
    return this.service.getAllTeachersWorkload(semesterId);
  }

  // 校验机房承载力
  @Post('check-room-capacity')
  async checkRoomCapacity(
    @Body()
    body: {
      semesterId: string;
      roomType: string;
      practiceHoursNeeded: number;
      studentCount: number;
    },
  ) {
    return this.service.checkRoomCapacity(
      body.semesterId,
      body.roomType as any,
      body.practiceHoursNeeded,
      body.studentCount,
    );
  }
}
