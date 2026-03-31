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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, ImportRoomRowDto } from './dto/room.dto';
import { RoomType, RoomStatus } from '@prisma/client';

@Controller('api/v1/rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  // 创建场地
  @Post()
  async create(@Body() data: CreateRoomDto) {
    return this.service.create(data);
  }

  // 查询所有场地
  @Get()
  async findAll(
    @Query('type') type?: RoomType,
    @Query('status') status?: RoomStatus,
  ) {
    return this.service.findAll(type, status);
  }

  // 查询单个场地
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 更新场地
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateRoomDto) {
    return this.service.update(id, data);
  }

  // 删除场地
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // 批量导入场地
  @Post('import')
  async import(@Body() body: { rows: ImportRoomRowDto[] }) {
    return this.service.importFromExcel(body.rows);
  }

  // 获取场地统计
  @Get('stats/summary')
  async getStats() {
    return this.service.getStats();
  }

  // 获取导入模板结构
  @Get('import/template')
  async getImportTemplate() {
    return this.service.getImportTemplate();
  }
}
