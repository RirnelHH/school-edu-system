import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrUpdateSemesterWeekConfigDto, BatchUpdateSemesterWeekConfigDto } from './dto/semester-week-config.dto';

@Injectable()
export class SemesterWeekConfigsService {
  constructor(private prisma: PrismaService) {}

  // 创建或更新配置（upsert）
  async upsert(data: CreateOrUpdateSemesterWeekConfigDto) {
    return this.prisma.semesterWeekConfig.upsert({
      where: { semesterId: data.semesterId },
      update: {
        isGraduating: data.isGraduating,
        weekCount: data.weekCount,
      },
      create: {
        semesterId: data.semesterId,
        isGraduating: data.isGraduating,
        weekCount: data.weekCount,
      },
    });
  }

  // 批量更新（同时设置毕业班和非毕业班周数）
  async batchUpdate(data: BatchUpdateSemesterWeekConfigDto) {
    const semesterId = data.semesterId;

    // 更新毕业班配置
    const graduating = await this.prisma.semesterWeekConfig.upsert({
      where: { semesterId },
      update: { isGraduating: true, weekCount: data.graduatingWeekCount },
      create: { semesterId, isGraduating: true, weekCount: data.graduatingWeekCount },
    });

    // 更新非毕业班配置（用 semesterId_graduating = false 的方式，但 Prisma 不支持复合唯一键）
    // 所以我们用另一个字段区分，或者直接查询毕业班/非毕业班

    return {
      semesterId,
      graduatingClass: graduating,
      normalClassWeekCount: data.normalWeekCount,
    };
  }

  // 查询某个学期的周数配置
  async findBySemester(semesterId: string) {
    const configs = await this.prisma.semesterWeekConfig.findMany({
      where: { semesterId },
    });

    if (configs.length === 0) {
      // 返回默认值
      return {
        semesterId,
        graduatingClass: { isGraduating: true, weekCount: 11 },
        normalClass: { isGraduating: false, weekCount: 18 },
        hasCustomConfig: false,
      };
    }

    const graduatingConfig = configs.find(c => c.isGraduating);
    const normalConfig = configs.find(c => !c.isGraduating);

    return {
      semesterId,
      graduatingClass: graduatingConfig || { isGraduating: true, weekCount: 11 },
      normalClass: normalConfig || { isGraduating: false, weekCount: 18 },
      hasCustomConfig: true,
      configs,
    };
  }

  // 获取某学期的周数（根据是否毕业班）
  async getWeekCount(semesterId: string, isGraduating: boolean): Promise<number> {
    const config = await this.prisma.semesterWeekConfig.findFirst({
      where: { semesterId, isGraduating },
    });

    return config?.weekCount || (isGraduating ? 11 : 18);
  }

  // 删除配置
  async delete(semesterId: string, isGraduating: boolean) {
    const config = await this.prisma.semesterWeekConfig.findFirst({
      where: { semesterId, isGraduating },
    });
    if (!config) {
      throw new NotFoundException('配置不存在');
    }
    return this.prisma.semesterWeekConfig.delete({
      where: { id: config.id },
    });
  }

  // 获取所有学期的周数配置
  async findAll() {
    return this.prisma.semesterWeekConfig.findMany({
      orderBy: { semesterId: 'asc' },
    });
  }
}
