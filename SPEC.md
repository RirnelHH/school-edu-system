# 技工院校教务管理系统 - 规格说明书 (SPEC.md)

> 版本：v0.1.0  
> 日期：2026-03-30  
> 方法论：SDD (Spec-Driven Development) + gstack

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

### 1.3 用户角色与权限矩阵

### 1.3.1 角色定义

| 角色 | 说明 | 兼任关系 |
|------|------|---------|
| **学生** | 最基础角色，只拥有学生权限 | 唯一 |
| **教师** | 基础教学角色 | 可兼任班主任或教研组长 |
| **班主任** | 负责班级管理 | 通常由教师兼任 |
| **教研组长** | 负责教研组管理 | 通常由教师兼任 |
| **主任/副主任** | 行政管理 | 可由教师兼任 |

### 1.3.2 权限矩阵

| 功能 | 学生 | 教师 | 班主任 | 教研组长 | 主任 | 班长 | 管理员 |
|------|:----:|:----:|:------:|:--------:|:----:|:----:|:------:|
| **人才培养计划** | 查看 | 查看 | 审核本班 | **制定** | 审批 | - | 全部 |
| **课程安排** | 查看 | 查看 | 查看 | 制定 | 审批 | - | 全部 |
| **排课管理** | 查看 | 查看 | 查看 | 协助 | 全权 | - | 全部 |
| **授课计划** | - | 制定 | 查看本班 | **审核** | 审批 | - | 全部 |
| **教案审查** | - | 提交 | 查看本班 | **审核** | 审批 | - | 全部 |
| **课标撰写** | - | 撰写 | 审核本班 | 审批 | 审批 | - | 全部 |
| **教材订购** | 查看 | 申请 | 汇总本班 | 审核 | 审批 | - | 全部 |
| **成绩管理** | 查期末成绩 | 录入/提交 | 查看 | **审核** | 审批 | - | 全部 |
| **班级管理** | 查看本班/职务 | 查看 | **管理本班** | 查看 | 监督 | **查看请假** | 全部 |
| **每日签到** | ✅签到 | - | 查看统计 | - | 查看全校 | - | 全部 |
| **请假审批** | 申请 | 申请 | **审批本班** | 审批 | 审批 | - | 全部 |
| **退学处理** | - | - | 发起 | - | 审批 | - | 全部 |
| **任务/作业** | 查看/交作业 | 发布任务/作业 | - | - | - | - | 全部 |
| **教师课时统计** | - | 查看本人 | - | 查看本组 | **查看全校/配置系数** | - | 全部 |
| **课表版本/停课** | - | - | - | 协助管理 | **全权管理** | - | 全部 |
| **排课偏好/模板** | - | 设置本人偏好 | - | 协助管理 | **全权管理** | - | 全部 |
| **系统管理** | - | - | - | - | - | - | **全部** |

**管理员说明**：
- 独立账号，不兼任其他角色
- 拥有系统全部权限
- 负责系统基础数据维护（职务设定、用户管理等）

---

## 2. 功能模块详设

### 2.1 模块总览

```
school-edu-system
├── 🏫 基础设置
│   ├── 学校信息
│   ├── 院系/专业/班级
│   ├── 学年/学期
│   └── 用户与角色
│
├── 📋 人才培养计划
│   ├── 计划制定
│   ├── 计划执行跟踪
│   └── 计划变更记录
│
├── 📚 课程管理
│   ├── 课程库
│   ├── 课程标准(课标)
│   └── 每学期课程安排
│
├── 👨‍🏫 师资管理
│   ├── 教师档案
│   ├── 教师资质
│   └── 师资分配
│
├── 📅 排课系统
│   ├── 排课规则
│   ├── 课时配置（理论/上机比例，按班级课程设置）
│   ├── 教师时间偏好（不排/优先排时间）
│   ├── 机房管理
│   ├── 课表模板导入（Excel）
│   ├── 智能排课
│   ├── 冲突检测（教室/机房/教师偏好）
│   └── 课表查询/调整
│
├── 📝 授课计划与教案
│   ├── 授课计划制定
│   ├── 教案提交
│   ├── 教案审查流程
│   └── 审查历史
│
├── 📊 成绩管理
│   ├── 成绩比例配置
│   ├── 成绩录入（单条/批量导入）
│   ├── 成绩审核（教研组长）
│   ├── 成绩发布与查询
│   └── 成绩修改审计
│
├── 📦 教材管理
│   ├── 教材库
│   ├── 订购申请
│   ├── 订单汇总
│   └── 入库/发放
│
├── 🏫 班级管理
│   ├── 班级信息
│   ├── 学生管理（批量录入）
│   ├── 学生职务设定（班长/学习委员/体育委员等）
│   ├── 班主任分配/更换
│   ├── 每日签到（定位）
│   ├── 请假审批流
│   ├── 考勤统计（迟到/出勤率）
│   └── 退学处理（DOCX表格生成）
│
├── 📝 任务与作业（教师发布/学生提交）
│   ├── 任务发布（课程/班级/截止时间）
│   ├── 学生提交作业
│   ├── 交稿状态追踪（已交/未交名单）
│   └── 作业打分/反馈
│
├── 📊 统计分析
│   ├── 教学进度
│   ├── 教师课时统计
│   │   ├── 课时系数配置（重复课时系数/班级人数系数）
│   │   ├── 课表版本管理
│   │   ├── 停课记录
│   │   └── 课时计算与查询
│   └── 报表导出
│
└── 📱 小程序 (四角色合一 + 班长)
    ├── 统一登录 / 角色切换
    ├── 【学生】课表 / 成绩 / 请假 / 教材 / 签到 / 📝作业
    ├── 【教师】课表 / 教案提交 / 请假 / 📝发布作业/任务
    ├── 【班主任】+ 班级管理 / 请假审批 / 学生列表 / 考勤统计 / 职务设定
    ├── 【班长】+ 班级请假查看
    ├── 【教研组长】+ 人才培养方案 / 教研管理 / 教案审批 / 教材审核
    └── 【主任】+ 全局审批 / 统计分析 / 系统管理
```

### 2.2 核心功能详设

---

#### 2.2.1 人才培养计划

**功能描述**：管理每个学生的在校培养路径

```
输入：学生ID、学制时长、专业方向
处理：关联课程体系、生成培养时间线
输出：个性化人才培养计划表
```

**数据模型**：

```typescript
interface TalentDevelopmentPlan {
  id: string;
  studentId: string;           // 学生ID
  majorId: string;            // 专业ID
  grade: number;               // 年级 (1, 2, 3)
  status: 'draft' | 'pending' | 'approved';
  startYear: string;           // 入学年份 "2024"
  expectedGraduationYear: string;
  
  courses: PlannedCourse[];    // 计划修读课程
  milestones: Milestone[];     // 关键节点（实习、毕业设计等）
  
  createdBy: string;           // 制定教师
  approvedBy?: string;         // 审批人
  approvedAt?: Date;
  
  versions: PlanVersion[];     // 版本变更历史
}

interface PlannedCourse {
  courseId: string;
  courseName: string;
  credits: number;
  semester: number;            // 第几学期
  category: '公共课' | '专业基础课' | '专业课' | '实践课' | '选修课';
  status: 'planned' | 'in-progress' | 'completed' | 'failed';
}

interface Milestone {
  name: string;               // "第三学期实习"
  type: 'internship' | 'project' | 'exam' | 'graduation';
  semester: number;
  deadline?: Date;
  status: 'pending' | 'completed';
}
```

**操作流程**：

```
教研组长制定 → 主任审批
    ↓              ↓
  修改草稿     通过/打回
    ↓              ↓
  重新提交 ←———— 审批意见
```

---

#### 2.2.2 课程管理与课标

**课程库**：

```typescript
interface Course {
  id: string;
  code: string;                // 课程代码 "JSJ-101"
  name: string;               // "网页设计与开发"
  credits: number;             // 学分 4.0
  category: CourseCategory;
  hoursPerWeek: number;       // 周课时
  totalHours: number;         // 总课时
  semester: number;            // 建议学期
  
  // 课标相关
  courseStandard?: CourseStandard;
  
  applicableMajors: string[];  // 适用专业列表
  prerequisiteCourses: string[]; // 先修课程
  
  status: 'active' | 'archived';
}
```

**课标（课程标准）**：

