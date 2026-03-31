# 技工院校教务管理系统 - 产品需求文档 (PRD)

> 版本：v1.0.0  
> 日期：2026-03-31  
> 状态：待开发  
> 基于：SPEC.md v0.1.0

---

## 目录

1. [产品概述](#1-产品概述)
2. [功能需求详设](#2-功能需求详设)
   - 2.1 [账号与认证系统](#21-账号与认证系统)
   - 2.2 [基础数据管理](#22-基础数据管理)
   - 2.3 [人才培养计划](#23-人才培养计划)
   - 2.4 [课程管理](#24-课程管理)
   - 2.5 [排课系统](#25-排课系统)
   - 2.6 [授课计划与教案](#26-授课计划与教案)
   - 2.7 [成绩管理](#27-成绩管理)
   - 2.8 [教材管理](#28-教材管理)
   - 2.9 [班级管理](#29-班级管理)
   - 2.10 [请假审批](#210-请假审批)
   - 2.11 [每日签到](#211-每日签到)
   - 2.12 [任务与作业](#212-任务与作业)
   - 2.13 [教师课时统计](#213-教师课时统计)
   - 2.14 [退学处理](#214-退学处理)
3. [非功能需求](#3-非功能需求)
4. [附录](#4-附录)

---

## 1. 产品概述

### 1.1 产品定位

面向**技工院校**的综合性教务管理平台，覆盖从人才培养计划到教案审查的全流程数字化管理。

### 1.2 核心价值

```
┌─────────────────────────────────────────────────────────────┐
│                    教务系统核心价值                           │
├─────────────────────────────────────────────────────────────┤
│  📚 教学计划数字化    │ 人才培养方案、课程标准在线管理        │
│  📅 排课智能化       │ 冲突检测、资源优化、灵活调整          │
│  📝 教案审查闭环     │ 提交→审查→反馈→修改→审批            │
│  📦 教材订购规范     │ 订单汇总、库存管理、发放记录          │
│  ✅ 请假审批流       │ 班级请假→班主任→主任 多级审批          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 目标用户

| 用户 | 说明 | 兼任关系 |
|------|------|---------|
| **学生** | 最基础角色，只拥有学生权限 | 唯一 |
| **教师** | 基础教学角色 | 可兼任班主任或教研组长 |
| **班主任** | 负责班级管理 | 通常由教师兼任 |
| **教研组长** | 负责教研组管理 | 通常由教师兼任 |
| **主任/副主任** | 行政管理 | 可由教师兼任 |
| **班长** | 学生中选出 | 无 |
| **管理员** | 独立账号 | 无 |

### 1.4 权限矩阵

| 功能 | 学生 | 教师 | 班主任 | 教研组长 | 主任 | 班长 | 管理员 |
|------|:----:|:----:|:------:|:--------:|:----:|:----:|:------:|
| 人才培养计划 | 查看 | 查看 | 审核本班 | **制定** | 审批 | - | 全部 |
| 课程安排 | 查看 | 查看 | 查看 | 制定 | 审批 | - | 全部 |
| 排课管理 | 查看 | 查看 | 查看 | 协助 | 全权 | - | 全部 |
| 授课计划 | - | 制定 | 查看本班 | **审核** | 审批 | - | 全部 |
| 教案审查 | - | 提交 | 查看本班 | **审核** | 审批 | - | 全部 |
| 课标撰写 | - | 撰写 | 审核本班 | 审批 | 审批 | - | 全部 |
| 教材订购 | 查看 | 申请 | 汇总本班 | 审核 | 审批 | - | 全部 |
| 成绩管理 | 查期末成绩 | 录入/提交 | 查看 | **审核** | 审批 | - | 全部 |
| 班级管理 | 查看本班/职务 | 查看 | **管理本班** | 查看 | 监督 | **查看请假** | 全部 |
| 每日签到 | ✅签到 | - | 查看统计 | - | 查看全校 | - | 全部 |
| 请假审批 | 申请 | 申请 | **审批本班** | 审批 | 审批 | - | 全部 |
| 退学处理 | - | - | 发起 | - | 审批 | - | 全部 |
| 任务/作业 | 查看/交作业 | 发布任务/作业 | - | - | - | - | 全部 |
| 教师课时统计 | - | 查看本人 | - | 查看本组 | **查看全校/配置系数** | - | 全部 |
| 课表版本/停课 | - | - | - | 协助管理 | **全权管理** | - | 全部 |
| 排课偏好/模板 | - | 设置本人偏好 | - | 协助管理 | **全权管理** | - | 全部 |
| 系统管理 | - | - | - | - | - | - | **全部** |

---

## 2. 功能需求详设

---

### 2.1 账号与认证系统

#### 2.1.1 功能描述

用户通过账号密码或微信登录系统，根据角色权限访问相应功能。

#### 2.1.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-ACC-001 | 作为管理员，我需要创建教师账号，以便教师登录系统 | P0 |
| US-ACC-002 | 作为学生，我可以通过微信登录小程序，以便快捷访问 | P0 |
| US-ACC-003 | 作为用户，我的登录失败5次后账号应被锁定30分钟 | P1 |
| US-ACC-004 | 作为管理员，我可以配置密码策略（长度、复杂度、过期时间）| P1 |

#### 2.1.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-ACC-001 | 管理员可以创建账号并分配角色 | TC-ACC-001 |
| AC-ACC-002 | 账号类型分为：学生、教师、管理员 | TC-ACC-001 |
| AC-ACC-003 | 密码存储使用bcrypt加密 | 单元测试 |
| AC-ACC-004 | 登录失败5次后账号锁定30分钟 | TC-ACC-003 |
| AC-ACC-005 | JWT Token有效期为24小时 | TC-ACC-004 |
| AC-ACC-006 | Token刷新机制正常 | TC-ACC-005 |
| AC-ACC-007 | 登录日志记录IP、时间、设备信息 | TC-ACC-006 |

#### 2.1.4 测试用例

```typescript
describe('账号认证模块', () => {
  test('TC-ACC-001: 教师使用正确账号密码登录成功', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'teacher001', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('teacher');
  });

  test('TC-ACC-002: 密码错误登录失败，返回401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'teacher001', password: 'WrongPassword' });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('密码错误');
  });

  test('TC-ACC-003: 连续5次登录失败后账号被锁定', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login')
        .send({ username: 'lockeduser', password: 'Wrong' });
    }
    const res = await request(app).post('/api/v1/auth/login')
      .send({ username: 'lockeduser', password: 'Wrong' });
    expect(res.status).toBe(423);
  });

  test('TC-ACC-004: 使用有效Token访问受保护接口成功', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'Admin123!' });
    const token = loginRes.body.data.token;
    const res = await request(app).get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('TC-ACC-005: Token过期后访问接口返回401', async () => {
    const res = await request(app).get('/api/v1/users/me')
      .set('Authorization', 'Bearer expired_token');
    expect(res.status).toBe(401);
  });
});
```

---

### 2.2 基础数据管理

#### 2.2.1 功能描述

管理系统中的基础数据：学校、院系，专业、班级、学生、教师、学年学期。

#### 2.2.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-BASE-001 | 作为管理员，我需要维护学校信息 | P0 |
| US-BASE-002 | 作为管理员，我可以创建专业和班级 | P0 |
| US-BASE-003 | 作为管理员，我需要批量导入学生数据（Excel）| P0 |
| US-BASE-004 | 作为管理员，我可以设置学年学期 | P0 |

#### 2.2.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-BASE-001 | 可以创建/编辑/删除学校信息 | TC-BASE-001 |
| AC-BASE-002 | 可以创建/编辑/删除院系 | TC-BASE-002 |
| AC-BASE-003 | 可以创建/编辑/删除专业 | TC-BASE-003 |
| AC-BASE-004 | 可以创建/编辑/删除班级 | TC-BASE-004 |
| AC-BASE-005 | 可以批量导入学生（Excel模板）| TC-BASE-005 |
| AC-BASE-006 | 导入时校验学号唯一性，重复学号提示错误 | TC-BASE-006 |
| AC-BASE-007 | 可以创建/编辑/删除学年学期 | TC-BASE-007 |
| AC-BASE-008 | 班级人数限制可配置（默认40人）| TC-BASE-008 |

#### 2.2.4 测试用例

```typescript
describe('基础数据管理', () => {
  test('TC-BASE-001: 创建学校成功', async () => {
    const res = await request(app).post('/api/v1/schools')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '测试技工学校', code: 'TEST001' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
  });

  test('TC-BASE-002: 学校名称不能为空', async () => {
    const res = await request(app).post('/api/v1/schools')
      .send({ code: 'TEST002' });
    expect(res.status).toBe(400);
  });

  test('TC-BASE-003: Excel导入学生成功', async () => {
    const excel = await generateStudentExcel([
      { studentNumber: '2024001', name: '张三', gender: '男', className: '24级计算机1班' }
    ]);
    const res = await request(app).post('/api/v1/students/import')
      .attach('file', excel, 'students.xlsx');
    expect(res.status).toBe(200);
    expect(res.body.data.successCount).toBe(1);
  });

  test('TC-BASE-004: 重复学号导入失败', async () => {
    const excel = generateStudentExcel([{ studentNumber: 'EXIST001', name: '王五' }]);
    const res = await request(app).post('/api/v1/students/import').attach('file', excel);
    expect(res.body.data.failCount).toBe(1);
    expect(res.body.data.failures[0].reason).toContain('学号已存在');
  });
});
```

---

### 2.3 人才培养计划

#### 2.3.1 功能描述

教研组长制定人才培养方案，主任审批后生效。

#### 2.3.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-TDP-001 | 作为教研组长，我可以制定人才培养计划 | P0 |
| US-TDP-002 | 作为教研组长，我可以添加课程到培养计划 | P0 |
| US-TDP-003 | 作为主任，我可以审批培养计划 | P0 |
| US-TDP-004 | 作为班主任，我可以查看本班学生的培养计划 | P1 |

#### 2.3.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-TDP-001 | 教研组长可以创建培养计划草稿 | TC-TDP-001 |
| AC-TDP-002 | 培养计划包含：专业、年级、课程列表、时间线 | TC-TDP-001 |
| AC-TDP-003 | 教研组长提交后状态变为"待审批" | TC-TDP-002 |
| AC-TDP-004 | 主任审批通过后状态变为"已批准" | TC-TDP-003 |
| AC-TDP-005 | 主任可以驳回并填写意见 | TC-TDP-004 |
| AC-TDP-006 | 驳回后教研组长可修改并重新提交 | TC-TDP-005 |
| AC-TDP-007 | 培养计划有版本记录 | TC-TDP-006 |

#### 2.3.4 测试用例

```typescript
describe('人才培养计划', () => {
  test('TC-TDP-001: 教研组长创建培养计划', async () => {
    const res = await request(app).post('/api/v1/development-plans')
      .set('Authorization', `Bearer ${groupLeaderToken}`)
      .send({
        majorId: 'major_001', grade: 1,
        courses: [{ courseId: 'course_001', semester: 1, credits: 4 }]
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
  });

  test('TC-TDP-002: 提交培养计划需填写完整', async () => {
    const res = await request(app).post('/api/v1/development-plans')
      .send({ majorId: 'major_001', grade: 1 }); // 缺少courses
    expect(res.status).toBe(400);
  });

  test('TC-TDP-003: 主任审批通过', async () => {
    const draft = await request(app).post('/api/v1/development-plans').send({...});
    await request(app).post(`/api/v1/development-plans/${draft.body.data.id}/submit`);
    const res = await request(app).post(`/api/v1/development-plans/${draft.body.data.id}/approve`)
      .set('Authorization', `Bearer ${directorToken}`).send({ comment: '同意' });
    expect(res.body.data.status).toBe('approved');
  });

  test('TC-TDP-004: 主任驳回需填写意见', async () => {
    const res = await request(app).post(`/api/v1/development-plans/${planId}/reject`)
      .send({});
    expect(res.status).toBe(400);
  });
});
```

---

### 2.4 课程管理

#### 2.4.1 功能描述

管理课程库和课程标准（课标）。

#### 2.4.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-CRS-001 | 作为管理员，我可以创建课程 | P0 |
| US-CRS-002 | 作为教师，我可以为课程编写课标 | P1 |
| US-CRS-003 | 作为教研组长，我可以审核课标 | P1 |

#### 2.4.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-CRS-001 | 课程包含：编号、名称、学分、类别、课时 | TC-CRS-001 |
| AC-CRS-002 | 课程类别：公共课/专业基础课/专业课/实践课/选修课 | TC-CRS-001 |
| AC-CRS-003 | 课标包含：教学目标、教学内容、教学方法、考核方式 | TC-CRS-002 |
| AC-CRS-004 | 课标需经教研组长审核、主任审批 | TC-CRS-003 |

#### 2.4.4 测试用例

```typescript
describe('课程管理', () => {
  test('TC-CRS-001: 创建课程成功', async () => {
    const res = await request(app).post('/api/v1/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'JSJ101', name: '计算机基础', credits: 4, category: '专业课', totalHours: 64 });
    expect(res.status).toBe(201);
  });

  test('TC-CRS-002: 课程编号唯一性', async () => {
    await request(app).post('/api/v1/courses').send({code: 'DUP', ...});
    const res = await request(app).post('/api/v1/courses').send({code: 'DUP', ...});
    expect(res.status).toBe(409);
  });

  test('TC-CRS-003: 提交课标需关联课程', async () => {
    const res = await request(app).post('/api/v1/course-standards')
      .send({ teachingObjectives: ['掌握计算机基础知识'] });
    expect(res.status).toBe(400);
  });
});
```

---

### 2.5 排课系统

#### 2.5.1 功能描述

智能排课，支持机房课程、教师时间偏好、课表模板导入。

#### 2.5.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-SCH-001 | 作为教研组长，我可以配置每个班级每门课程的课时（理论/上机）| P0 |
| US-SCH-002 | 作为教师，我可以设置我的时间偏好（不排/优先排）| P0 |
| US-SCH-003 | 作为教研组长，我可以导入课表模板（Excel）| P0 |
| US-SCH-004 | 系统自动检测冲突并标记 | P0 |
| US-SCH-005 | 作为主任，我可以发布课表 | P0 |
| US-SCH-006 | 机房课程必须分配到机房 | P1 |

#### 2.5.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-SCH-001 | 每天8节课（上午4节+下午4节）| 配置测试 |
| AC-SCH-002 | 可按班级+课程设置理论课时和上机课时 | TC-SCH-001 |
| AC-SCH-003 | 教师可设置不排课时间（硬约束）| TC-SCH-002 |
| AC-SCH-004 | 教师可设置优先排课时间（软约束）| TC-SCH-003 |
| AC-SCH-005 | 支持Excel模板导入课表 | TC-SCH-004 |
| AC-SCH-006 | 导入时检测：教室冲突、教师冲突、机房容量不足 | TC-SCH-005 |
| AC-SCH-007 | 上机课必须分配到机房 | TC-SCH-006 |
| AC-SCH-008 | 机房容量（电脑数）>= 学生人数 | TC-SCH-007 |
| AC-SCH-009 | 课表有版本管理 | TC-SCH-008 |
| AC-SCH-010 | 停课需记录原因和补课安排 | TC-SCH-009 |

#### 2.5.4 测试用例

```typescript
describe('排课系统', () => {
  test('TC-SCH-001: 按班级课程配置课时', async () => {
    const res = await request(app).post('/api/v1/course-hours-config')
      .send({ courseId: 'course_001', classId: 'class_001', totalHours: 64, theoryHours: 32, labHours: 32 });
    expect(res.status).toBe(201);
  });

  test('TC-SCH-002: 理论+上机课时应等于总课时', async () => {
    const res = await request(app).post('/api/v1/course-hours-config')
      .send({ courseId: 'course_001', classId: 'class_001', totalHours: 64, theoryHours: 30, labHours: 32 });
    expect(res.status).toBe(400);
  });

  test('TC-SCH-003: 检测教师时间冲突', async () => {
    const res = await request(app).post('/api/v1/schedules/check-conflicts')
      .send({ entries: [{ teacherId: 'teacher_zhang', weekday: 2, periodStart: 3, periodEnd: 4 }] });
    expect(res.body.data.conflicts.some(c => c.type === 'teacher_unavailable')).toBe(true);
  });

  test('TC-SCH-004: 检测机房容量不足', async () => {
    const res = await request(app).post('/api/v1/schedules/check-conflicts')
      .send({ entries: [{ classId: 'class_001', roomId: 'room_001', lessonType: 'lab' }] }); // 50人班，30台电脑
    expect(res.body.data.conflicts.some(c => c.type === 'computer_room_capacity')).toBe(true);
  });

  test('TC-SCH-005: 上机课必须分配机房', async () => {
    const res = await request(app).post('/api/v1/schedules/entries')
      .send({ lessonType: 'lab', roomId: null });
    expect(res.status).toBe(400);
  });
});
```

---

### 2.6 授课计划与教案

#### 2.6.1 功能描述

教师制定授课计划，提交教案，教研组长审核，主任审批。

#### 2.6.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-TP-001 | 作为教师，我可以制定授课计划 | P0 |
| US-TP-002 | 作为教师，我可以提交教案 | P0 |
| US-TP-003 | 作为教研组长，我可以审核教案 | P0 |
| US-TP-004 | 作为主任，我可以审批教案 | P0 |

#### 2.6.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-TP-001 | 授课计划包含：周计划、教学目标、教学内容 | TC-TP-001 |
| AC-TP-002 | 教案包含：课时标题、教学过程、附件 | TC-TP-002 |
| AC-TP-003 | 教案审批流程：提交→教研组长审核→主任审批 | TC-TP-003 |
| AC-TP-004 | 被退回可修改后重新提交 | TC-TP-004 |
| AC-TP-005 | 审批记录可查 | TC-TP-005 |

#### 2.6.4 测试用例

```typescript
describe('授课计划与教案', () => {
  test('TC-TP-001: 教师创建授课计划', async () => {
    const res = await request(app).post('/api/v1/teaching-plans')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ courseId: 'course_001', academicYear: '2024-2025', semester: 1 });
    expect(res.status).toBe(201);
  });

  test('TC-TP-002: 教师提交教案', async () => {
    const res = await request(app).post('/api/v1/lesson-plans')
      .send({ teachingPlanId: 'plan_001', weekNumber: 1, lessonTitle: '第一章概述' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('submitted');
  });

  test('TC-TP-003: 教研组长审核通过', async () => {
    const res = await request(app).post(`/api/v1/lesson-plans/${planId}/review`)
      .set('Authorization', `Bearer ${groupLeaderToken}`)
      .send({ action: 'approve', comment: '同意' });
    expect(res.body.data.reviewedBy).toBeDefined();
  });

  test('TC-TP-004: 主任最终审批', async () => {
    const res = await request(app).post(`/api/v1/lesson-plans/${planId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`);
    expect(res.body.data.status).toBe('approved');
  });
});
```

---

### 2.7 成绩管理

#### 2.7.1 功能描述

教师录入成绩，教研组长审核后发布。

#### 2.7.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-GRA-001 | 作为教师，我可以单条录入学生成绩 | P0 |
| US-GRA-002 | 作为教师，我可以批量导入成绩（Excel）| P0 |
| US-GRA-003 | 作为教研组长，我可以审核成绩 | P0 |
| US-GRA-004 | 作为学生，我可以查询期末成绩 | P0 |

#### 2.7.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-GRA-001 | 成绩 = 平时分×比例 + 期末分×比例（比例可配置）| TC-GRA-001 |
| AC-GRA-002 | 及格线60分 | TC-GRA-002 |
| AC-GRA-003 | 支持单条录入 | TC-GRA-001 |
| AC-GRA-004 | 支持Excel批量导入 | TC-GRA-003 |
| AC-GRA-005 | 导入模板由学校提供 | TC-GRA-003 |
| AC-GRA-006 | 录入后提交审核，状态变为"待审核" | TC-GRA-004 |
| AC-GRA-007 | 教研组长审核通过后状态变为"已发布" | TC-GRA-005 |
| AC-GRA-008 | 学生只能查自己成绩 | TC-GRA-006 |

#### 2.7.4 测试用例

```typescript
describe('成绩管理', () => {
  test('TC-GRA-001: 教师录入单条成绩', async () => {
    const res = await request(app).post('/api/v1/grades')
      .send({ studentId: 'student_001', courseId: 'course_001', usualScore: 85, finalScore: 78 });
    expect(res.status).toBe(201);
    expect(res.body.data.totalScore).toBeDefined();
  });

  test('TC-GRA-002: 成绩计算（平时30%+期末70%）', async () => {
    const res = await request(app).post('/api/v1/grades')
      .send({ usualScore: 90, finalScore: 70 });
    expect(res.body.data.totalScore).toBe(76); // 90*0.3 + 70*0.7 = 76
  });

  test('TC-GRA-003: Excel批量导入成绩', async () => {
    const excel = generateGradeExcel([{ studentNumber: '2024001', usualScore: 85, finalScore: 78 }]);
    const res = await request(app).post('/api/v1/grades/import').attach('file', excel);
    expect(res.status).toBe(200);
    expect(res.body.data.successCount).toBe(1);
  });

  test('TC-GRA-004: 成绩范围0-100', async () => {
    const excel = generateGradeExcel([{ studentNumber: '2024003', usualScore: 150 }]);
    const res = await request(app).post('/api/v1/grades/import').attach('file', excel);
    expect(res.body.data.failCount).toBe(1);
  });

  test('TC-GRA-005: 学生只能查自己成绩', async () => {
    const res = await request(app).get('/api/v1/grades/student/other_id')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

### 2.8 教材管理

#### 2.8.1 功能描述

教材库维护、订购申请、审批、入库发放。

#### 2.8.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-TXB-001 | 作为管理员，我可以维护教材库 | P0 |
| US-TXB-002 | 作为教师，我可以申请教材订购 | P0 |
| US-TXB-003 | 作为教研组长，我可以审核订购申请 | P1 |
| US-TXB-004 | 作为管理员，我可以确认入库 | P1 |

#### 2.8.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-TXB-001 | 教材包含：ISBN、书名、作者、出版社、单价 | TC-TXB-001 |
| AC-TXB-002 | 订购申请包含：学年学期、教材列表、数量 | TC-TXB-002 |
| AC-TXB-003 | 教研组长审核、主任审批 | TC-TXB-003 |
| AC-TXB-004 | 入库后更新库存 | TC-TXB-004 |

#### 2.8.4 测试用例

```typescript
describe('教材管理', () => {
  test('TC-TXB-001: 创建教材', async () => {
    const res = await request(app).post('/api/v1/textbooks')
      .send({ isbn: '978-7-111-00001-9', title: '计算机基础', author: '张三', publisher: '清华出版社', price: 35.00 });
    expect(res.status).toBe(201);
  });

  test('TC-TXB-002: 教师提交订购申请', async () => {
    const res = await request(app).post('/api/v1/textbook-orders')
      .send({ academicYear: '2024-2025', semester: 1, items: [{ textbookId: 'textbook_001', quantity: 50 }] });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('submitted');
  });

  test('TC-TXB-003: 教研组长审核', async () => {
    const res = await request(app).post(`/api/v1/textbook-orders/${orderId}/review`)
      .set('Authorization', `Bearer ${groupLeaderToken}`);
    expect(res.body.data.reviewedBy).toBeDefined();
  });
});
```

---

### 2.9 班级管理

#### 2.9.1 功能描述

班级信息管理、学生职务设定。

#### 2.9.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-CLS-001 | 作为管理员，我可以创建班级 | P0 |
| US-CLS-002 | 作为班主任，我可以分配学生职务 | P0 |
| US-CLS-003 | 作为管理员，我可以更换班主任 | P1 |

#### 2.9.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-CLS-001 | 班级包含：名称、年级、专业、班主任 | TC-CLS-001 |
| AC-CLS-002 | 职务包含：班长、学习委员、体育委员等（可配置）| TC-CLS-002 |
| AC-CLS-003 | 班主任可分配/撤销学生职务 | TC-CLS-003 |
| AC-CLS-004 | 班主任可更换，需记录交接历史 | TC-CLS-004 |

#### 2.9.4 测试用例

```typescript
describe('班级管理', () => {
  test('TC-CLS-001: 创建班级', async () => {
    const res = await request(app).post('/api/v1/classes')
      .send({ name: '24级计算机1班', grade: 1, majorId: 'major_001' });
    expect(res.status).toBe(201);
  });

  test('TC-CLS-002: 分配学生职务', async () => {
    const res = await request(app).post('/api/v1/student-positions')
      .send({ studentId: 'student_001', classId: 'class_001', positionId: 'monitor' });
    expect(res.status).toBe(201);
  });

  test('TC-CLS-003: 更换班主任', async () => {
    const res = await request(app).put('/api/v1/classes/${classId}/teacher')
      .send({ teacherId: 'teacher_002' });
    expect(res.body.data.teacherId).toBe('teacher_002');
    expect(res.body.data.teacherHistory.length).toBeGreaterThan(1);
  });
});
```

---

### 2.10 请假审批

#### 2.10.1 功能描述

学生发起请假，班主任审批，主任最终审批。

#### 2.10.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-LEV-001 | 作为学生，我可以发起请假申请 | P0 |
| US-LEV-002 | 作为班主任，我可以审批本班学生请假 | P0 |
| US-LEV-003 | 作为主任，我可以最终审批 | P0 |
| US-LEV-004 | 班长可以查看班级学生请假情况 | P1 |

#### 2.10.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-LEV-001 | 请假类型：事假、病假、其他 | TC-LEV-001 |
| AC-LEV-002 | 请假需填写：开始日期、结束日期、原因 | TC-LEV-001 |
| AC-LEV-003 | 审批流程：学生→班主任→主任 | TC-LEV-002 |
| AC-LEV-004 | 班主任可批准/拒绝 | TC-LEV-003 |
| AC-LEV-005 | 主任可批准/拒绝 | TC-LEV-004 |
| AC-LEV-006 | 拒绝需填写意见 | TC-LEV-005 |
| AC-LEV-007 | 班长可查看班级请假列表（不能审批）| TC-LEV-006 |

#### 2.10.4 测试用例

```typescript
describe('请假审批', () => {
  test('TC-LEV-001: 学生提交请假', async () => {
    const res = await request(app).post('/api/v1/leaves')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ type: 'personal', startDate: '2024-10-15', endDate: '2024-10-16', reason: '家中有事' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.currentStep).toBe(1);
  });

  test('TC-LEV-002: 班主任审批通过', async () => {
    const res = await request(app).post(`/api/v1/leaves/${leaveId}/approve`)
      .set('Authorization', `Bearer ${classTeacherToken}`).send({ comment: '同意' });
    expect(res.body.data.currentStep).toBe(2);
  });

  test('TC-LEV-003: 主任最终审批', async () => {
    const res = await request(app).post(`/api/v1/leaves/${leaveId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`);
    expect(res.body.data.status).toBe('approved');
  });

  test('TC-LEV-004: 拒绝必须填写意见', async () => {
    const res = await request(app).post(`/api/v1/leaves/${leaveId}/reject`).send({});
    expect(res.status).toBe  expect(res.status).toBe(400);
  });

  test('TC-LEV-005: 非本班班主任不能审批', async () => {
    const res = await request(app).post(`/api/v1/leaves/${otherClassLeaveId}/approve`)
      .set('Authorization', `Bearer ${wrongTeacherToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

### 2.11 每日签到

#### 2.11.1 功能描述

学生每天早上签到，记录GPS位置。

#### 2.11.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-CHK-001 | 作为学生，我可以一键签到 | P0 |
| US-CHK-002 | 系统自动获取GPS位置 | P1 |
| US-CHK-003 | 作为班主任，我可以查看班级签到统计 | P0 |

#### 2.11.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-CHK-001 | 学生点击签到，系统记录签到时间和GPS | TC-CHK-001 |
| AC-CHK-002 | 签到后立即显示成功/失败反馈 | TC-CHK-001 |
| AC-CHK-003 | 系统根据设定时间判断是否迟到 | TC-CHK-002 |
| AC-CHK-004 | 班主任可查看班级签到率 | TC-CHK-003 |
| AC-CHK-005 | 迟到记录计入考勤统计 | TC-CHK-002 |
| AC-CHK-006 | 出勤率 = (实到天数 / 应到天数) × 100% | TC-CHK-003 |

#### 2.11.4 测试用例

```typescript
describe('每日签到', () => {
  test('TC-CHK-001: 学生签到成功', async () => {
    const res = await request(app).post('/api/v1/check-ins')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ location: { latitude: 30.5728, longitude: 114.2526 } });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('checked_in');
  });

  test('TC-CHK-002: 迟到判断', async () => {
    const res = await request(app).post('/api/v1/check-ins')
      .send({ checkInTime: '2024-10-15 08:05:00' }); // 规定8:00
    expect(res.body.data.status).toBe('late');
    expect(res.body.data.isLate).toBe(true);
  });

  test('TC-CHK-003: 班主任查看班级出勤率', async () => {
    const res = await request(app).get('/api/v1/check-ins/class/${classId}/stats')
      .set('Authorization', `Bearer ${classTeacherToken}`);
    expect(res.body.data.attendanceRate).toBeDefined();
  });
});
```

---

### 2.12 任务与作业

#### 2.12.1 功能描述

教师发布任务，学生提交，系统追踪交稿情况。

#### 2.12.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-TSK-001 | 作为教师，我可以发布任务/作业 | P0 |
| US-TSK-002 | 作为学生，我可以查看并提交作业 | P0 |
| US-TSK-003 | 作为教师，我可以查看交稿名单（已交/未交）| P0 |
| US-TSK-004 | 作为教师，我可以对作业打分 | P1 |

#### 2.12.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-TSK-001 | 任务包含：标题、描述、截止时间、附件 | TC-TSK-001 |
| AC-TSK-002 | 任务可按课程或班级发布 | TC-TSK-001 |
| AC-TSK-003 | 学生可在截止时间前提交 | TC-TSK-002 |
| AC-TSK-004 | 截止时间后提交标记为"迟到" | TC-TSK-003 |
| AC-TSK-005 | 教师可查看：已交/未交/迟到名单 | TC-TSK-004 |
| AC-TSK-006 | 教师可对待交作业学生发送提醒 | TC-TSK-005 |
| AC-TSK-007 | 教师可对作业打分和填写反馈 | TC-TSK-006 |

#### 2.12.4 测试用例

```typescript
describe('任务与作业', () => {
  test('TC-TSK-001: 教师发布任务', async () => {
    const res = await request(app).post('/api/v1/tasks')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: '第三章作业', description: '完成课后习题1-10', courseId: 'course_001', deadline: '2024-10-20 23:59:59' });
    expect(res.status).toBe(201);
  });

  test('TC-TSK-002: 学生提交作业', async () => {
    const res = await request(app).post(`/api/v1/tasks/${taskId}/submissions`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ content: '我的作业答案...' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('submitted');
  });

  test('TC-TSK-003: 截止时间后提交标记迟到', async () => {
    const res = await request(app).post(`/api/v1/tasks/${taskId}/submissions`)
      .send({ content: '迟交的作业', submittedAt: '2024-10-21 00:05:00' });
    expect(res.body.data.status).toBe('late');
  });

  test('TC-TSK-004: 教师查看交稿情况', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}/submission-status`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.body.data.totalCount).toBeDefined();
    expect(res.body.data.submittedCount).toBeDefined();
  });
});
```

---

### 2.13 教师课时统计

#### 2.13.1 功能描述

根据课时系数自动计算教师工作量。

#### 2.13.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-HRS-001 | 作为主任，我可以配置重复课时系数 | P0 |
| US-HRS-002 | 作为主任，我可以配置班级人数系数 | P0 |
| US-HRS-003 | 系统自动计算教师课时 | P0 |
| US-HRS-004 | 作为教师，我可以查看本人的课时明细 | P0 |

#### 2.13.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-HRS-001 | 重复课时系数：人数最多的班级=1.0，其他按配置 | TC-HRS-001 |
| AC-HRS-002 | 班级人数系数由管理员配置 | TC-HRS-002 |
| AC-HRS-003 | 最终课时 = 原始课时 × 重复系数 × 人数系数 | TC-HRS-003 |
| AC-HRS-004 | 停课课时需从总课时中扣除 | TC-HRS-004 |
| AC-HRS-005 | 课时计算有详细明细可查 | TC-HRS-005 |
| AC-HRS-006 | 教师只能查看本人课时 | TC-HRS-006 |

#### 2.13.4 测试用例

```typescript
describe('教师课时统计', () => {
  test('TC-HRS-001: 重复课时系数计算', async () => {
    // 张老师教3个班语文，人数分别为45/38/42
    const calc = await request(app).post('/api/v1/teaching-hours/calculate')
      .send({ teacherId: 'teacher_zhang', semester: 1 });
    const class38 = calc.body.data.details.find(d => d.className.includes('38人'));
    expect(class38.duplicateCoefficient).toBe(0.9); // 第2名
    expect(class38.duplicateRank).toBe(2);
  });

  test('TC-HRS-002: 班级人数系数计算', async () => {
    const calc = await request(app).post('/api/v1/teaching-hours/calculate')
      .send({ teacherId: 'teacher_zhang', semester: 1 });
    const class45 = calc.body.data.details.find(d => d.className.includes('45人'));
    expect(class45.classSizeCoefficient).toBe(1.15); // 41-50人区间
  });

  test('TC-HRS-003: 停课扣减', async () => {
    const calc = await request(app).post('/api/v1/teaching-hours/calculate')
      .send({ teacherId: 'teacher_zhang', semester: 1 });
    expect(calc.body.data.suspensionDeductions).toBeDefined();
  });

  test('TC-HRS-004: 教师只能查看本人课时', async () => {
    const res = await request(app).get('/api/v1/teaching-hours/teacher/other_id')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  });
});
```

---

### 2.14 退学处理

#### 2.14.1 功能描述

班主任发起退学申请，主任审批。

#### 2.14.2 用户故事

| ID | 用户故事 | 优先级 |
|----|---------|--------|
| US-WTD-001 | 作为班主任，我可以发起退学申请 | P0 |
| US-WTD-002 | 退学表格自动预填学生信息 | P0 |
| US-WTD-003 | 作为主任，我可以审批退学 | P0 |

#### 2.14.3 验收标准

| ID | 验收条件 | 测试用例 |
|----|---------|---------|
| AC-WTD-001 | 班主任可以发起退学申请 | TC-WTD-001 |
| AC-WTD-002 | 退学表格自动预填学生信息（姓名、学号、班级等）| TC-WTD-002 |
| AC-WTD-003 | 主任审批后状态变为"已批准" | TC-WTD-003 |

#### 2.14.4 测试用例

```typescript
describe('退学处理', () => {
  test('TC-WTD-001: 班主任发起退学申请', async () => {
    const res = await request(app).post('/api/v1/withdrawals')
      .set('Authorization', `Bearer ${classTeacherToken}`)
      .send({ studentId: 'student_001', reason: '学生主动申请退学', withdrawalDate: '2024-10-15' });
    expect(res.status).toBe(201);
  });

  test('TC-WTD-002: 退学表格自动预填学生信息', async () => {
    const res = await request(app).get(`/api/v1/withdrawals/${withdrawalId}/form-data`)
      .set('Authorization', `Bearer ${classTeacherToken}`);
    expect(res.body.data.studentName).toBeDefined();
    expect(res.body.data.studentNumber).toBeDefined();
    expect(res.body.data.className).toBeDefined();
  });

  test('TC-WTD-003: 主任审批通过', async () => {
    const res = await request(app).post(`/api/v1/withdrawals/${withdrawalId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`);
    expect(res.body.data.status).toBe('approved');
  });
});
```

---

## 3. 非功能需求

### 3.1 性能要求

| 指标 | 要求 |
|------|------|
| API响应时间 | < 200ms |
| 页面加载时间 | < 1s |
| 同时在线用户 | 500+ |
| 数据库查询 | < 50ms |

### 3.2 安全要求

| 需求 | 说明 |
|------|------|
| 密码加密 | bcrypt |
| SQL注入防护 | 参数化查询 |
| XSS防护 | 输入过滤 |
| CSRF防护 | Token验证 |
| 数据传输 | HTTPS |

### 3.3 兼容性

| 平台 | 版本 |
|------|------|
| 微信小程序 | 最新版 |
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 4. 附录

### 4.1 术语表

| 术语 | 说明 |
|------|------|
| 技工院校 | 实施技工教育的职业院校 |
| 培养方案 | 专业人才培养的总体规划 |
| 课标 | 课程标准 |
| 大节 | 连续的2节课 |
| 上机课 | 需要在机房上的实践课 |

---

*文档生成时间：2026-03-31*
*基于：SPEC.md v0.1.0 + gstack 方法论*
