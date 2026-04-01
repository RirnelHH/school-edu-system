import request from './request';

export type PlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface DevelopmentPlan {
  id: string;
  name: string;
  majorId: string;
  majorName?: string;
  semesterId: string;
  year: number;
  status: PlanStatus;
  version: string;
  courses: any[];
  totalCredits: number;
  createdAt: string;
  updatedAt: string;
}

export const developmentPlansApi = {
  // 获取列表
  findAll: (params?: { majorId?: string; status?: string }) => {
    return request.get('/api/v1/development-plans', { params }) as Promise<{
      success: boolean;
      data: DevelopmentPlan[];
    }>;
  },

  // 获取单个
  findOne: (id: string) => {
    return request.get(`/api/v1/development-plans/${id}`) as Promise<{
      success: boolean;
      data: DevelopmentPlan;
    }>;
  },

  // 创建
  create: (data: Partial<DevelopmentPlan>) => {
    return request.post('/api/v1/development-plans', data);
  },

  // 更新
  update: (id: string, data: Partial<DevelopmentPlan>) => {
    return request.put(`/api/v1/development-plans/${id}`, data);
  },

  // 提交
  submit: (id: string) => {
    return request.post(`/api/v1/development-plans/${id}/submit`);
  },

  // 审批通过
  approve: (id: string, data?: { comment?: string }) => {
    return request.post(`/api/v1/development-plans/${id}/approve`, data || {});
  },

  // 驳回
  reject: (id: string, data: { reason: string }) => {
    return request.post(`/api/v1/development-plans/${id}/reject`, data);
  },

  // 删除
  delete: (id: string) => {
    return request.delete(`/api/v1/development-plans/${id}`);
  },
};
