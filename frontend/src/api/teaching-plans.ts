import request from './request';

// ========== 授课计划 ==========

export interface TeachingPlan {
  id: string;
  name: string;
  courseId: string;
  semesterId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'TEACHER_APPROVED' | 'GROUP_LEADER_APPROVED' | 'APPROVED';
  teacherIds: string[];
  groupLeaderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeachingPlanDto {
  name: string;
  courseId: string;
  semesterId: string;
  teacherIds: string[];
  groupLeaderId: string;
}

export const teachingPlansApi = {
  // 获取授课计划列表
  findAll: (params?: { courseId?: string; semesterId?: string; status?: string; teacherId?: string }) => {
    return request.get('/api/v1/teaching-plans', { params }) as Promise<{ success: boolean; data: TeachingPlan[] }>;
  },

  // 获取单个授课计划
  findOne: (id: string) => {
    return request.get(`/api/v1/teaching-plans/${id}`) as Promise<{ success: boolean; data: TeachingPlan }>;
  },

  // 获取授课计划（含内容条目）
  getWithEntries: (id: string) => {
    return request.get(`/api/v1/teaching-plans/${id}/entries`);
  },

  // 创建授课计划
  create: (data: CreateTeachingPlanDto) => {
    return request.post('/api/v1/teaching-plans', data);
  },

  // 提交授课计划
  submit: (id: string, data: { data: any }) => {
    return request.post(`/api/v1/teaching-plans/${id}/submit`, data);
  },

  // 多教师审核
  teacherApprove: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/teaching-plans/${id}/teacher-approve`, data);
  },

  // 教研组长审核
  groupLeaderApprove: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/teaching-plans/${id}/group-leader-approve`, data);
  },

  // 导入Excel
  importExcel: (id: string, data: any[]) => {
    return request.post(`/api/v1/teaching-plans/${id}/import-excel`, { data });
  },
};

// ========== 教案 ==========

export interface LessonPlan {
  id: string;
  teachingPlanId: string;
  title: string;
  weekNumber: number;
  content: string;
  attachmentUrl?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'TEACHER_APPROVED' | 'GROUP_LEADER_APPROVED' | 'DIRECTOR_APPROVED';
  createdAt: string;
  updatedAt: string;
}

export const lessonPlansApi = {
  // 获取教案列表
  findAll: (teachingPlanId: string) => {
    return request.get(`/api/v1/teaching-plans/lesson-plans/${teachingPlanId}`) as Promise<{ success: boolean; data: LessonPlan[] }>;
  },

  // 获取单个教案
  findOne: (id: string) => {
    return request.get(`/api/v1/teaching-plans/lesson-plans/detail/${id}`) as Promise<{ success: boolean; data: LessonPlan }>;
  },

  // 创建教案
  create: (data: Partial<LessonPlan>) => {
    return request.post('/api/v1/teaching-plans/lesson-plans', data);
  },

  // 更新教案
  update: (id: string, data: Partial<LessonPlan>) => {
    return request.put(`/api/v1/teaching-plans/lesson-plans/${id}`, data);
  },

  // 上传教案附件
  uploadAttachment: (id: string, attachmentUrl: string) => {
    return request.put(`/api/v1/teaching-plans/lesson-plans/${id}/attachment`, { attachmentUrl });
  },

  // 提交教案
  submit: (id: string) => {
    return request.post(`/api/v1/teaching-plans/lesson-plans/${id}/submit`);
  },

  // 教师审核教案
  teacherApprove: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/teaching-plans/lesson-plans/${id}/teacher-approve`, data);
  },

  // 教研组长审核教案
  groupLeaderApprove: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/teaching-plans/lesson-plans/${id}/group-leader-approve`, data);
  },

  // 主任审批教案
  directorApprove: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/teaching-plans/lesson-plans/${id}/director-approve`, data);
  },
};
