import request from './request';

export interface TeachingHoursRecord {
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseName: string;
  classSize: number;
  classSizeCoefficient: number;
  duplicateCoefficient: number;
  baseHours: number;
  totalHours: number;
  semesterId: string;
}

export interface CoefficientItem {
  range?: string;
  coefficient: number;
  description?: string;
  rank?: number;
}

export const teachingHoursApi = {
  // 计算单个教师课时
  calculateTeacherHours: (teacherId: string, semesterId: string) => {
    return request.post(`/api/v1/teaching-hours/calculate/${teacherId}`, { semesterId }) as Promise<{
      success: boolean;
      data: TeachingHoursRecord[];
    }>;
  },

  // 计算所有教师课时
  calculateAllTeachersHours: (semesterId: string) => {
    return request.post('/api/v1/teaching-hours/calculate-all', { semesterId }) as Promise<{
      success: boolean;
      data: TeachingHoursRecord[];
    }>;
  },

  // 获取班级人数系数
  getClassSizeCoefficients: () => {
    return request.get('/api/v1/teaching-hours/coefficients/class-size') as Promise<{
      success: boolean;
      data: CoefficientItem[];
    }>;
  },

  // 获取重复课时系数
  getDuplicateCoefficients: () => {
    return request.get('/api/v1/teaching-hours/coefficients/duplicate') as Promise<{
      success: boolean;
      data: CoefficientItem[];
    }>;
  },
};
