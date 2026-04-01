import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' },
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理' },
      },
      // 基础数据
      {
        path: 'schools',
        name: 'Schools',
        component: () => import('@/views/base/SchoolList.vue'),
        meta: { title: '学校管理' },
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/base/DepartmentList.vue'),
        meta: { title: '院系管理' },
      },
      {
        path: 'majors',
        name: 'Majors',
        component: () => import('@/views/base/MajorList.vue'),
        meta: { title: '专业管理' },
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/base/ClassList.vue'),
        meta: { title: '班级管理' },
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/base/StudentList.vue'),
        meta: { title: '学生管理' },
      },

      // ===== P1: 核心审批流程 =====
      // 授课计划
      {
        path: 'teaching-plans',
        name: 'TeachingPlans',
        component: () => import('@/views/teaching-plans/TeachingPlanList.vue'),
        meta: { title: '授课计划' },
      },
      {
        path: 'teaching-plans/:id/approve',
        name: 'TeachingPlanApprove',
        component: () => import('@/views/teaching-plans/TeachingPlanApprove.vue'),
        meta: { title: '授课计划审批' },
      },
      {
        path: 'teaching-plans/:teachingPlanId/lesson-plans',
        name: 'LessonPlans',
        component: () => import('@/views/teaching-plans/LessonPlanList.vue'),
        meta: { title: '教案列表' },
      },
      // 请假
      {
        path: 'leaves',
        name: 'Leaves',
        component: () => import('@/views/leaves/LeaveList.vue'),
        meta: { title: '请假申请' },
      },
      {
        path: 'leaves/:id/approve',
        name: 'LeaveApprove',
        component: () => import('@/views/leaves/LeaveApprove.vue'),
        meta: { title: '请假审批' },
      },
      // 课时统计
      {
        path: 'teaching-hours',
        name: 'TeachingHours',
        component: () => import('@/views/teaching-hours/TeachingHoursList.vue'),
        meta: { title: '课时统计' },
      },
      {
        path: 'teaching-hours/coefficients',
        name: 'CoefficientConfig',
        component: () => import('@/views/teaching-hours/CoefficientConfig.vue'),
        meta: { title: '系数配置' },
      },

      // ===== P2: 排课与成绩 =====
      // 排课
      {
        path: 'scheduling',
        name: 'Scheduling',
        component: () => import('@/views/scheduling/ScheduleList.vue'),
        meta: { title: '排课管理' },
      },
      {
        path: 'scheduling/edit/:id?',
        name: 'ScheduleEdit',
        component: () => import('@/views/scheduling/ScheduleEdit.vue'),
        meta: { title: '排课编辑' },
      },
      {
        path: 'scheduling/conflicts',
        name: 'ConflictCheck',
        component: () => import('@/views/scheduling/ConflictCheck.vue'),
        meta: { title: '冲突检测' },
      },
      // 成绩
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('@/views/grades/GradeList.vue'),
        meta: { title: '成绩管理' },
      },
      {
        path: 'grades/entry',
        name: 'GradeEntry',
        component: () => import('@/views/grades/GradeEntry.vue'),
        meta: { title: '成绩录入' },
      },
      {
        path: 'grades/:id/approve',
        name: 'GradeApprove',
        component: () => import('@/views/grades/GradeApprove.vue'),
        meta: { title: '成绩审批' },
      },

      // ===== P3: 其他核心模块 =====
      // 签到
      {
        path: 'checkin',
        name: 'DailyCheckin',
        component: () => import('@/views/checkin/DailyCheckin.vue'),
        meta: { title: '每日签到' },
      },
      {
        path: 'checkin/stats',
        name: 'CheckinStats',
        component: () => import('@/views/checkin/CheckinStats.vue'),
        meta: { title: '签到统计' },
      },
      // 培养计划
      {
        path: 'development-plans',
        name: 'DevelopmentPlans',
        component: () => import('@/views/development-plans/PlanList.vue'),
        meta: { title: '培养计划' },
      },
      {
        path: 'development-plans/:id/approve',
        name: 'PlanApprove',
        component: () => import('@/views/development-plans/PlanApprove.vue'),
        meta: { title: '培养计划审批' },
      },
      // 教材
      {
        path: 'textbooks',
        name: 'Textbooks',
        component: () => import('@/views/textbooks/TextbookList.vue'),
        meta: { title: '教材管理' },
      },
      {
        path: 'textbooks/orders',
        name: 'TextbookOrders',
        component: () => import('@/views/textbooks/OrderList.vue'),
        meta: { title: '教材订购' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false);

  if (requiresAuth && !authStore.token) {
    next('/login');
  } else if (to.path === '/login' && authStore.token) {
    next('/');
  } else {
    next();
  }
});

export default router;