```typescript
interface CourseStandard {
  id: string;
  courseId: string;
  
  // 课程基本信息
  version: string;             // "v1.0"
  academicYear: string;        // "2024-2025"
  semester: number;            // 1 或 2
  
  // 课标内容
  teachingObjectives: string[];  // 教学目标
  teachingContent: string[];    // 教学内容
  teachingMethods: string[];     // 教学方法
  assessments: Assessment[];      // 考核方式
  
  // 教材信息
  textbook?: TextbookReference;
  
  // 撰写与审批
  writtenBy?: string;          // 撰写教师
  submittedAt?: Date;
  reviewedBy?: string;         // 教研组长
  reviewedAt?: Date;
  approvedBy?: string;         // 主任
  approvedAt?: Date;
  
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  
  // 历史版本
  previousVersions: string[];  // 旧版ID列表
}
```

---

#### 2.2.3 排课系统

**机房管理**：

```typescript
interface ComputerRoom {
  id: string;
  
  // 基本信息
  name: string;              // "机房A" / "计算机房1" / "实训室1"
  code: string;               // "JIFANG-01"
  building?: string;          // 所在楼栋，如 "教学楼A栋"
  floor?: number;             // 楼层
  
  // 资源配置
  totalComputers: number;     // 电脑数量
  totalSeats: number;        // 总座位数（可用作教室时）
  
  // 设备情况
  equipment: string[];        // ["投影仪", "空调", "白板"]
  
  // 可用状态
  status: 'available' | 'maintenance' | 'retired';
  
  // 开放时间（可选）
  availableHours?: {
    weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    periodStart: number;      // 开放节次开始
    periodEnd: number;        // 开放节次结束
  }[];
  
  remarks?: string;           // 备注
}

interface RoomBooking {
  id: string;
  roomId: string;
  
  // 使用信息
  courseId?: string;         // 关联课程（排课时填写）
  teacherId?: string;
  classId?: string;
  
  // 使用时间
  date: string;              // 日期 "2024-10-15"
  periodStart: number;       // 节次开始
  periodEnd: number;         // 节次结束
  
  // 状态
  status: 'reserved' | 'in_use' | 'available';
  
  // 用途
  purpose: string;           // "正常排课" / "机房预约" / "考试" / "维护"
  
  createdBy: string;
  createdAt: Date;
}
```

**排课核心算法**：

```typescript
// ============================================
// 课时配置（按班级+课程单独设置）
// ============================================
interface CourseHoursConfig {
  id: string;
  
  // 关联信息
  courseId: string;
  classId: string;           // 精确到班级
  academicYear: string;
  semester: number;
  
  // 课时分配
  totalHours: number;        // 总课时（如：64课时）
  theoryHours: number;       // 理论课时（如：32课时）
  labHours: number;         // 上机课时（如：32课时）← 机房课
  
  // 上机安排偏好（可选）
  labPreference?: {
    preferredWeekdays?: (1|2|3|4|5|6|7)[];  // 优先哪些天上机
    preferredPeriods?: number[];              // 优先哪些节次
  };
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 教师时间偏好
// ============================================
interface TeacherTimePreference {
  id: string;
  teacherId: string;
  academicYear: string;
  semester: number;
  
  // 不排课时间（硬约束，系统必须遵守）
  unavailableSlots: {
    weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    periodStart: number;
    periodEnd: number;
    reason?: string;         // "参加教研活动" / "有事"
  }[];
  
  // 优先排课时间（软约束，系统尽量满足）
  preferredSlots: {
    weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    periodStart: number;
    periodEnd: number;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  remarks?: string;
  updatedAt: Date;
}

// ============================================
// 课表模板导入
// ============================================
interface ScheduleTemplate {
  id: string;
  
  name: string;              // 模板名称
  academicYear: string;
  semester: number;
  
  // 模板创建者
  createdBy: string;
  createdAt: Date;
  
  // 模板状态
  status: 'draft' | 'published' | 'archived';
  
  // 模板数据
  entries: ScheduleTemplateEntry[];
}

interface ScheduleTemplateEntry {
  // 固定信息（导入时匹配）
  courseName: string;        // 课程名称（用于匹配系统课程）
  className: string;        // 班级名称（用于匹配系统班级）
  teacherName: string;       // 教师姓名（用于匹配系统教师）
  
  // 课表安排
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  periodStart: number;      // 第几节开始
  periodEnd: number;        // 第几节结束
  roomName?: string;       // 教室/机房名称（可选）
  
  // 上机标记
  isLab: boolean;           // 是否上机课
  
  // 周次安排
  weekStart?: number;        // 从第几周开始（可选，默认1）
  weekEnd?: number;         // 到第几周结束（可选，默认16）
}

interface ScheduleTemplateImport {
  // 导入配置
  templateFile: {
    name: string;
    url: string;
    type: 'xlsx' | 'xls';
  };
  
  // 冲突处理策略
  conflictStrategy: 'skip' | 'override' | 'report_only';
  
  // 导入结果
  result: {
    totalEntries: number;
    successCount: number;
    failCount: number;
    conflicts: {
      entry: ScheduleTemplateEntry;
      reason: string;
    }[];
  };
}

// ============================================
// 排课配置
// ============================================
interface ScheduleConfig {
  // 时间规则
  dayStartHour: number;        // 8
  dayEndHour: number;         // 18
  periodsPerDay: number;      // 8 (上午4节 + 下午4节)
  classDuration: number;       // 45分钟/课时
  
  // 每日课时上限
  maxHoursPerDay: number;      // 默认8
  
  // 冲突规则
  allowConsecutiveHours: boolean;      // 允许连续大节
  maxWeeklyHours: number;              // 周最大课时
}

interface ScheduleResult {
  id: string;
  academicYear: string;
  semester: number;
  
  // 排课结果
  scheduleEntries: ScheduleEntry[];
  
  // 冲突报告
  conflicts: Conflict[];
  
  // 统计
  statistics: ScheduleStatistics;
  
  status: 'draft' | 'published';
  publishedAt?: Date;
}

interface ScheduleEntry {
  id: string;
  
  // 基本信息
  courseId: string;
  teacherId: string;
  classId: string;           // 班级ID
  roomId?: string;           // 教室/机房
  
  // 课时类型
  lessonType: 'theory' | 'lab';  // 理论课 / 上机课
  
  // 教室类型要求
  requiredRoomType?: '普通教室' | '机房' | '实验室' | '实训室';
  
  // 时间安排
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  periodStart: number;        // 第几节课开始 (1-8)
  periodEnd: number;          // 第几节课结束
  
  // 周期
  weekStart: number;          // 第1周
  weekEnd: number;            // 第16周
  
  // 来源标记
  source: 'auto' | 'template' | 'manual';  // 自动排/模板导入/手动调整
  
  // 冲突标记
  hasConflict: boolean;
  conflictReason?: string;
}

interface Conflict {
  type: 'teacher_unavailable' | 'teacher_preferred' | 'room' | 'computer_room' | 'student' | 'time' | 'capacity';
  entryIds: string[];         // 冲突的排课条目
  severity: 'error' | 'warning';  // 错误/警告
  description: string;       // "张老师 星期二 第3节 已有课"
}
```

**排课流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                    排课工作流                                │
├─────────────────────────────────────────────────────────────┤
│  1. 基础配置                                             │
│     ├─→ 教研组长配置每门课程的课时（理论/上机比例）       │
│     ├─→ 教师填写时间偏好（不排/优先排时间）               │
│     └─→ 管理员维护机房信息                                │
│                                                             │
│  2. 模板导入（可选）                                      │
│     ├─→ 学校提前排好的Excel模板                           │
│     ├─→ 系统导入并校验冲突                                │
│     └─→ 解决冲突或覆盖现有排课                           │
│                                                             │
│  3. 系统智能排课                                          │
│     ├─→ 读取各班级的课程课时配置                          │
│     ├─→ 考虑教师时间偏好（硬约束/软约束）                 │
│     ├─→ 机房课程优先分配到机房                           │
│     │    - 检查容量（电脑数量 ≥ 学生人数）               │
│     │    - 检查时段可用性                                 │
│     ├─→ 自动检测冲突并标记                               │
│     └─→ 生成课表草案                                      │
│                                                             │
│  4. 手动调整                                             │
│     ├─→ 拖拽调整时间/教室                                │
│     ├─→ 普通教室 ↔ 机房 互换（需满足条件）              │
│     └─→ 解决冲突                                          │
│                                                             │
│  5. 主任审批发布                                          │
│     └─→ 最终审核                                          │
│     └─→ 一键发布                                          │
└─────────────────────────────────────────────────────────────┘
```

**冲突检测规则**：

```typescript
// 冲突类型及处理
const conflictRules = [
  {
    type: 'teacher_unavailable',
    severity: 'error',
    description: '教师该时段不可排课',
    autoResolve: false  // 必须手动解决
  },
  {
    type: 'teacher_preferred',
    severity: 'warning', 
    description: '未满足教师优先时间偏好',
    autoResolve: true  // 可接受，继续排课
  },
  {
    type: 'room',
    severity: 'error',
    description: '教室已被占用',
    autoResolve: false
  },
  {
    type: 'computer_room_capacity',
    severity: 'error',
    description: '机房容量不足（电脑数 < 学生数）',
    autoResolve: false
  },
  {
    type: 'computer_room_unavailable',
    severity: 'error',
    description: '机房该时段不可用（维护/已占用）',
    autoResolve: false
  }
];
```

**课表模板导入示例**：

```
Excel模板列定义：
┌──────────┬────────┬────────┬──────┬───────┬─────┬─────┬──────────┐
│ 课程名称 │ 班级   │ 教师   │ 星期 │ 节次  │ 上机 │ 教室 │ 备注     │
├──────────┼────────┼────────┼──────┼───────┼─────┼─────┼──────────┤
│ 计算机基础│ 24级计算机1│ 张老师 │ 2    │ 3-4   │ 是   │ 机房A │ 第1-8周  │
│ 语文     │ 24级计算机1│ 李老师 │ 3    │ 1-2   │ 否   │ 101   │ 第1-16周 │
└──────────┴────────┴────────┴──────┴───────┴─────┴─────┴──────────┘
```
```

