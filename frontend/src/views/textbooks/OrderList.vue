<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">教材订购列表</h2>
      <el-button type="primary" @click="handleAdd">新增订购</el-button>
    </div>

    <div class="filter-bar mt-4">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
        <el-option label="全部" value="" />
        <el-option label="待订购" value="PENDING" />
        <el-option label="已订购" value="ORDERED" />
        <el-option label="已到货" value="RECEIVED" />
        <el-option label="已发放" value="DISTRIBUTED" />
      </el-select>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="className" label="班级" width="140" />
      <el-table-column prop="textbookName" label="教材名称" min-width="200" />
      <el-table-column prop="semesterId" label="学期" width="120" />
      <el-table-column prop="quantity" label="订购数量" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderedAt" label="订购时间" width="170">
        <template #default="{ row }">{{ formatDate(row.orderedAt) }}</template>
      </el-table-column>
      <el-table-column prop="receivedAt" label="到货时间" width="170">
        <template #default="{ row }">{{ formatDate(row.receivedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleUpdateStatus(row, 'ORDERED')" :disabled="row.status !== 'PENDING'">订购</el-button>
          <el-button size="small" type="success" @click="handleUpdateStatus(row, 'RECEIVED')" :disabled="row.status !== 'ORDERED'">到货</el-button>
          <el-button size="small" type="warning" @click="handleUpdateStatus(row, 'DISTRIBUTED')" :disabled="row.status !== 'RECEIVED'">发放</el-button>
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

    <!-- 新增订购对话框 -->
    <el-dialog v-model="dialogVisible" title="新增订购" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="班级ID" prop="classId">
          <el-input v-model="formData.classId" placeholder="请输入班级ID" />
        </el-form-item>
        <el-form-item label="教材ID" prop="textbookId">
          <el-input v-model="formData.textbookId" placeholder="请输入教材ID" />
        </el-form-item>
        <el-form-item label="学期ID" prop="semesterId">
          <el-input v-model="formData.semesterId" placeholder="请输入学期ID" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="formData.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="备注信息" />
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
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { textbooksApi, type OrderRecord } from '@/api/textbooks';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<OrderRecord[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterStatus = ref('');
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  classId: '',
  textbookId: '',
  semesterId: '2024-2025-1',
  quantity: 1,
  remark: '',
});

const formRules: FormRules = {
  classId: [{ required: true, message: '请输入班级ID', trigger: 'blur' }],
  textbookId: [{ required: true, message: '请输入教材ID', trigger: 'blur' }],
  semesterId: [{ required: true, message: '请输入学期ID', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
};

function statusText(status: string) {
  return { PENDING: '待订购', ORDERED: '已订购', RECEIVED: '已到货', DISTRIBUTED: '已发放' }[status] || status;
}

function statusType(status: string) {
  return { PENDING: 'info', ORDERED: 'warning', RECEIVED: 'success', DISTRIBUTED: '' }[status] || 'info';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await textbooksApi.getOrders({ status: filterStatus.value || undefined });
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

async function handleUpdateStatus(row: OrderRecord, status: string) {
  try {
    await textbooksApi.updateOrder(row.id, { status } as any);
    ElMessage.success('更新成功');
    fetchData();
  } catch (e: any) {
    ElMessage.error(e.message || '更新失败');
  }
}

async function handleDelete(row: OrderRecord) {
  try {
    await ElMessageBox.confirm('确定要删除该订购记录吗？', '提示', { type: 'warning' });
    await textbooksApi.deleteOrder(row.id);
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
      await textbooksApi.createOrder({ ...formData });
      ElMessage.success('创建成功');
      dialogVisible.value = false;
      fetchData();
    } catch (e: any) {
      ElMessage.error(e.message || '创建失败');
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
