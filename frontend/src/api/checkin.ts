import request from './request';

export interface CheckinRecord {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  checkinTime?: string;
  checkoutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  remark?: string;
  createdAt: string;
}

export interface CheckinStats {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  rate: number;
}

export const checkinApi = {
  // 签到
  checkin: (data?: { remark?: string }) => {
    return request.post('/api/v1/checkin', data || {});
  },

  // 获取当日签到记录
  getTodayRecords: (date?: string) => {
    return request.get('/api/v1/checkin/today', { params: { date } }) as Promise<{
      success: boolean;
      data: CheckinRecord[];
    }>;
  },

  // 获取签到列表
  findAll: (params?: { date?: string; classId?: string; status?: string }) => {
    return request.get('/api/v1/checkin', { params }) as Promise<{ success: boolean; data: CheckinRecord[] }>;
  },

  // 获取统计
  getStats: (params?: { startDate?: string; endDate?: string; classId?: string }) => {
    return request.get('/api/v1/checkin/stats', { params }) as Promise<{
      success: boolean;
      data: CheckinStats[];
    }>;
  },

  // 更新签到状态
  updateStatus: (id: string, status: string, remark?: string) => {
    return request.put(`/api/v1/checkin/${id}`, { status, remark });
  },
};
