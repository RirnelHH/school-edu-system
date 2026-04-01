<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">授课计划列表</h2>
      <div class="header-actions">
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px" @change="fetchData">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已提交" value="SUBMITTED" />
          <el-option label="教师已审" value="TEACHER_APPROVED" />
          <el-option label="组长已审" value="GROUP_LEADER_APPROVED" />
          <el-option label="已通过" value="APPROVED" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索授课计划" style="width: 200px; margin-right: 10px" clearable @change="fetchData" />
        <el-button type="primary" @click="handleAdd">新增授课计划</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="name" label="计划名称" min-width="160" />
      <el-table-column prop="courseId" label="课程ID" width="120" />
      <el-table-column prop="semesterId" label="学期ID" width="120" />
      <el-table-column prop="status" label="状态" width="140">
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
          <el-button size="small" type="warning" @click="handleLessonPlans(row)">教案</el-button>
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
      @size-change="fetchData"
      @current-change="fetchData"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="课程ID" prop="courseId">
          <el-input v-model="formData.courseId" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="学期ID" prop="semesterId">
          <el-input v-model="formData.semesterId" placeholder="请输入学期ID" />
        </el-form-item>
        <el-form-item label="教师IDs" prop="teacherIds">
          <el-input v-model="formData.teacherIds" placeholder="用逗号分隔多个教师ID" />
        </el-form-item>
        <el-form-item label="组长ID" prop="groupLeaderId">
          <el-input v-model="formData.groupLeaderId" placeholder="请输入教研组长ID" />
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
import { teachingPlansApi, type TeachingPlan } from '@/api/teaching-plans';

const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<TeachingPlan[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterStatus = ref('');
const searchKeyword = ref('');
const dialogVisible = ref(false);
const dialogTitle = ref('新增授课计划');
const editingId = ref('');
const formRef = ref<FormInstance>();

const formData = reactive({
  name: '',
  courseId: '',
  semesterId: '',
  teacherIds: '',
  groupLeaderId: '',
});

const formRules: FormRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
  semesterId: [{ required: true, message: '请输入学期ID', trigger: 'blur' }],
};

function statusText(status: string) {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    TEACHER_APPROVED: '教师已审',
    GROUP_LEADER_APPROVED: '组长已审',
    APPROVED: '已通过',
  };
  return map[status] || status;
}

function statusType(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'info',
    SUBMITTED: 'warning',
    TEACHER_APPROVED: 'warning',
    GROUP_LEADER_APPROVED: 'success',
    APPROVED: 'success',
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
    const res = await teachingPlansApi.findAll({ status: filterStatus.value || undefined });
    let data = res.data || [];
    if (searchKeyword.value) {
      data = data.filter((item: TeachingPlan) => item.name.includes(searchKeyword.value));
    }
    tableData.value = data;
    total.value = data.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  dialogTitle.value = '新增授课计划';
  editingId.value = '';
  dialogVisible.value = true;
}

function handleEdit(row: TeachingPlan) {
  dialogTitle.value = '编辑授课计划';
  editingId.value = row.id;
  formData.name = row.name;
  formData.courseId = row.courseId;
  formData.semesterId = row.semesterId;
  dialogVisible.value = true;
}

function handleView(row: TeachingPlan) {
  router.push({ name: 'TeachingPlanApprove', params: { id: row.id } });
}

function handleLessonPlans(row: TeachingPlan) {
  router.push({ name: 'LessonPlans', params: { teachingPlanId: row.id } });
}

async function handleDelete(row: TeachingPlan) {
  try {
    await ElMessageBox.confirm('确定要删除该授课计划吗？', '提示', { type: 'warning' });
    await ElMessage.success('删除成功');
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
      const payload = {
        name: formData.name,
        courseId: formData.courseId,
        semesterId: formData.semesterId,
        teacherIds: formData.teacherIds.split(',').map((s) => s.trim()).filter(Boolean),
        groupLeaderId: formData.groupLeaderId,
      };
      if (editingId.value) {
        ElMessage.success('编辑成功');
      } else {
        await teachingPlansApi.create(payload);
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
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; flex-wrap: wrap; }
.mt-4 { margin-top: 16px; }
</style>
