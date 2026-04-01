import request from './request';

export interface Textbook {
  id: string;
  name: string;
  isbn: string;
  author: string;
  publisher: string;
  price: number;
  edition?: string;
  courseId?: string;
  courseName?: string;
  semesterId?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  semesterId: string;
  classId: string;
  className?: string;
  textbookId: string;
  textbookName?: string;
  quantity: number;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'DISTRIBUTED';
  orderedAt?: string;
  receivedAt?: string;
  remark?: string;
  createdAt: string;
}

export const textbooksApi = {
  // ========== 教材 ==========

  // 获取教材列表
  findAll: (params?: { courseId?: string; semesterId?: string }) => {
    return request.get('/api/v1/textbooks', { params }) as Promise<{
      success: boolean;
      data: Textbook[];
    }>;
  },

  // 获取单个教材
  findOne: (id: string) => {
    return request.get(`/api/v1/textbooks/${id}`) as Promise<{
      success: boolean;
      data: Textbook;
    }>;
  },

  // 创建教材
  create: (data: Partial<Textbook>) => {
    return request.post('/api/v1/textbooks', data);
  },

  // 更新教材
  update: (id: string, data: Partial<Textbook>) => {
    return request.put(`/api/v1/textbooks/${id}`, data);
  },

  // 删除教材
  delete: (id: string) => {
    return request.delete(`/api/v1/textbooks/${id}`);
  },

  // ========== 订购记录 ==========

  // 获取订购列表
  getOrders: (params?: { semesterId?: string; classId?: string; status?: string }) => {
    return request.get('/api/v1/textbooks/orders', { params }) as Promise<{
      success: boolean;
      data: OrderRecord[];
    }>;
  },

  // 创建订购
  createOrder: (data: Partial<OrderRecord>) => {
    return request.post('/api/v1/textbooks/orders', data);
  },

  // 更新订购状态
  updateOrder: (id: string, data: Partial<OrderRecord>) => {
    return request.put(`/api/v1/textbooks/orders/${id}`, data);
  },

  // 删除订购
  deleteOrder: (id: string) => {
    return request.delete(`/api/v1/textbooks/orders/${id}`);
  },
};
