import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    username: string;
    password: string;
    name: string;
    accountType: 'STUDENT' | 'TEACHER' | 'ADMIN';
    email?: string;
    phone?: string;
  }) {
    // 检查用户名是否存在
    const existing = await this.prisma.account.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建账号和用户
    const account = await this.prisma.account.create({
      data: {
        username: data.username,
        password: hashedPassword,
        accountType: data.accountType,
        user: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        },
      },
      include: { user: true },
    });

    return account;
  }

  async findById(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('用户不存在');
    }

    return account;
  }

  async findAll() {
    return this.prisma.account.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUser(id: string, data: { name?: string; email?: string; phone?: string }) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!account || !account.user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: account.user.id },
      data,
    });
  }

  async deleteUser(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!account) {
      throw new NotFoundException('用户不存在');
    }

    if (account.user) {
      await this.prisma.user.delete({
        where: { id: account.user.id },
      });
    }

    await this.prisma.account.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }
}