**排课流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                    排课工作流                                │
├─────────────────────────────────────────────────────────────┤
│  1. 教研组长录入排课需求                                     │
│     └─→ 选择班级、课程、教师、时间偏好                       │
│                                                             │
│  2. 系统智能排课                                           │
│     └─→ 依据约束算法生成课表草案                            │
│     └─→ 自动检测冲突并标记                                 │
│                                                             │
│  3. 手动调整                                               │
│     └─→ 拖拽调整时间/教室                                   │
│     └─→ 解决冲突                                           │
│                                                             │
│  4. 主任审批发布                                           │
│     └─→ 最终审核                                           │
│     └─→ 一键发布                                           │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2.2.4 授课计划与教案审查

**授课计划**：

```typescript
interface TeachingPlan {
  id: string;
  courseId: string;
  teacherId: string;
  academicYear: string;
  semester: number;
  
  // 学期教学安排
  weeklyPlans: WeeklyPlan[];  // 16-20周的每周安排
  
  // 总览
  totalHours: number;
  completedHours: number;
  progress: number;           // 百分比
  
  status: 'draft' | 'submitted' | 'approved';
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

interface WeeklyPlan {
  weekNumber: number;         // 第1周
  topics: string[];           // 本周教学内容
  objectives: string[];       // 本周教学目标
  homework: string;           // 作业安排
  notes?: string;             // 备注
}
```

**教案**：

```typescript
interface LessonPlan {
  id: string;
  courseId: string;
  teacherId: string;
  
  // 所属授课计划
  teachingPlanId: string;
  weekNumber: number;         // 第几周
  periodNumber: number;       // 第几节
  
  // 教案内容
  lessonTitle: string;        // 课时标题
  teachingDuration: number;    // 时长(分钟)
  
  // 教案主体
  sections: LessonSection[];
  /*
    sections = [
      { type: 'introduction', content: '...' },
      { type: 'content', content: '...' },
      { type: 'practice', content: '...' },
      { type: 'summary', content: '...' },
      { type: 'homework', content: '...' },
    ]
  */
  
  attachments: Attachment[];   // 附件（PPT、视频等）
  
  // 审查流程
  status: 'draft' | 'submitted' | 'under_review' | 'revision_requested' | 'approved';
  reviews: ReviewRecord[];
}

interface ReviewRecord {
  id: string;
  reviewerId: string;         // 教研组长/主任
  role: 'group_leader' | 'director';
  
  action: 'approve' | 'request_revision' | 'reject';
  comment: string;
  
  attachments?: Attachment[];
  
  reviewedAt: Date;
}
```

**教案审查流程**：

```
教师提交教案
     ↓
教研组长审查
     ├── 通过 → 主任审批
     │              ├── 通过 → 完成
     │              └── 退回 → 修改后重提
     └── 退回修改
            ↓
      教师修改
            ↓
      重新提交
```

**实际实现的 API（2026-03-31）**：

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/teaching-plans` | 创建授课计划 |
| POST | `/api/v1/teaching-plans/:id/submit` | 提交授课计划 |
| POST | `/api/v1/teaching-plans/:id/approve` | 审批授课计划 |
| POST | `/api/v1/teaching-plans/excel/import` | **Excel 批量导入授课计划** |
| POST | `/api/v1/teaching-plans/lesson-plans` | 创建教案 |
| GET | `/api/v1/teaching-plans/lesson-plans/:teachingPlanId` | 获取教案列表 |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/submit` | 提交教案 |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/teacher-approve` | **多教师协作审批** |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/director-approve` | 主任最终审批 |

**状态机（实际实现）**：

| 实体 | 状态流转 |
|------|----------|
| 授课计划 | `DRAFT` → `PENDING_TEACHER` → `PENDING_GROUP_LEADER` → `APPROVED/REJECTED` |
| 教案 | `DRAFT` → `PENDING_TEACHER` → `PENDING_GROUP_LEADER` → `PENDING_DIRECTOR` → `APPROVED/REJECTED` |

**Excel 导入字段**：`course_name`, `class_name`, `teacher_name`, `week_number`, `content`, `teaching_type`, `period_type`

---

#### 2.2.5 成绩管理

**成绩构成规则**：

```typescript
interface GradeComposition {
  courseId: string;
  
  // 成绩比例（由教研组长/主任在课程配置时设定）
  finalExamRatio: number;     // 期末占比，例如 70 (表示70%)
  usualRatio: number;         // 平时分占比，例如 30 (表示30%)
  // 注：finalExamRatio + usualRatio = 100
  
  passScore: number;          // 及格分数线，默认 60
  maxScore: number;           // 满分，默认 100
}
```

**成绩数据模型**：

```typescript
interface GradeRecord {
  id: string;
  
  // 基本信息
  studentId: string;          // 学生ID
  courseId: string;           // 课程ID
  classId: string;           // 班级ID
  academicYear: string;       // 学年 "2024-2025"
  semester: number;           // 学期 1 或 2
  
  // 成绩明细
  usualScore: number;        // 平时成绩（0-100）
  finalScore: number;         // 期末成绩（0-100）
  
  // 计算得出
  totalScore: number;         // 总成绩 = 平时*比例 + 期末*比例
  isPassed: boolean;          // 是否及格 (totalScore >= passScore)
  
  // 状态
  status: 'draft' | 'submitted' | 'reviewed' | 'published';
  
  // 记录
  enteredBy: string;          // 录入教师
  enteredAt: Date;
  
  reviewedBy?: string;       // 教研组长
  reviewedAt?: Date;
  
  publishedAt?: Date;        // 发布时间
}

interface GradeImportTemplate {
  // Excel模板列定义
  columns: {
    studentNumber: string;   // 学号
    usualScore: string;      // 平时成绩
    finalScore: string;      // 期末成绩
  };
  
  // 模板示例：
  /*
    学号        | 平时成绩 | 期末成绩
    2024010101  | 85       | 78
    2024010102  | 90       | 82
  */
}
```

**成绩录入流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                    成绩管理流程                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 教研组长配置成绩构成比例                                   │
│     └─→ 设置期末:平时分的比例（如 70:30）                      │
│                                                             │
│  2. 教师录入成绩                                             │
│     ├─→ 单个录入：输入每个学生的平时分和期末分                  │
│     └─→ 批量导入：下载模板 → 填写 → 上传Excel                  │
│         （模板由学校提供，支持学号匹配）                        │
│                                                             │
│  3. 系统自动计算总成绩                                        │
│     └─→ 总成绩 = 平时成绩 × 平时比例% + 期末成绩 × 期末比例%   │
│                                                             │
│  4. 教师提交成绩                                             │
│     └─→ 提交后进入审核状态                                    │
│                                                             │
│  5. 教研组长审核                                             │
│     ├─→ 通过 → 成绩发布，学生可查询                          │
│     └─→ 不通过 → 退回教师修改                                │
│                                                             │
│  6. 成绩发布后                                              │
│     ├─→ 学生可查询自己的成绩                                 │
│     └─→ 支持导出成绩单（Excel/PDF）                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**批量导入规则**：

