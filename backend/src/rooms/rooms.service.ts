import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, ImportRoomRowDto } from './dto/room.dto';
import { RoomType, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // 创建场地
  async create(data: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        building: data.building,
        status: 'ACTIVE',
      },
    });
  }

  // 查询所有场地
  async findAll(type?: RoomType, status?: RoomStatus) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.room.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  // 查询单个场地
  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });
    if (!room) {
      throw new NotFoundException('场地不存在');
    }
    return room;
  }

  // 更新场地
  async update(id: string, data: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('场地不存在');
    }
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  // 删除场地
  async delete(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('场地不存在');
    }

    // 检查是否被班级关联
    if (room.type === 'CLASSROOM') {
      const classWithRoom = await this.prisma.class.findFirst({
        where: { roomId: id },
      });
      if (classWithRoom) {
        throw new BadRequestException(
          `场地已被班级「${classWithRoom.name}」关联，无法删除`,
        );
      }
    }

    return this.prisma.room.delete({ where: { id } });
  }

  // 批量导入场地（XLS数据）
  async importFromExcel(
    rows: ImportRoomRowDto[],
  ): Promise<{ row: number; success: boolean; message: string }[]> {
    const results: { row: number; success: boolean; message: string }[] = [];

    // 类型映射
    const typeMap: Record<string, RoomType> = {
      '教室': 'CLASSROOM',
      '机房': 'COMPUTER_LAB',
      '画室': 'ART_STUDIO',
      '网络综合布线室': 'NETWORK_LAB',
      'CLASSROOM': 'CLASSROOM',
      'COMPUTER_LAB': 'COMPUTER_LAB',
      'ART_STUDIO': 'ART_STUDIO',
      'NETWORK_LAB': 'NETWORK_LAB',
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // 转换类型
        const roomType = typeMap[row.type];
        if (!roomType) {
          results.push({
            row: i + 1,
            success: false,
            message: `无效的场地类型: ${row.type}，有效值：教室/机房/画室/网络综合布线室`,
          });
          continue;
        }

        // 检查是否已存在同名场地
        const existing = await this.prisma.room.findFirst({
          where: { name: row.name },
        });
        if (existing) {
          results.push({
            row: i + 1,
            success: false,
            message: `场地已存在: ${row.name}`,
          });
          continue;
        }

        // 创建场地
        await this.prisma.room.create({
          data: {
            name: row.name,
            type: roomType,
            capacity: row.capacity,
            building: row.building,
            status: 'ACTIVE',
          },
        });

        results.push({
          row: i + 1,
          success: true,
          message: `成功导入: ${row.name}（${row.type}，${row.capacity}工位）`,
        });
      } catch (error) {
        results.push({
          row: i + 1,
          success: false,
          message: `导入失败: ${error.message}`,
        });
      }
    }

    return results;
  }

  // 获取场地统计
  async getStats() {
    const rooms = await this.prisma.room.findMany();

    const stats = {
      total: rooms.length,
      byType: {
        CLASSROOM: 0,
        COMPUTER_LAB: 0,
        ART_STUDIO: 0,
        NETWORK_LAB: 0,
      } as Record<RoomType, number>,
      totalCapacity: 0,
      byTypeCapacity: {
        CLASSROOM: 0,
        COMPUTER_LAB: 0,
        ART_STUDIO: 0,
        NETWORK_LAB: 0,
      } as Record<RoomType, number>,
    };

    for (const room of rooms) {
      stats.byType[room.type]++;
      stats.totalCapacity += room.capacity;
      stats.byTypeCapacity[room.type] += room.capacity;
    }

    return stats;
  }

  // XLS模板导出结构（用于前端生成模板）
  getImportTemplate() {
    return {
      headers: ['name', 'type', 'capacity', 'building'],
      headerNames: ['场地名称', '场地类型', '容量/工位数', '楼栋'],
      typeOptions: ['教室', '机房', '画室', '网络综合布线室'],
      example: [
        { name: 'G606', type: '机房', capacity: 60, building: '实训楼3楼' },
        { name: '画室1', type: '画室', capacity: 30, building: '艺术楼2楼' },
        { name: '网络综合布线室', type: '网络综合布线室', capacity: 40, building: '实训楼4楼' },
      ],
    };
  }
}
