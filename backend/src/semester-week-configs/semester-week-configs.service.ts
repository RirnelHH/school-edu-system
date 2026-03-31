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
        laborWeekCount: data.laborWeekCount ?? 0,
      },
      create: {
        semesterId: data.semesterId,
        isGraduating: data.isGraduating,
        weekCount: data.weekCount,
        laborWeekCount: data.laborWeekCount ?? 0,
      },
    });
  }

  // 批量更新（同时设置毕业班和非毕业班周数）
  async batchUpdate(data: BatchUpdateSemesterWeekConfigDto) {
    const semesterId = data.semesterId;

    // 更新毕业班配置
    const graduating = await this.prisma.semesterWeekConfig.upsert({
      where: { semesterId },
      update: { isGraduating: true, weekCount: data.graduatingWeekCount, laborWeekCount: data.laborWeekCount ?? 0 },
      create: { semesterId, isGraduating: true, weekCount: data.graduatingWeekCount, laborWeekCount: data.laborWeekCount ?? 0 },
    });

    return {
      semesterId,
      graduatingClass: graduating,
      normalClassWeekCount: data.normalWeekCount,
      laborWeekCount: data.laborWeekCount ?? 0,
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
        graduatingClass: { isGraduating: true, weekCount: 11, laborWeekCount: 0 },
        normalClass: { isGraduating: false, weekCount: 18, laborWeekCount: 0 },
        hasCustomConfig: false,
      };
    }

    const graduatingConfig = configs.find(c => c.isGraduating);
    const normalConfig = configs.find(c => !c.isGraduating);

    return {
      semesterId,
      graduatingClass: graduatingConfig || { isGraduating: true, weekCount: 11, laborWeekCount: 0 },
      normalClass: normalConfig || { isGraduating: false, weekCount: 18, laborWeekCount: 0 },
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

  // 获取某学期的劳动周数
  async getLaborWeekCount(semesterId: string): Promise<number> {
    const config = await this.prisma.semesterWeekConfig.findFirst({
      where: { semesterId },
    });

    return config?.laborWeekCount || 0;
  }

  // 计算有效教学周数（总周数 - 劳动周数）
  async getEffectiveTeachingWeeks(semesterId: string, isGraduating: boolean): Promise<number> {
    const weekCount = await this.getWeekCount(semesterId, isGraduating);
    const laborWeekCount = await this.getLaborWeekCount(semesterId);
    return Math.max(0, weekCount - laborWeekCount);
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