```typescript
interface GradeImportRules {
  // 支持格式
  formats: ['xlsx', 'xls', 'csv'];
  
  // 模板获取
  templateSource: 'system_default' | 'school_customized';
  
  // 导入校验
  validations: [
    '学号必须存在于系统中',
    '成绩必须在0-100范围内',
    '不能重复导入同一学生同一课程的成绩（覆盖需确认）',
    '学号列不能为空',
  ];
  
  // 导入结果反馈
  report: {
    successCount: number;     // 成功导入条数
    failCount: number;        // 失败条数
    failures: {
      row: number;           // 行号
      studentNumber: string;   // 学号
      reason: string;         // 失败原因
    }[];
  };
}
```

**成绩权限**：

| 操作 | 教师 | 教研组长 | 主任 |
|------|:----:|:--------:|:----:|
| 配置成绩比例 | - | ✅ 制定 | ✅ 审批 |
| 录入成绩 | ✅ 自己的课程 | - | - |
| 批量导入/导出 | ✅ 自己的课程 | ✅ 全组 | ✅ 全校 |
| 审核成绩 | - | ✅ 本组 | ✅ 全校 |
| 查看成绩 | ✅ 本人/本班 | ✅ 本组 | ✅ 全校 |
| 成绩修改（已发布）| - | - | ✅ 需留痕 |

**成绩修改审计**：

```typescript
interface GradeChangeLog {
  id: string;
  
  gradeRecordId: string;      // 被修改的成绩ID
  
  // 修改前后
  before: {
    usualScore: number;
    finalScore: number;
    totalScore: number;
  };
  after: {
    usualScore: number;
    finalScore: number;
    totalScore: number;
  };
  
  // 审计信息
  changedBy: string;          // 修改人
  changedAt: Date;
  reason: string;            // 修改原因（必填）
  approvedBy?: string;       // 审批人（主任）
}
```

---

#### 2.2.6 任务与作业

**学生职务**：

```typescript
// 系统预设职务（可由管理员配置）
interface StudentPosition {
  id: string;
  name: string;             // "班长" / "学习委员" / "体育委员" / "文艺委员" 等
  code: string;              // 代码 "monitor" / "study_leader" / "sports_leader" 等
  description?: string;       // 职务说明
  scope: 'class' | 'school'; // 作用范围：班级/全校
  isActive: boolean;
  sortOrder: number;         // 排序
}

// 学生的职务分配
interface StudentPositionAssignment {
  id: string;
  studentId: string;
  classId: string;
  positionId: string;         // 职务ID
  assignedBy: string;         // 分配人（班主任/管理员）
  assignedAt: Date;
  effectiveDate?: Date;       // 生效日期
  expiryDate?: Date;         // 过期日期（可为空表示长期）
}
```

**任务与作业**：

```typescript
interface Task {
  id: string;
  
  // 任务基本信息
  title: string;             // 任务标题
  description?: string;       // 任务描述/要求
  courseId: string;           // 关联课程
  teacherId: string;         // 发布教师
  
  // 发布范围
  scope: {
    type: 'course' | 'class';  // 按课程还是按班级
    targetIds: string[];     // 课程ID列表或班级ID列表
  };
  
  // 时间
  publishAt: Date;           // 发布时间
  deadline?: Date;           // 截止时间
  
  // 附件
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // 状态
  status: 'draft' | 'published' | 'closed';
  
  // 统计
  totalStudents: number;      // 应交人数
  submittedCount: number;    // 已交人数
}

interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  
  // 提交状态
  status: 'not_submitted' | 'submitted' | 'late' | 'graded';
  
  // 提交内容
  submittedAt?: Date;
  content?: string;          // 文字内容
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // 教师反馈
  feedback?: string;
  grade?: number;           // 分数（可选）
  gradedAt?: Date;
  gradedBy?: string;
}

interface TaskSubmissionStatus {
  taskId: string;
  
  // 全班/全课程交稿状态
  students: {
    studentId: string;
    studentName: string;
    status: 'not_submitted' | 'submitted' | 'late' | 'graded';
    submittedAt?: Date;
  }[];
  
  // 统计
  totalCount: number;
  submittedCount: number;
  notSubmittedCount: number;
  lateCount: number;
  gradedCount: number;
}
```

**任务发布流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                  任务/作业管理流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 教师创建任务                                            │
│     └─→ 填写标题、要求、设置截止时间                       │
│     └─→ 上传附件（可选）                                   │
│                                                             │
│  2. 发布任务                                               │
│     └─→ 选择范围（按课程班级）                             │
│     └─→ 系统自动推送给相关学生                             │
│                                                             │
│  3. 学生提交作业                                           │
│     └─→ 小程序查看任务                                     │
│     └─→ 提交文字/附件                                     │
│     └─→ 截止时间前提交 → 正常                              │
│     └─→ 截止时间后提交 → 标记迟到                          │
│                                                             │
│  4. 教师查看交稿情况                                       │
│     └─→ 查看已交/未交名单                                 │
│     └─→ 一键提醒未交学生                                  │
│                                                             │
│  5. 教师批改反馈                                           │
│     └─→ 给分 + 文字反馈                                   │
│     └─→ 学生可查看成绩                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

#### 2.2.5 教师课时统计

**课时系数配置**：

```typescript
interface TeachingHoursCoefficient {
  id: string;
  academicYear: string;
  semester: number;
  
  // 重复课时系数
  // 规则：同一教师教同一课程多个班级时
  // - 人数最多的班级系数 = 1.0（基准）
  // - 其他班级的系数由管理员设置
  duplicateCourseCoefficient: {
    // 班级人数排名（第2名、第3名...的系数）
    // 例如: 第2名=0.9, 第3名=0.85, 第4名+=0.8
    rank: number;    // 人数排名（2=第二名, 3=第三名...）
    coefficient: number;
  }[];
  
  // 班级人数系数（独立于重复课时）
  classSizeCoefficient: {
    // 人数区间: 系数
    // 例如: 0-30人=1.0, 31-40人=1.1, 41-50人=1.2, 51+人=1.3
    minStudents: number;
    maxStudents: number;
    coefficient: number;
  }[];
  
  // 课程类型系数（可选）
  courseTypeCoefficient?: {
    // 例如: 理论课=1.0, 实践课=1.2, 体育课=0.8
    [courseType: string]: number;
  };
  
  // 是否启用
  isActive: boolean;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**实际实现的 API（2026-03-31）**：

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/teaching-hours/coefficients` | 获取所有课时系数配置 |
| POST | `/api/v1/teaching-hours/coefficients` | 创建课时系数配置 |
| PUT | `/api/v1/teaching-hours/coefficients/:id` | 更新课时系数 |
| GET | `/api/v1/teaching-hours/records` | 获取课时记录列表 |
| GET | `/api/v1/teaching-hours/records/:teacherId` | 获取指定教师的课时记录 |
| POST | `/api/v1/teaching-hours/calculate` | 计算教师总课时 |
| GET | `/api/v1/teaching-hours/summary/:teacherId` | 获取教师课时汇总（按课程） |
| POST | `/api/v1/teaching-hours/suspensions` | 记录停课时段 |
| GET | `/api/v1/teaching-hours/suspensions/:semesterId` | 获取学期停课记录 |

**课时计算逻辑（实际实现）**：
- **重复课时系数**：人数最多班级 = 1.0，其他按配置（如 0.9、0.85）
- **班级人数系数**：≤20人=0.8，21-30=0.95，31-40=1.05，41-50=1.15，>50=1.25
- **最终课时** = 基础课时 × 班级人数系数 × 重复课时系数
- **停课扣减**：停课期间课时单独记录，从总课时中扣减

**课表版本管理**：

```typescript
interface ScheduleVersion {
  id: string;
  
  academicYear: string;
  semester: number;
  versionNumber: number;       // 版本号，如 1, 2, 3
  
  // 版本状态
  status: 'draft' | 'published' | 'archived';
  
  // 生效日期范围
  effectiveFrom?: Date;       // 生效开始日期
  effectiveTo?: Date;         // 生效结束日期
  
  // 变更说明
  changeNote?: string;
  
  // 创建信息
  createdBy: string;
  createdAt: Date;
  
  // 关联的排课记录
  scheduleEntries: string[];   // ScheduleEntry IDs
}

interface ScheduleEntry {
  id: string;
  
  courseId: string;
  teacherId: string;
  classId: string;
  roomId?: string;
  
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  periodStart: number;        // 第几节课开始
  periodEnd: number;          // 第几节课结束
  
  weekStart: number;          // 第1周
  weekEnd: number;            // 第16周
  
  // 所属版本
  scheduleVersionId: string;
  
  // 重复标识（用于识别重复课时）
  duplicateGroupId?: string;  // 同一教师同一课程的不同班级有相同的groupId
}
```

