<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <h3>教务管理</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-sub-menu index="users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/users">用户列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="base">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>基础数据</span>
          </template>
          <el-menu-item index="/schools">学校管理</el-menu-item>
          <el-menu-item index="/departments">院系管理</el-menu-item>
          <el-menu-item index="/majors">专业管理</el-menu-item>
          <el-menu-item index="/classes">班级管理</el-menu-item>
          <el-menu-item index="/students">学生管理</el-menu-item>
        </el-sub-menu>

        <!-- 授课计划 -->
        <el-sub-menu index="teaching-plans">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>授课计划</span>
          </template>
          <el-menu-item index="/teaching-plans">授课计划列表</el-menu-item>
        </el-sub-menu>

        <!-- 请假 -->
        <el-sub-menu index="leaves">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>请假管理</span>
          </template>
          <el-menu-item index="/leaves">请假申请</el-menu-item>
        </el-sub-menu>

        <!-- 课时统计 -->
        <el-sub-menu index="teaching-hours">
          <template #title>
            <el-icon><Timer /></el-icon>
            <span>课时管理</span>
          </template>
          <el-menu-item index="/teaching-hours">课时统计</el-menu-item>
          <el-menu-item index="/teaching-hours/coefficients">系数配置</el-menu-item>
        </el-sub-menu>

        <!-- 排课管理 -->
        <el-sub-menu index="scheduling">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>排课管理</span>
          </template>
          <el-menu-item index="/scheduling">排课列表</el-menu-item>
          <el-menu-item index="/scheduling/conflicts">冲突检测</el-menu-item>
        </el-sub-menu>

        <!-- 成绩管理 -->
        <el-sub-menu index="grades">
          <template #title>
            <el-icon><Histogram /></el-icon>
            <span>成绩管理</span>
          </template>
          <el-menu-item index="/grades">成绩列表</el-menu-item>
          <el-menu-item index="/grades/entry">成绩录入</el-menu-item>
        </el-sub-menu>

        <!-- 签到管理 -->
        <el-sub-menu index="checkin">
          <template #title>
            <el-icon><Clock /></el-icon>
            <span>签到管理</span>
          </template>
          <el-menu-item index="/checkin">每日签到</el-menu-item>
          <el-menu-item index="/checkin/stats">签到统计</el-menu-item>
        </el-sub-menu>

        <!-- 培养计划 -->
        <el-sub-menu index="development-plans">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>培养计划</span>
          </template>
          <el-menu-item index="/development-plans">培养计划列表</el-menu-item>
        </el-sub-menu>

        <!-- 教材管理 -->
        <el-sub-menu index="textbooks">
          <template #title>
            <el-icon><Books /></el-icon>
            <span>教材管理</span>
          </template>
          <el-menu-item index="/textbooks">教材列表</el-menu-item>
          <el-menu-item index="/textbooks/orders">教材订购</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ authStore.userInfo?.user?.name || '用户' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeMenu = computed(() => route.path);

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
    }).then(() => {
      authStore.logout();
      router.push('/login');
    });
  } else if (command === 'profile') {
    // 个人中心
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.logo h3 {
  color: #fff;
  font-size: 16px;
}

.el-menu-vertical {
  border-right: none;
  background-color: transparent;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.main {
  background-color: #f5f7fa;
}
</style>
