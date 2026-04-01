<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">教案列表</h2>
      <div>
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" @click="handleAdd">新增教案</el-button>
      </div>
    </div>

    <div class="info-bar">
      授课计划ID: <strong>{{ teachingPlanId }}</strong>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="title" label="教案标题" min-width="160" />
      <el-table-column prop="weekNumber" label="周次" width="80" />
      <el-table-column prop="content" label="内容摘要" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="attachmentUrl" label="附件" width="100">
        <template #default="{ row }">
          <a v-if="row.attachmentUrl" :href="row.attachmentUrl" target="_blank">下载</a>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleSubmit(row)" :disabled="row.status !== 'DRAFT'">提交</el-button>
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
        <el-form-item label="教案标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入教案标题" />
        </el-form-item>
        <el-form-item label="周次" prop="weekNumber">
          <el-input-number v-model="formData.weekNumber" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请输入教案内容" />
        </el-form-item>
        <el-form-item label="附件URL" prop="attachmentUrl">
          <el-input v-model="formData.attachmentUrl" placeholder="请输入附件URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { lessonPlansApi, type LessonPlan } from '@/api/teaching-plans';

const router = useRouter();
const route = useRoute();
const teachingPlanId = route.params.teachingPlanId as string;

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<LessonPlan[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('新增教案');
const editingId = ref('');
const formRef = ref<FormInstance>();

const formData = reactive({
  title: '',
  weekNumber: 1,
  content: '',
  attachmentUrl: '',
  teachingPlanId,
});

const formRules: FormRules = {
  title: [{ required: true, message: '请输入教案标题', trigger: 'blur' }],
  weekNumber: [{ required: true, message: '请输入周次', trigger: 'blur' }],
};

function statusText(status: string) {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    TEACHER_APPROVED: '教师已审',
    GROUP_LEADER_APPROVED: '组长已审',
    DIRECTOR_APPROVED: '主任已审',
  };
  return map[status] || status;
}

function statusType(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'info',
    SUBMITTED: 'warning',
    TEACHER_APPROVED: 'warning',
    GROUP_LEADER_APPROVED: 'success',
    DIRECTOR_APPROVED: 'success',
  };
  return map[status] || 'info';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await lessonPlansApi.findAll(teachingPlanId);
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  dialogTitle.value = '新增教案';
  editingId.value = '';
  dialogVisible.value = true;
}

function handleEdit(row: LessonPlan) {
  dialogTitle.value = '编辑教案';
  editingId.value = row.id;
  formData.title = row.title;
  formData.weekNumber = row.weekNumber;
  formData.content = row.content || '';
  formData.attachmentUrl = row.attachmentUrl || '';
  dialogVisible.value = true;
}

async function handleSubmit(row: LessonPlan) {
  try {
    await lessonPlansApi.submit(row.id);
    ElMessage.success('提交成功');
    fetchData();
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败');
  }
}

async function handleDelete(row: LessonPlan) {
  try {
    await ElMessageBox.confirm('确定要删除该教案吗？', '提示', { type: 'warning' });
    await ElMessage.success('删除成功');
    fetchData();
  } catch {
    // cancelled
  }
}

async function handleSubmitForm() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (editingId.value) {
        ElMessage.success('编辑成功');
      } else {
        await lessonPlansApi.create({ ...formData });
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

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.info-bar { margin-top: 16px; padding: 10px; background: #f5f7fa; border-radius: 4px; }
.mt-4 { margin-top: 16px; }
</style>