**停课记录**：

```typescript
interface ClassSuspension {
  id: string;
  
  // 停课信息
  scheduleEntryId: string;     // 被停课的排课记录ID
  classId: string;
  courseId: string;
  teacherId: string;
  
  // 停课时间范围
  suspensionDate: string;     // 停课日期 "2024-10-15"
  suspensionPeriodStart: number; // 停课节次（开始）
  suspensionPeriodEnd: number;  // 停课节次（结束）
  
  // 原因
  reason: string;            // 停课原因
  suspendBy: string;         // 操作人
  suspendAt: Date;
  
  // 是否已补课
  makeUpStatus: 'none' | 'pending' | 'completed';
  makeUpDate?: string;       // 补课日期
  makeUpPeriod?: number;      // 补课节次
}
```

**课时计算**：

```typescript
interface TeachingHoursCalculation {
  id: string;
  
  // 计算基础信息
  academicYear: string;
  semester: number;
  
  // 教师信息
  teacherId: string;
  
  // 统计周期
  periodStart: Date;
  periodEnd: Date;
  
  // 原始课时（不含系数）
  rawHours: number;
  
  // 系数明细
  coefficients: {
    duplicateCoefficient: number;    // 重复课时系数
    classSizeCoefficient: number;    // 班级人数系数
    courseTypeCoefficient?: number;   // 课程类型系数
  };
  
  // 最终课时
  finalHours: number;
  
  // 计算公式说明
  formula: string;  // "原始课时 × 重复系数 × 班级人数系数 × 课程类型系数"
  
  // 明细
  details: TeachingHoursDetail[];
  
  calculatedBy: string;
  calculatedAt: Date;
}

interface TeachingHoursDetail {
  // 原始记录
  scheduleEntryId: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  
  // 班级人数
  studentCount: number;
  
  // 重复班级信息（同一教师同一课程）
  duplicateGroupId: string;    // 重复组ID
  totalDuplicateClasses: number;  // 该课程共几个班
  duplicateRank: number;       // 班级人数排名（1=人数最多=系数1.0）
  
  // 原始课时（节次 × 周数）
  rawHours: number;          // (periodEnd - periodStart + 1) × (weekEnd - weekStart + 1)
  
  // 各系数
  duplicateCoefficient: number;  // 重复课时系数（排名第1=1.0，其他按配置）
  classSizeCoefficient: number; // 班级人数系数
  courseTypeCoefficient?: number; // 课程类型系数
  
  // 停课扣减
  suspensionDeductions: number;  // 停课课时
  
  // 最终课时
  finalHours: number;
}
```

**课时统计查询**：

```typescript
interface TeachingHoursQuery {
  // 查询条件
  academicYear: string;
  semester: number;
  teacherId?: string;         // 可选，指定教师
  departmentId?: string;       // 可选，教研组
  
  // 时间范围
  periodStart?: Date;
  periodEnd?: Date;
  
  // 包含停课
  includeSuspensions: boolean; // 是否包含停课记录
}

interface TeachingHoursReport {
  // 汇总
  totalTeachers: number;
  totalRawHours: number;
  totalFinalHours: number;
  
  // 明细列表
  teachers: {
    teacherId: string;
    teacherName: string;
    departmentName: string;
    
    rawHours: number;
    finalHours: number;
    
    // 课程明细
    courses: {
      courseId: string;
      courseName: string;
      className: string;
      rawHours: number;
      finalHours: number;
      duplicateCoefficient: number;
      classSizeCoefficient: number;
    }[];
  }[];
}
```

**课时计算流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                  教师课时统计流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 教研组长/主任配置课时系数                                │
│     ├─→ 设置重复课时系数（如：2班=1.0, 3班=0.9, 4班=0.8）    │
│     └─→ 设置班级人数系数（如：30人=1.0, 40人=1.1）          │
│                                                             │
│  2. 教务员维护课表版本                                      │
│     ├─→ 发布新课表版本                                      │
│     └─→ 记录版本变更说明                                    │
│                                                             │
│  3. 记录停课（如有）                                        │
│     └─→ 记录停课的课程、时间、原因                          │
│     └─→ 是否补课、补课时间                                  │
│                                                             │
│  4. 月底/学期末统计课时                                     │
│     ├─→ 按课表版本计算每个教师的原始课时                    │
│     ├─→ 应用重复课时系数                                    │
│     ├─→ 应用班级人数系数                                    │
│     ├─→ 扣除停课课时                                        │
│     └─→ 生成最终课时报表                                    │
│                                                             │
│  5. 教师查询核对                                            │
│     └─→ 教师查看自己的课时明细                              │
│     └─→ 如有异议可申请复核                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**课时系数示例**：

```
重复课时系数配置示例：
┌────────────────┬──────────────┐
│  重复班级数    │    系数      │
├────────────────┼──────────────┤
│     1个班      │    1.00      │
│     2个班      │    1.00      │
│     3个班      │    0.90      │
│     4个班及以上 │    0.80      │
└────────────────┴──────────────┘

班级人数系数配置示例：
┌────────────────┬──────────────┐
│    人数区间    │    系数      │
├────────────────┼──────────────┤
│    1-30人     │    1.00      │
│    31-40人    │    1.10      │
│    41-50人    │    1.20      │
│    51人以上    │    1.30      │
└────────────────┴──────────────┘

课时计算示例：
假设：
- 教师李老师教3个班的"语文"课
- 计算机1班45人（人数最多）
- 计算机2班38人
- 计算机3班42人
- 每周3节课，上16周
- 管理员配置重复课时系数：第2名=0.9, 第3名=0.8
- 班级人数系数：31-40人=1.10, 41-50人=1.15

计算：

| 班级 | 人数 | 重复排名 | 重复系数 | 人数系数 | 原始课时 | 最终课时 |
|------|------|----------|----------|----------|---------|---------|
| 计算机1班 | 45人 | 第1名 | 1.00 | 1.15 | 48节 | 55.2节 |
| 计算机2班 | 38人 | 第2名 | 0.90 | 1.10 | 48节 | 47.52节 |
| 计算机3班 | 42人 | 第3名 | 0.80 | 1.15 | 48节 | 44.16节 |

公式：最终课时 = 原始课时 × 重复系数 × 班级人数系数

注意：原始课时 = (periodEnd - periodStart + 1) × (weekEnd - weekStart + 1) = 3 × 16 = 48节
```
```

---

#### 2.2.7 教材订购

**教材管理**：

```typescript
interface Textbook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;           // 版次
  price: number;             // 单价
  
  applicableCourses: string[]; // 适用课程
  applicableMajors: string[]; // 适用专业
  
  stock: number;             // 当前库存
  reorderLevel: number;      // 补货警戒线
}

interface TextbookOrder {
  id: string;
  academicYear: string;
  semester: number;
  
  // 订购汇总
  items: OrderItem[];
  /*
    items = [
      { textbookId: '...', quantity: 120, unitPrice: 35, totalPrice: 4200 },
      ...
    ]
  */
  
  totalAmount: number;
  
  // 流程
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'ordered';
  
  // 申请信息
  appliedBy: string;         // 申请人（教师/教研组长）
  submittedAt?: Date;
  
  // 审批
  reviewedBy?: string;        // 教研组长
  approvedBy?: string;       // 主任
  approvedAt?: Date;
  
  // 订单信息
  supplier?: string;         // 供应商
  orderedAt?: Date;
  expectedDelivery?: Date;
  
  // 入库
  receivedBy?: string;
  receivedAt?: Date;
  distributionStatus: 'pending' | 'partial' | 'completed';
}
```

---

#### 2.2.8 班级管理与请假审批

**小程序多角色设计**：

```typescript
// 用户角色模型
interface UserRole {
  userId: string;
  
  // 基础角色（每个用户必有一个）
  // 注意：admin 是独立账号，不继承其他角色
  baseRole: 'student' | 'teacher' | 'admin';
  
  // 兼任角色（可多个，admin账号无兼任角色）
  additionalRoles?: (
    | 'class_teacher'      // 班主任
    | 'group_leader'       // 教研组长
    | 'department_head'    // 主任/副主任
  )[];
  
  // 角色有效期
  roleAssignments: RoleAssignment[];
}

