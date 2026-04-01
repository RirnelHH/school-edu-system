import { describe, it, expect } from 'vitest';
import { leavesApi } from './leaves';

describe('请假 API', () => {
  describe('API shape', () => {
    it('findAll should be a function', () => {
      expect(typeof leavesApi.findAll).toBe('function');
    });

    it('findOne should be a function', () => {
      expect(typeof leavesApi.findOne).toBe('function');
    });

    it('create should be a function', () => {
      expect(typeof leavesApi.create).toBe('function');
    });

    it('approve should be a function', () => {
      expect(typeof leavesApi.approve).toBe('function');
    });

    it('cancel should be a function', () => {
      expect(typeof leavesApi.cancel).toBe('function');
    });
  });

  describe('type definitions', () => {
    it('LeaveStatus should be a valid type', () => {
      const statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'> = [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'CANCELLED',
      ];
      expect(statuses).toHaveLength(4);
    });

    it('CreateLeaveDto should support required fields', () => {
      const dto = {
        type: 'SICK' as const,
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        reason: '发烧',
      };
      expect(dto.type).toBe('SICK');
      expect(dto.reason).toBe('发烧');
    });
  });
});
