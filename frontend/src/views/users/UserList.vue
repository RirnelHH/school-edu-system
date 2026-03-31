<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="accountType" label="账号类型">
        <template #default="{ row }">
          <el-tag :type="getType(row.accountType)">
            {{ getLabel(row.accountType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="user.name" label="姓名" />
      <el-table-column prop="user.email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ row.status === 'ACTIVE' ? '正常' : '已锁定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, prev, pager, next"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, del } from '@/api/request';

const loading = ref(false);
const tableData = ref<any[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

async function fetchData() {
  loading.value = true;
  try {
    const res = await get('/api/v1/users');
    tableData.value = res;
    pagination.total = res.length;
  } catch (e) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  ElMessage.info('新增功能开发中');
}

function handleEdit(_row: any) {
  ElMessage.info('编辑功能开发中');
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' });
    await del(`/api/v1/users/${row.id}`);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
}

function getType(type: string) {
  const map: Record<string, any> = {
    STUDENT: 'info',
    TEACHER: 'warning',
    ADMIN: 'danger',
  };
  return map[type] || 'info';
}

function getLabel(type: string) {
  const map: Record<string, string> = {
    STUDENT: '学生',
    TEACHER: '教师',
    ADMIN: '管理员',
  };
  return map[type] || type;
}

onMounted(() => {
  fetchData();
});
</script>