interface RoleAssignment {
  role: string;
  scope: {
    type: 'school' | 'department' | 'group' | 'class';
    id?: string;  // 对应班级/教研组/院系ID
  };
  assignedAt: Date;
  expiresAt?: Date;  // 任职期限
}

// 用户的完整身份
interface UserIdentity {
  userId: string;
  name: string;
  avatar?: string;
  
  // 当前激活的角色
  activeRole: 'student' | 'teacher' | 'class_teacher' | 'group_leader' | 'department_head';
  
  // 所有可用角色（用于切换）
  availableRoles: RoleInfo[];
}

interface RoleInfo {
  role: string;
  roleName: string;        // "教师" / "班主任(2024级计算机1班)"
  scope: string;           // "2024级计算机1班" / "语文教研组"
  icon: string;            // 角色图标
  unreadCount?: number;     // 未读消息数
}
```

**小程序角色切换交互**：

```
┌─────────────────────────────────────────────────────────────┐
│                    小程序首页 - 角色选择卡                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 张老师 (zhangsan)                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔄 当前角色：教师                                  │    │
│  │                                                     │    │
│  │  可切换至：                                         │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐              │    │
│  │  │ 📚教师  │ │ 👨‍🏫班主任│ │ 📋教研组长│              │    │
│  │  │  2024级 │ │ 计算机1班│ │ 语文组   │              │    │
│  │  │  计算机  │ │  32人   │ │  8人    │              │    │
│  │  └─────────┘ └─────────┘ └─────────┘              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

切换角色后：
- 底部Tab栏内容变化
- 主页显示对应角色的功能入口
- 消息通知切换到对应角色视角
```

**角色对应的功能入口**：

| 角色 | 小程序功能入口 |
|------|--------------|
| **学生** | 📅课表 / 📊成绩 / 📝请假 / 📚教材 / ✅签到 |
| **教师** | 📅课表 / 📊成绩 / 📝请假 / 📤教案提交 |
| **班主任** | + 📋班级管理 / ✅请假审批 / 👥学生列表 / 📊考勤统计 |
| **班长** | + 📋班级请假查看 |
| **教研组长** | + 📋教研管理 / ✅教案审批 / 📚教材审核 |
| **主任** | + 📊统计分析 / ✅全局审批 / ⚙️系统管理 |

**请假审批流程（多角色）**：

```typescript
// 根据用户角色动态决定审批节点
function getLeaveApprovalWorkflow(
  leaveType: string,
  requesterClassId: string,
  requesterDepartmentId: string
): WorkflowStep[] {
  return [
    // 第一步：班主任审批（如果是学生或教师请假）
    {
      step: 1,
      approverRole: 'class_teacher',
      scope: { type: 'class', id: requesterClassId },
      label: '班主任审批'
    },
    // 第二步：根据请假类型决定
    {
      step: 2,
      approverRole: leaveType === 'personal' ? 'department_head' : 'group_leader',
      scope: { type: 'department', id: requesterDepartmentId },
      label: '主任/教研组长审批'
    }
  ];
}
```

**实际实现的 API（2026-03-31）**：

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/leaves` | 创建请假申请 |
| GET | `/api/v1/leaves` | 获取请假列表（按角色过滤） |
| GET | `/api/v1/leaves/:id` | 获取请假详情 |
| POST | `/api/v1/leaves/:id/submit` | 提交请假申请 |
| POST | `/api/v1/leaves/:id/class-teacher-approve` | 班主任审批 |
| POST | `/api/v1/leaves/:id/director-approve` | 主任最终审批 |
| POST | `/api/v1/leaves/:id/reject` | 驳回请假（任意审批节点） |

**请假类型**：`personal`（事假）、`sick`（病假）、`official`（公假）

**班级**：

```typescript
interface Class {
  id: string;
  name: string;              // "2024级计算机1班"
  grade: number;              // 年级 1, 2, 3
  majorId: string;            // 专业ID
  academicYear: string;       // "2024"
  
  // 人员
  students: string[];         // 学生ID列表
  teacherId: string;         // 班主任ID
  classMonitorId?: string;    // 班长ID（从学生中选出）
  
  // 班主任历史（用于换班主任交接）
  teacherHistory: {
    teacherId: string;
    startDate: Date;
    endDate?: Date;
  }[];
  
  // 统计
  studentCount: number;
  currentAttendance: number;  // 当前出勤率
  
  status: 'active' | 'graduated' | 'archived';
}

interface Student {
  id: string;
  studentNumber: string;      // 学号 "2024010101"
  name: string;
  gender: 'male' | 'female';
  classId: string;
  
  contact: ContactInfo;
  emergencyContact: ContactInfo;
  
  enrollmentDate: Date;
  status: 'active' | 'suspended' | 'withdrawn' | 'graduated';
  
  // 请假统计
  usedLeave: {
    sick: number;             // 已请病假天数
    personal: number;        // 已请事假天数
  };
  
  // 考勤统计
  attendanceStats: {
    totalDays: number;       // 应到天数
    presentDays: number;     // 实到天数
    lateCount: number;       // 迟到次数
    earlyLeaveCount: number;  // 早退次数
    absentDays: number;      // 旷课天数
    attendanceRate: number;   // 出勤率百分比
  };
}
```

**学生批量录入**：

```typescript
interface StudentImportTemplate {
  // Excel模板列定义
  columns: {
    studentNumber: string;   // 学号
    name: string;            // 姓名
    gender: string;          // 性别
    idCard: string;          // 身份证号
    contact: string;         // 联系电话
    emergencyContact: string; // 紧急联系人
    emergencyPhone: string;  // 紧急联系电话
  };
  
  // 导入结果反馈
  report: {
    successCount: number;
    failCount: number;
    failures: {
      row: number;
      studentNumber: string;
      reason: string;
    }[];
  };
}
```

**退学处理**：

```typescript
interface WithdrawalRequest {
  id: string;
  studentId: string;
  classId: string;
  
  // 退学信息
  reason: string;            // 退学原因
  withdrawalDate: Date;     // 申请退学日期
  expectedEndDate: Date;     // 预计离校日期
  
  // DOCX表格模版
  documentTemplate: 'withdrawal_form.docx';
  
  // 预填信息（从学生档案提取）
  prefillData: {
    studentName: string;
    studentNumber: string;
    className: string;
    majorName: string;
    enrollmentDate: Date;
    idCardNumber: string;
    contactInfo: string;
    emergencyContact: string;
    // ... 其他需要预填的字段
  };
  
  // 审批流程
  workflow: WorkflowStep[];
  
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  
  // 归档
  archivedAt?: Date;
  archiveRemarks?: string;
}
```

**每日签到**：

```typescript
interface DailyCheckIn {
  id: string;
  studentId: string;
  classId: string;
  
  date: string;              // 日期 "2024-09-02"
  
  // 签到信息
  checkInTime?: Date;       // 签到时间
  checkInLocation?: {
    latitude: number;        // 纬度
    longitude: number;       // 经度
    address?: string;         // 地址描述
  };
  
  // 状态
  status: 'checked_in' | 'late' | 'absent';
  
  // 系统判断
  isLate: boolean;          // 是否迟到
  lateMinutes?: number;     // 迟到分钟数
}
```

**请假审批流**：

```typescript
interface LeaveRequest {
  id: string;
  studentId: string;
  classId: string;
  
  // 请假信息
  type: 'sick' | 'personal' | 'other';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  
  reason: string;
  attachments?: string[];   // 证明材料（照片等）
  
  // 审批流程
  workflow: WorkflowStep[];
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  step: number;
  approverId: string;
  approverName: string;
  role: 'class_teacher' | 'group_leader' | 'director';
  
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actedAt?: Date;
}
```
```

**请假审批流**：

```typescript
interface LeaveRequest {
  id: string;
  studentId: string;
  classId: string;
  
  // 请假信息
  type: 'sick' | 'personal' | 'other';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  
  reason: string;
  attachments?: string[];    // 证明材料
  
  // 审批流程
  workflow: WorkflowStep[];
  /*
    workflow = [
      { step: 1, approverId: 'teacher_001', role: 'class_teacher', status: 'pending' },
      { step: 2, approverId: 'director_001', role: 'director', status: 'pending' },
    ]
  */
  
  currentStep: number;        // 当前审批步骤
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  step: number;
  approverId: string;
  approverName: string;
  role: 'class_teacher' | 'group_leader' | 'director' | 'vice_director';
  
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  
  actedAt?: Date;
}
```

**请假审批流程**：

```
学生提交请假申请
     ↓
