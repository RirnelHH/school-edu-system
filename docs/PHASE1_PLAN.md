# Phase 1 开发计划

> 基于 gstack 方法论 + SDD

---

## Phase 1: 基础架构 (2周)

### 目标
搭建可运行的项目骨架，包含认证、基础数据管理、数据库设计。

---

## Week 1: 项目骨架 + 账号认证

### 1.1 项目初始化

```
[ ] 初始化后端项目 (NestJS)
    - 项目结构（模块化）
    - TypeScript 配置
    - 环境变量
    - Docker（单一镜像）

[ ] 初始化前端项目 (Vue3 + Vite)
    - 项目结构
    - TypeScript 配置
    - UI 框架 (Element Plus)
    - 状态管理 (Pinia)
    - 路由 (Vue Router)

[ ] 初始化小程序项目 (Taro + React)
    - 项目结构
    - Taro 配置文件
```

### 1.2 账号系统

```
[ ] 数据模型
    - Account (账号)
    - AccountRole (账号角色关系)
    - RoleAssignment (角色任职)
    - StudentPosition (学生职务)
    - SecurityPolicy (安全策略)
    - LoginLog (登录日志)

[ ] 账号安全
    - 密码加密存储 (bcrypt)
    - 登录失败锁定
    - JWT Token
    - 会话管理
```

### 1.3 认证系统

```
[ ] 后端认证模块
    - 账号登录/登出
    - JWT Token 签发/刷新
    - 角色权限中间件
    - 微信 OAuth（小程序）

[ ] 前端认证
    - 登录页面
    - Token 管理
    - 路由守卫

[ ] 小程序认证
    - 微信 OAuth 登录
    - 手机号绑定
    - 角色切换
```

---

## Week 2: 基础数据 + 数据库

### 2.1 数据库设计

```
[ ] 核心表
    - schools (学校)
    - departments (院系)
    - majors (专业)
    - classes (班级)
    - students (学生)
    - teachers (教师)
    - academic_years (学年学期)
    - accounts (账号)
    - roles (角色定义)
    - account_roles (账号角色)
    - login_logs (登录日志)

[ ] ORM
    - 选择 Prisma（现代化）
    - 迁移脚本
    - 种子数据
```

### 2.2 基础数据管理

```
[ ] 学校/院系/专业 CRUD
[ ] 班级 CRUD
[ ] 学生批量导入 (Excel)
[ ] 教师 CRUD
[ ] 学年学期配置
[ ] 管理员账号初始化
```

### 2.3 基础设施

```
[ ] 日志系统 (Pino)
[ ] 全局异常处理
[ ] API 文档 (Swagger)
[ ] 统一响应格式
```

---

## Phase 1 交付物

```
✅ 后端项目骨架 (NestJS)
✅ 前端项目骨架 (Vue3)
✅ 小程序项目骨架 (Taro)
✅ 账号系统 (Account/SecurityPolicy/LoginLog)
✅ 认证系统 (JWT/微信OAuth)
✅ 用户角色系统
✅ 基础数据 CRUD
✅ 数据库设计与迁移 (Prisma)
✅ Docker 单一镜像部署
```

---

## 技术栈确认

| 模块 | 技术 | 确认 |
|------|------|------|
| 后端框架 | NestJS | ✅ |
| 前端框架 | Vue3 + Vite | ✅ |
| 小程序 | Taro + React | ✅ |
| 数据库 | MySQL 8.0 | ✅ |
| ORM | Prisma | ✅ |
| 认证 | JWT + 微信OAuth | ✅ |
| 容器 | Docker单一镜像 | ✅ |

---

## 下一步

1. **确认以上计划** → 开始代码开发
2. **用 `/ship` 命令** → 逐步交付每个模块

---

## Phase 1 依赖关系

```
项目初始化
    ↓
账号系统设计
    ↓
认证系统实现
    ↓
用户角色系统
    ↓
基础数据CRUD
    ↓
Docker部署配置
```

*计划生成时间：2026-03-31*
*基于：SPEC.md + gstack 方法论*
