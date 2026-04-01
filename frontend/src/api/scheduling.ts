import request from './request';

// ========== 排课版本 ==========

export interface ScheduleVersion {
  id: string;
  semesterId: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEntry {
  id: string;
  scheduleVersionId: string;
  classId: string;
  className?: string;
  courseId: string;
  courseName?: string;
  teacherId: string;
  teacherName?: string;
  roomId: string;
  roomName?: string;
  weekday: number;
  periodStart: number;
  periodEnd: number;
  weekStart?: number;
  weekEnd?: number;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: 'TEACHER' | 'ROOM' | 'CLASS';
    entryId: string;
    message: string;
  }>;
}

export const schedulingApi = {
  // ========== 版本管理 ==========

  // 创建排课版本
  createVersion: (data: { semesterId: string; name: string }) => {
    return request.post('/api/v1/scheduling/versions', data);
  },

  // 获取版本列表
  getVersions: (semesterId: string) => {
    return request.get('/api/v1/scheduling/versions', { params: { semesterId } }) as Promise<{
      success: boolean;
      data: ScheduleVersion[];
    }>;
  },

  // 获取版本详情（含条目）
  getVersionDetail: (id: string) => {
    return request.get(`/api/v1/scheduling/versions/${id}`) as Promise<{
      success: boolean;
      data: ScheduleVersion & { entries: ScheduleEntry[] };
    }>;
  },

  // 发布版本
  publishVersion: (id: string) => {
    return request.post(`/api/v1/scheduling/versions/${id}/publish`);
  },

  // ========== 排课条目 ==========

  // 添加条目
  addEntry: (data: Partial<ScheduleEntry>) => {
    return request.post('/api/v1/scheduling/entries', data);
  },

  // 更新条目
  updateEntry: (id: string, data: Partial<ScheduleEntry>) => {
    return request.put(`/api/v1/scheduling/entries/${id}`, data);
  },

  // 删除条目
  deleteEntry: (id: string) => {
    return request.delete(`/api/v1/scheduling/entries/${id}`);
  },

  // ========== 查询 ==========

  // 班级课表
  getClassSchedule: (classId: string, versionId?: string) => {
    return request.get(`/api/v1/scheduling/class/${classId}`, { params: { versionId } }) as Promise<{
      success: boolean;
      data: ScheduleEntry[];
    }>;
  },

  // 教师课表
  getTeacherSchedule: (teacherId: string, versionId?: string) => {
    return request.get(`/api/v1/scheduling/teacher/${teacherId}`, { params: { versionId } }) as Promise<{
      success: boolean;
      data: ScheduleEntry[];
    }>;
  },

  // 教室课表
  getRoomSchedule: (roomId: string, versionId?: string) => {
    return request.get(`/api/v1/scheduling/room/${roomId}`, { params: { versionId } }) as Promise<{
      success: boolean;
      data: ScheduleEntry[];
    }>;
  },

  // 冲突检测
  checkConflicts: (data: {
    scheduleVersionId?: string;
    roomId?: string;
    teacherId?: string;
    classId?: string;
    weekday?: number;
    periodStart?: number;
    periodEnd?: number;
  }) => {
    return request.post('/api/v1/scheduling/check-conflicts', data) as Promise<{
      success: boolean;
      data: ConflictResult;
    }>;
  },

  // 自动排课
  autoSchedule: (data: any) => {
    return request.post('/api/v1/scheduling/auto', data);
  },
};
