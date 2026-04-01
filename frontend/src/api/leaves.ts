import request from './request';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  type: 'SICK' | 'PERSONAL' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvals?: LeaveApproval[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveApproval {
  approverId: string;
  approverName: string;
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
  decidedAt: string;
}

export interface CreateLeaveDto {
  type: 'SICK' | 'PERSONAL' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
}

export const leavesApi = {
  // 获取请假列表
  findAll: (params?: { status?: LeaveStatus }) => {
    return request.get('/api/v1/leaves', { params }) as Promise<{ success: boolean; data: Leave[] }>;
  },

  // 获取请假详情
  findOne: (id: string) => {
    return request.get(`/api/v1/leaves/${id}`) as Promise<{ success: boolean; data: Leave }>;
  },

  // 创建请假申请
  create: (data: CreateLeaveDto) => {
    return request.post('/api/v1/leaves', data) as Promise<{ success: boolean; data: Leave }>;
  },

  // 审批请假
  approve: (id: string, data: { decision: 'APPROVED' | 'REJECTED'; comment?: string }) => {
    return request.post(`/api/v1/leaves/${id}/approve`, data);
  },

  // 取消请假
  cancel: (id: string) => {
    return request.delete(`/api/v1/leaves/${id}`) as Promise<{ success: boolean }>;
  },
};
