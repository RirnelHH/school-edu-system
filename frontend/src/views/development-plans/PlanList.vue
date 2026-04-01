<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">培养计划列表</h2>
      <el-button type="primary" @click="handleAdd">新增计划</el-button>
    </div>

    <div class="filter-bar mt-4">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
        <el-option label="全部" value="" />
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已提交" value="SUBMITTED" />
        <el-option label="已通过" value="APPROVED" />
        <el-option label="已驳回" value="REJECTED" />
      </el-select>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="name" label="计划名称" min-width="200" />
      <el-table-column prop="majorName" label="专业" width="160" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="version" label="版本" width="100" />
      <el-table-column prop="totalCredits" label="总学分" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleEdit(row)" :disabled="row.status !== 'DRAFT'">编辑</el-button>
          <el-button size="small" type="success" @click="handleApprove(row)" :disabled="row.status !== 'SUBMITTED'">审批</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)" :disabled="row.status !== 'DRAFT'">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="专业ID" prop="majorId">
          <el-input v-model="formData.majorId" placeholder="请输入专业ID" />
        </el-form-item>
        <el-form-item label="学期ID" prop="semesterId">
          <el-input v-model="formData.semesterId" placeholder="请输入学期ID" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input-number v-model="formData.year" :min="2020" :max="2030" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="formData.version" placeholder="如: v1.0" />
        </el-form-item>
        <el-form-item label="总学分" prop="totalCredits">
          <el-input-number v-model="formData.totalCredits" :min="0" :max="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { developmentPlansApi, type DevelopmentPlan } from '@/api/development-plans';

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const tableData = ref<DevelopmentPlan[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterStatus = ref('');
const dialogVisible = ref(false);
const dialogTitle = ref('新增培养计划');
const editingId = ref('');
const formRef = ref<FormInstance>();

const formData = reactive({
  name: '',
  majorId: '',
  semesterId: '2024-2025-1',
  year: new Date().getFullYear(),
  version: 'v1.0',
  totalCredits: 0,
});

const formRules: FormRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  majorId: [{ required: true, message: '请输入专业ID', trigger: 'blur' }],
};

function statusText(status: string) {
  return { DRAFT: '草稿', SUBMITTED: '已提交', APPROVED: '已通过', REJECTED: '已驳回' }[status] || status;
}

function statusType(status: string) {
  return { DRAFT: 'info', SUBMITTED: 'warning', APPROVED: 'success', REJECTED: 'danger' }[status] || 'info';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await developmentPlansApi.findAll({ status: filterStatus.value || undefined });
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  dialogTitle.value = '新增培养计划';
  editingId.value = '';
  dialogVisible.value = true;
}

function handleEdit(row: DevelopmentPlan) {
  dialogTitle.value = '编辑培养计划';
  editingId.value = row.id;
  formData.name = row.name;
  formData.majorId = row.majorId;
  formData.semesterId = row.semesterId;
  formData.year = row.year;
  formData.version = row.version;
  formData.totalCredits = row.totalCredits;
  dialogVisible.value = true;
}

function handleView(row: DevelopmentPlan) {
  router.push({ name: 'PlanApprove', params: { id: row.id } });
}

async function handleApprove(row: DevelopmentPlan) {
  router.push({ name: 'PlanApprove', params: { id: row.id } });
}

async function handleDelete(row: DevelopmentPlan) {
  try {
    await ElMessageBox.confirm('确定要删除该培养计划吗？', '提示', { type: 'warning' });
    await developmentPlansApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // cancelled
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (editingId.value) {
        await developmentPlansApi.update(editingId.value, { ...formData });
        ElMessage.success('编辑成功');
      } else {
        await developmentPlansApi.create({ ...formData });
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      fetchData();
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
}

function resetForm() {
  formRef.value?.resetFields();
}

fetchData();
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
</style>
