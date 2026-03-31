import { Injectable, UnauthorizedException, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const account = await this.prisma.account.findUnique({
      where: { username },
      include: { user: true },
    });

    if (!account) {
      return null;
    }

    // 检查账号是否锁定
    if (account.lockedUntil && account.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (account.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpException(`账号已锁定，请 ${remainingMinutes} 分钟后再试`, 423);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      // 记录失败尝试
      const failedAttempts = account.failedAttempts + 1;
      const updateData: any = { failedAttempts };

      // 5次失败后锁定30分钟
      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        updateData.status = 'LOCKED';
      }

      await this.prisma.account.update({
        where: { id: account.id },
        data: updateData,
      });

      // 记录登录日志
      await this.prisma.loginLog.create({
        data: {
          accountId: account.id,
          success: false,
          failureReason: '密码错误',
        },
      });

      throw new UnauthorizedException('用户名或密码错误');
    }

    // 登录成功，重置失败次数
    if (account.failedAttempts > 0 || account.status === 'LOCKED') {
      await this.prisma.account.update({
        where: { id: account.id },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
          status: 'ACTIVE',
        },
      });
    }

    // 记录登录日志
    await this.prisma.loginLog.create({
      data: {
        accountId: account.id,
        success: true,
      },
    });

    return {
      id: account.id,
      username: account.username,
      accountType: account.accountType,
      user: account.user,
    };
  }

  // 注册新账号
  async register(registerDto: RegisterDto) {
    // 检查用户名是否已存在
    const existingAccount = await this.prisma.account.findUnique({
      where: { username: registerDto.username },
    });
    if (existingAccount) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建用户和账号（事务）
    const result = await this.prisma.$transaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          phone: registerDto.phone,
          wechatOpenid: registerDto.wechatOpenid,
        },
      });

      // 创建账号
      const account = await tx.account.create({
        data: {
          username: registerDto.username,
          password: hashedPassword,
          accountType: registerDto.accountType || 'STUDENT',
          userId: user.id,
        },
      });

      // 如果是教师，创建一个 Teacher 记录
      if (registerDto.accountType === 'TEACHER') {
        await tx.teacher.create({
          data: {
            userId: user.id,
            employeeNumber: registerDto.username, // 用用户名作为工号
          },
        });
      }

      return { user, account };
    });

    return {
      message: '注册成功',
      userId: result.user.id,
      username: result.account.username,
      accountType: result.account.accountType,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      accountType: user.accountType,
      userId: user.user?.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        accountType: user.accountType,
        name: user.user?.name,
      },
    };
  }

  async getProfile(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('用户不存在');
    }

    return account;
  }
}