班主任审批 (第一关)
     ├── 同意 → 主任/副主任审批 (第二关)
     │              ├── 同意 → 审批完成
     │              └── 拒绝 → 流程结束
     └── 拒绝 → 流程结束
```

---

## 3. 技术架构

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
├──────────────────┬──────────────────┬───────────────────────────┤
│   Web管理后台     │    微信小程序     │      教师端APP           │
│  (Vue3 + Vite)   │  (Taro + React)  │    (Flutter/ReactNative) │
│  (管理员/主任)    │  (微信小程序)     │    (未来扩展)            │
│  注重人机交互     │  注重移动端体验    │                         │
└────────┬─────────┴────────┬────────┴────────────┬──────────────┘
         │                   │                      │
         └───────────────────┼──────────────────────┘
                             │
                      ┌──────▼──────┐
                      │   API网关    │
                      │  (Nginx)    │
                      └──────┬──────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      服务层 (微服务)                              │
├─────────────┬──────────────┼──────────────┬─────────────────────┤
│  用户服务    │   教学服务     │   排课服务   │     审批服务        │
│  User Svc   │  Academic Svc │ Schedule Svc │   Approval Svc     │
│  (角色服务)  │  (含角色计算)  │              │   (工作流引擎)     │
├─────────────┼──────────────┼──────────────┼─────────────────────┤
│  权限服务    │   课程服务     │   教室服务   │     通知服务        │
│  Auth Svc   │  Course Svc   │  Room Svc   │   Notification Svc │
│  (RBAC+多角色)│              │              │                    │
├─────────────┴──────────────┴──────────────┴─────────────────────┤
│                        数据层                                     │
├─────────────┬──────────────┬──────────────┬─────────────────────┤
│   MySQL     │   Redis      │    MinIO     │     Elasticsearch   │
│  (主数据)   │   (缓存/会话)  │   (文件存储)  │     (日志/搜索)     │
└─────────────┴──────────────┴──────────────┴─────────────────────┘
```

### 3.1.1 小程序多角色架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    微信小程序 - 四角色合一                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              统一登录 / 身份认证                          │   │
│  │                 (微信 OAuth + 手机号绑定)                  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              用户角色中心 (UserRoleService)               │   │
│  │                                                         │   │
│  │  角色配置:                                              │   │
│  │  - baseRole: 'student' | 'teacher'    (必选)           │   │
│  │  - additionalRoles: ['class_teacher', 'group_leader']   │   │
│  │  - activeRole: 当前激活的角色                           │   │
│  │                                                         │   │
│  │  角色切换:                                              │   │
│  │  - 底部Tab栏随角色动态变化                              │   │
│  │  - 主页功能入口随角色动态显示                           │   │
│  │  - 消息通知按角色隔离                                  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│           ┌───────────────┼───────────────┐                   │
│           ▼               ▼               ▼                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   学生视角  │  │   教师视角  │  │  班主任视角 │           │
│  │  - 课表    │  │  - 课表    │  │  - 班级概览 │           │
│  │  - 成绩    │  │  - 成绩    │  │  - 请假审批 │           │
│  │  - 请假    │  │  - 教案    │  │  - 学生列表 │           │
│  │  - 教材    │  │  - 请假    │  │  - 班级课表 │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              统一消息通道 (角色隔离)                       │   │
│  │  - 每个角色有独立的待办/通知                              │   │
│  │  - 切换角色后自动切换消息视角                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**小程序角色对应的功能**：

| 角色 | 底部Tab | 核心功能 |
|------|---------|---------|
| **学生** | 课表/成绩/请假/我的 | 课表查询、成绩查询、请假申请、教材查询 |
| **教师** | 课表/教案/请假/我的 | 课表查询、教案提交/查询、请假申请 |
| **班主任** | 班级/课表/审批/我的 | 班级管理、学生列表、请假审批、班级课表 |
| **教研组长** | 教研/课表/审批/我的 | 人才培养方案、教研管理、教案审批、教材审核、全组课表 |
| **主任** | 统计/审批/课表/我的 | 统计分析、全局审批、全校课表、系统管理 |

### 3.2 技术栈选择

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端 Web** | Vue3 + Vite + TypeScript | 管理后台 |
| **小程序** | Taro + React | 微信小程序 |
| **后端** | NestJS + TypeScript | 单体应用（简单部署）|
| **数据库** | MySQL 8.0 | 主数据库 |
| **缓存** | Redis 7.0 | 会话缓存（可选）|
| **文件存储** | 本地文件系统 / 阿里云OSS | 文档/教材/教案附件 |
| **容器化** | Docker（单一镜像） | 简化部署 |
| **CI/CD** | GitHub Actions | 简化CI |

### 3.2.1 简化部署方案

```
┌─────────────────────────────────────────────────────────────┐
│                    简化部署架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  方案A：单体部署（推荐中小规模）                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker 单一容器                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │   │
│  │  │ NestJS  │  │  MySQL  │  │ 文件存储 │          │   │
│  │  │  API    │  │  数据库  │  │  附件   │          │   │
│  │  └─────────┘  └─────────┘  └─────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  方案B：分离部署（大规模/高并发）                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 前端Web │  │ 小程序   │  │ NestJS  │  │  MySQL  │   │
│  │ 静态资源 │  │  API    │  │  服务   │  │  数据库  │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                             │
│  部署命令（方案A）：                                       │
│  docker-compose up -d                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2.2 账号系统设计

```typescript
// ============================================
// 用户账号
// ============================================
interface Account {
  id: string;
  
  // 账号类型
  accountType: 'student' | 'teacher' | 'admin';
  
  // 登录凭证
  username?: string;           // 用户名（admin/教师用）
  passwordHash?: string;      // 密码（已加密）
  
  // 微信绑定（小程序用户）
  wechatOpenId?: string;      // 微信OpenID
  wechatUnionId?: string;     // 微信UnionID
  
  // 基础信息
  name: string;
  phone?: string;             // 手机号（用于找回密码/通知）
  email?: string;
  avatar?: string;
  
  // 状态
  status: 'active' | 'suspended' | 'locked';
  failedLoginAttempts: number; // 连续登录失败次数
  lockedUntil?: Date;        // 锁定截止时间
  
  // 安全
  lastLoginAt?: Date;
  lastLoginIp?: string;
  
  // 时间
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 账号安全策略
// ============================================
interface SecurityPolicy {
  // 密码策略
  passwordMinLength: number;        // 最小长度（默认8位）
  passwordRequireUppercase: boolean; // 必须包含大写字母
  passwordRequireLowercase: boolean; // 必须包含小写字母
  passwordRequireNumbers: boolean;   // 必须包含数字
  passwordRequireSpecial: boolean;  // 必须包含特殊字符
  passwordExpiryDays: number;       // 密码过期天数（0=不过期）
  
  // 登录限制
  maxFailedAttempts: number;          // 最大登录失败次数（默认5次）
  lockoutDuration: number;          // 锁定时长（分钟，默认30分钟）
  
  // 会话管理
  sessionTimeout: number;          // 会话超时（分钟）
  allowConcurrentSessions: boolean; // 允许同时登录
}

// ============================================
// 微信账号绑定
// ============================================
interface WechatBinding {
  id: string;
  accountId: string;
  
  // 微信信息
  openId: string;
  unionId?: string;
  
  // 绑定状态
  isPrimary: boolean;         // 是否为主账号
  boundAt: Date;
  
  // 解绑
  canUnbind: boolean;        // 能否解绑（学生账号解绑需验证）
}

// ============================================
// 登录日志
// ============================================
interface LoginLog {
  id: string;
  accountId: string;
  
