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
