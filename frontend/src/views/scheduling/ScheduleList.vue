<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">排课列表</h2>
      <div class="header-actions">
        <el-select v-model="semesterId" placeholder="选择学期" clearable style="width: 150px; margin-right: 10px" @change="fetchVersions">
          <el-option label="2024-2025-1" value="2024-2025-1" />
          <el-option label="2024-2025-2" value="2024-2025-2" />
        </el-select>
        <el-button type="primary" @click="handleCreateVersion">新建版本</el-button>
      </div>
    </div>

    <!-- 版本列表 -->
    <el-card class="mt-4" v-loading="loading">
      <template #header>
        <span>排课版本</span>
      </template>
      <el-table :data="versions" stripe>
        <el-table-column prop="name" label="版本名称" min-width="160" />
        <el-table-column prop="semesterId" label="学期" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small">
              {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="当前版本" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isActive" type="success" size="small">是</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEditVersion(row)">编辑</el-button>
            <el-button size="small" @click="handleViewSchedule(row)">查看课表</el-button>
            <el-button size="small" type="warning" @click="handlePublish(row)" :disabled="row.status === 'PUBLISHED'">发布</el-button>
            <el-button size="small" type="danger" @click="handleDeleteVersion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { schedulingApi, type ScheduleVersion } from '@/api/scheduling';

const router = useRouter();
const loading = ref(false);
const semesterId = ref('2024-2025-1');
const versions = ref<ScheduleVersion[]>([]);

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchVersions() {
  loading.value = true;
  try {
    const res = await schedulingApi.getVersions(semesterId.value);
    versions.value = res.data || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取版本列表失败');
  } finally {
    loading.value = false;
  }
}

function handleCreateVersion() {
  router.push({ name: 'ScheduleEdit', query: { semesterId: semesterId.value } });
}

function handleEditVersion(row: ScheduleVersion) {
  router.push({ name: 'ScheduleEdit', params: { id: row.id } });
}

function handleViewSchedule(row: ScheduleVersion) {
  router.push({ name: 'ScheduleEdit', params: { id: row.id } });
}

async function handlePublish(row: ScheduleVersion) {
  try {
    await ElMessageBox.confirm('发布后版本将无法编辑，确定要发布吗？', '提示', { type: 'warning' });
    await schedulingApi.publishVersion(row.id);
    ElMessage.success('发布成功');
    fetchVersions();
  } catch {
    // cancelled
  }
}

async function handleDeleteVersion(row: ScheduleVersion) {
  try {
    await ElMessageBox.confirm('确定要删除该版本吗？', '提示', { type: 'warning' });
    ElMessage.success('删除成功（演示）');
    fetchVersions();
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchVersions();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; }
.mt-4 { margin-top: 16px; }
</style>