  // 登录信息
  loginAt: Date;
  loginIp: string;
  loginLocation?: string;      // 登录地点
  loginDevice?: string;        // 设备信息
  loginResult: 'success' | 'failed' | 'locked';
  failureReason?: string;
}
```

### 3.3 前端人机交互规范

#### 3.3.1 设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    设计原则                                    │
├─────────────────────────────────────────────────────────────┤
│  1. 效率优先    │ 操作步骤少，信息层次清晰                    │
│  2. 一致性      │ 交互模式统一，减少用户学习成本              │
│  3. 反馈及时    │ 每个操作都有明确的视觉/状态反馈             │
│  4. 容错设计    │ 防止误操作，误操作后可恢复                 │
│  5. 移动优先    │ 移动端体验优先，功能精简直观                │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.2 微信小程序交互规范

```typescript
// 核心交互规范
const interactionRules = {
  // 导航
  navigation: {
    bottomTabCount: '4-5个最佳，不超过5个',
    pageDepth: '不超过3级',
    backButton: '始终保留，返回层级清晰'
  },
  
  // 表单
  forms: {
    inputSteps: '单页面不超过3个输入步骤',
    autoSave: '草稿内容自动保存',
    validation: '输入即时校验，错误提示明确'
  },
  
  // 审批流程
  approval: {
    oneHandOperation: '审批操作单手可完成',
    swipeAction: '支持左滑快捷操作（通过/拒绝）',
    batchOperation: '多选后可批量审批'
  },
  
  // 通知
  notifications: {
    badge: 'Tab有未读时显示红点badge',
    vibration: '重要通知可配合振动',
    sound: '可设置提示音开关'
  },
  
  // 签到
  checkIn: {
    oneTap: '一键签到，GPS自动定位',
    feedback: '签到成功/失败立即反馈',
    offline: '断网时缓存签到记录'
  }
};
```

#### 3.3.3 Web管理后台交互规范

```typescript
// Web管理后台规范
const webInteractionRules = {
  // 布局
  layout: {
    sidebarWidth: '200-280px',
    contentPadding: '24px',
    tableRowHeight: '48px',
    modalWidth: '480-640px（标准）/ 800px（复杂表单）'
  },
  
  // 表格
  tables: {
    pageSize: '10/20/50/100可选',
    sortable: '可排序列有箭头指示',
    filterable: '筛选条件折叠展示',
    bulkAction: '选中后显示批量操作栏'
  },
  
  // 表单
  forms: {
    labelAlign: '标签左对齐',
    requiredMark: '必填项红色星号*',
    errorDisplay: '错误信息在输入框下方',
    submitFeedback: '提交后显示loading，禁止重复提交'
  },
  
  // 审批
  approval: {
    diffView: '显示修改前后对比',
    quickActions: '通过/拒绝按钮在右侧固定',
    comment: '审批意见可选但建议填写'
  },
  
  // 统计图表
  charts: {
    exportable: '图表可导出PNG/Excel',
    interactive: '支持hover查看详细数据',
    responsive: '窗口缩放图表自适应'
  }
};
```

#### 3.3.4 响应式设计

```
PC端 (≥1200px)：
├── 左侧导航 + 内容区
└── 表格多列展示

平板端 (768-1199px)：
├── 折叠导航 + 内容区
└── 表格列精简

移动端 (<768px)：
├── 底部Tab + 内容区
├── 表格横向滚动
└── 表单单列布局
```

#### 3.3.5 微信小程序账号

```
开发前需准备：
1. 微信公众平台账号 (https://mp.weixin.qq.com/)
2. 小程序 AppID
3. 开发者权限配置
4. 服务器域名白名单配置
```

### 3.4 数据库设计（核心表）

```
┌─────────────────────────────────────────────────────────────┐
│                      核心实体关系                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  School ──1:N──> Department                                 │
│              └──1:N──> Major                               │
│                    └──1:N──> Class ──1:N──> Student        │
│                                                             │
│  Major ──N:M──> Course (通过专业课程关联表)                   │
│                                                             │
│  Class ──1:N──> ScheduleEntry                               │
│  Course ──1:N──> ScheduleEntry                              │
│  Teacher ──1:N──> ScheduleEntry                             │
│  Room ──1:N──> ScheduleEntry                               │
│                                                             │
│  Course ──1:1──> CourseStandard                              │
│  CourseStandard ──1:N──> LessonPlan                          │
│                                                             │
│  LeaveRequest ──N:1──> Student                              │
│  LeaveRequest ──1:N──> WorkflowStep                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API 接口设计

### 4.1 RESTful API 规范

```
Base URL: /api/v1

认证方式: JWT Bearer Token

请求格式: application/json
响应格式: 
{
  "code": 0,           // 0=成功, 非0=错误
  "message": "success",
  "data": { ... }
}
```

### 4.2 核心接口列表

#### 用户与认证
```
POST   /auth/login          # 登录
POST   /auth/logout         # 登出
GET    /auth/me            # 当前用户信息
POST   /auth/refresh        # 刷新Token
```

#### 基础设置
```
GET    /schools/:id
GET    /departments
GET    /majors
GET    /majors/:id/courses
GET    /classes
GET    /classes/:id/students
```

#### 人才培养计划
```
GET    /students/:id/development-plan
POST   /development-plans
PUT    /development-plans/:id
POST   /development-plans/:id/submit      # 提交审批
POST   /development-plans/:id/approve     # 审批
POST   /development-plans/:id/reject      # 拒绝
```

#### 课程管理
```
GET    /courses
POST   /courses
GET    /courses/:id
GET    /courses/:id/standard
PUT    /courses/:id/standard               # 更新课标
```

#### 排课系统
```
GET    /schedules?year=2024&semester=1
POST   /schedules/generate                  # 生成排课
GET    /schedules/:id/conflicts
PUT    /schedules/:id/entries/:entryId      # 调整单个条目
POST   /schedules/:id/publish               # 发布课表
GET    /schedules/public                     # 公开查询
```

#### 授课计划与教案
```
GET    /teachers/:id/teaching-plans
POST   /teaching-plans
GET    /teaching-plans/:id
PUT    /teaching-plans/:id
GET    /teaching-plans/:id/lesson-plans
POST   /lesson-plans
PUT    /lesson-plans/:id
POST   /lesson-plans/:id/submit             # 提交审查
POST   /lesson-plans/:id/review             # 审查
```

#### 教材管理
```
GET    /textbooks
POST   /textbooks
GET    /textbook-orders
POST   /textbook-orders                     # 申请订购
POST   /textbook-orders/:id/approve         # 审批
POST   /textbook-orders/:id/receive         # 入库确认
```

#### 请假审批
```
GET    /leaves                               # 查询请假列表
POST   /leaves                               # 提交请假
GET    /leaves/:id
POST   /leaves/:id/approve                   # 审批
POST   /leaves/:id/reject                    # 拒绝
GET    /leaves/student/:studentId           # 学生的请假记录
```

---

## 5. 验收标准

### 5.1 功能验收

| 模块 | 验收条件 |
|------|---------|
| 人才培养计划 | 制定→提交→审批 全流程通 |
| 课程管理 | 课程CRUD + 课标关联 |
| 排课系统 | 自动排课 + 冲突检测 + 手动调整 |
| 授课计划 | 计划制定 + 周计划编辑 |
| 教案审查 | 提交→审查→修改→审批 闭环 |
| 教材订购 | 申请→汇总→审批→入库 |
| 请假审批 | 学生申请→多级审批 |
| 小程序 | 课表/成绩/请假 基础功能 |

### 5.2 非功能验收

| 指标 | 标准 |
|------|------|
| 响应时间 | API < 200ms, 页面 < 1s |
| 并发能力 | 支持 500+ 同时在线 |
| 可用性 | 99.9% uptime |
| 数据安全 | 敏感数据加密, 操作审计 |

---

## 6. 开发计划 (基于 gstack)

### Phase 1: 基础架构 (2周)
- [ ] 项目脚手架 (前后端)
- [ ] 认证/权限系统
- [ ] 基础数据管理 (学校/专业/班级)
- [ ] 数据库设计与迁移

### Phase 2: 核心功能 MVP (3周)
- [ ] 人才培养计划
- [ ] 课程管理
- [ ] 排课系统 (简化版)
- [ ] 成绩管理（录入/批量导入/审核/发布）

### Phase 3: 审批流程 (2周)
- [ ] 授课计划与教案审查
- [ ] 请假审批流
- [ ] 教材订购审批

### Phase 4: 小程序 & 优化 (2周)
- [ ] 微信小程序基础功能
- [ ] 性能优化
- [ ] 部署上线

---

## 7. 附录

### 7.1 术语表

| 术语 | 说明 |
|------|------|
| 技工院校 | 实施技工教育的职业院校 |
| 培养方案 | 专业人才培养的总体规划 |
| 课标 | 课程标准, 规定课程教学目标/内容/方法 |
| 大节 | 连续的2节课(90-180分钟) |
| 班主任 | 负责一个班级日常管理的教师 |

### 7.2 决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-30 | 选择前后端分离架构 | 支持小程序 + Web + 未来APP |
| 2026-03-30 | 选择 NestJS | TypeScript 统一, 生态好, 适合企业级 |
| 2026-03-30 | 选择 MySQL | 关系型数据, 成熟稳定, 本地部署方便 |

---

*本规格说明书使用 SDD 方法论制定，代码实现前需通过评审。*
