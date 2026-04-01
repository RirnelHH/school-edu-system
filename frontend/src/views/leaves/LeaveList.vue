<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">请假申请列表</h2>
      <el-button type="primary" @click="handleAdd">新增请假</el-button>
    </div>

    <div class="filter-bar mt-4">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
        <el-option label="全部" value="" />
        <el-option label="待审批" value="PENDING" />
        <el-option label="已通过" value="APPROVED" />
        <el-option label="已驳回" value="REJECTED" />
        <el-option label="已取消" value="CANCELLED" />
      </el-select>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="studentName" label="学生姓名" width="120" />
      <el-table-column prop="className" label="班级" width="140" />
      <el-table-column prop="type" label="请假类型" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ leaveTypeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="申请时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button size="small" type="danger" @click="handleCancel(row)" :disabled="row.status !== 'PENDING'">取消</el-button>
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
      @size-change="fetchData"
      @current-change="fetchData"
    />

    <!-- 新增请假对话框 -->
    <el-dialog v-model="dialogVisible" title="新增请假申请" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择" style="width: 100%">
            <el-option label="病假" value="SICK" />
            <el-option label="事假" value="PERSONAL" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="formData.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="formData.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" :rows="3" placeholder="请输入请假原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { leavesApi, type Leave } from '@/api/leaves';

const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<Leave[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterStatus = ref('');
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  type: 'PERSONAL',
  startDate: '',
  endDate: '',
  reason: '',
});

const formRules: FormRules = {
  type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }],
};

function leaveTypeText(type: string) {
  return { SICK: '病假', PERSONAL: '事假', OTHER: '其他' }[type] || type;
}

function statusText(status: string) {
  return { PENDING: '待审批', APPROVED: '已通过', REJECTED: '已驳回', CANCELLED: '已取消' }[status] || status;
}

function statusType(status: string) {
  return { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'info' }[status] || 'info';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await leavesApi.findAll({ status: filterStatus.value as any || undefined });
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  dialogVisible.value = true;
}

function handleView(row: Leave) {
  router.push({ name: 'LeaveApprove', params: { id: row.id } });
}

async function handleCancel(row: Leave) {
  try {
    await ElMessageBox.confirm('确定要取消该请假申请吗？', '提示', { type: 'warning' });
    await leavesApi.cancel(row.id);
    ElMessage.success('取消成功');
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
      await leavesApi.create({ ...formData });
      ElMessage.success('提交成功');
      dialogVisible.value = false;
      fetchData();
    } catch (e: any) {
      ElMessage.error(e.message || '提交失败');
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
