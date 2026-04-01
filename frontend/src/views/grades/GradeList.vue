<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">成绩列表</h2>
      <div class="header-actions">
        <el-select v-model="filterClassId" placeholder="选择班级" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
          <el-option label="全部班级" value="" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已提交" value="SUBMITTED" />
          <el-option label="已审批" value="APPROVED" />
        </el-select>
        <el-button type="primary" @click="router.push({ name: 'GradeEntry' })">录入成绩</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="studentName" label="学生姓名" width="120" />
      <el-table-column prop="className" label="班级" width="140" />
      <el-table-column prop="courseName" label="课程" min-width="160" />
      <el-table-column prop="score" label="分数" width="80">
        <template #default="{ row }">
          <span :class="scoreClass(row.score)">{{ row.score ?? '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="grade" label="等级" width="80" />
      <el-table-column prop="examType" label="考试类型" width="100">
        <template #default="{ row }">
          {{ examTypeText(row.examType) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleApprove(row)" :disabled="row.status !== 'SUBMITTED'">审批</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { gradesApi, type GradeRecord } from '@/api/grades';

const router = useRouter();
const loading = ref(false);
const tableData = ref<GradeRecord[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterClassId = ref('');
const filterStatus = ref('');

function examTypeText(type?: string) {
  return { MIDTERM: '期中', FINAL: '期末', MAKEUP: '补考' }[type || ''] || '-';
}

function statusText(status: string) {
  return { DRAFT: '草稿', SUBMITTED: '已提交', APPROVED: '已审批' }[status] || status;
}

function statusType(status: string) {
  return { DRAFT: 'info', SUBMITTED: 'warning', APPROVED: 'success' }[status] || 'info';
}

function scoreClass(score?: number) {
  if (score === undefined) return '';
  if (score >= 90) return 'score-a';
  if (score >= 80) return 'score-b';
  if (score >= 70) return 'score-c';
  if (score >= 60) return 'score-d';
  return 'score-f';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await gradesApi.findAll({
      classId: filterClassId.value || undefined,
      status: filterStatus.value || undefined,
    });
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleEdit(row: GradeRecord) {
  router.push({ name: 'GradeEntry', query: { id: row.id } });
}

async function handleApprove(row: GradeRecord) {
  try {
    await gradesApi.approve(row.id, { approved: true });
    ElMessage.success('审批通过');
    fetchData();
  } catch (e: any) {
    ElMessage.error(e.message || '审批失败');
  }
}

async function handleDelete(row: GradeRecord) {
  try {
    await ElMessageBox.confirm('确定要删除该成绩记录吗？', '提示', { type: 'warning' });
    await gradesApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // cancelled
  }
}

fetchData();
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; flex-wrap: wrap; }
.mt-4 { margin-top: 16px; }
.score-a { color: #67c23a; font-weight: bold; }
.score-b { color: #85ce61; font-weight: bold; }
.score-c { color: #e6a23c; font-weight: bold; }
.score-d { color: #f56c6c; font-weight: bold; }
.score-f { color: #f56c6c; font-weight: bold; }
</style>
