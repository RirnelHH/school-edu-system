import request from './request';

export type GradeStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  courseId: string;
  courseName?: string;
  semesterId: string;
  score?: number;
  grade?: string;
  status: GradeStatus;
  examType?: 'MIDTERM' | 'FINAL' | 'MAKEUP';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export const gradesApi = {
  // 获取成绩列表
  findAll: (params?: { classId?: string; courseId?: string; semesterId?: string; status?: string }) => {
    return request.get('/api/v1/grades', { params }) as Promise<{ success: boolean; data: GradeRecord[] }>;
  },

  // 获取单个成绩
  findOne: (id: string) => {
    return request.get(`/api/v1/grades/${id}`) as Promise<{ success: boolean; data: GradeRecord }>;
  },

  // 录入/更新成绩
  upsert: (data: Partial<GradeRecord>) => {
    return request.post('/api/v1/grades', data);
  },

  // 批量导入
  importGrades: (data: any[]) => {
    return request.post('/api/v1/grades/import', { data });
  },

  // 提交成绩
  submit: (id: string) => {
    return request.post(`/api/v1/grades/${id}/submit`);
  },

  // 审批成绩
  approve: (id: string, data: { approved: boolean; comment?: string }) => {
    return request.post(`/api/v1/grades/${id}/approve`, data);
  },

  // 删除成绩
  delete: (id: string) => {
    return request.delete(`/api/v1/grades/${id}`);
  },
};
