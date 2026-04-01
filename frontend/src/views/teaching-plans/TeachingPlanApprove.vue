<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">授课计划审批</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card v-loading="loading" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>授课计划详情</span>
          <el-tag :type="statusType(detail.status)" size="small">{{ statusText(detail.status) }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="计划名称">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="课程ID">{{ detail.courseId }}</el-descriptions-item>
        <el-descriptions-item label="学期ID">{{ detail.semesterId }}</el-descriptions-item>
        <el-descriptions-item label="教师IDs">{{ detail.teacherIds?.join(', ') }}</el-descriptions-item>
        <el-descriptions-item label="教研组长ID">{{ detail.groupLeaderId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 审批操作区 -->
      <div class="approve-section" v-if="detail.id && canApprove">
        <h4>审批操作</h4>
        <el-form :model="approveForm" label-width="80px" class="approve-form">
          <el-form-item label="审批决定">
            <el-radio-group v-model="approveForm.decision">
              <el-radio label="APPROVED">通过</el-radio>
              <el-radio label="REJECTED">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审批意见">
            <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批意见" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleApprove">提交审批</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { teachingPlansApi } from '@/api/teaching-plans';

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const loading = ref(false);
const submitting = ref(false);
const detail = ref<any>({});
const canApprove = ref(false);

const approveForm = reactive({
  decision: 'APPROVED',
  comment: '',
});

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

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await teachingPlansApi.findOne(id);
    detail.value = res.data || {};
    // 只有 SUBMITTED 或 TEACHER_APPROVED 状态才能审批
    canApprove.value = ['SUBMITTED', 'TEACHER_APPROVED'].includes(detail.value.status);
  } catch (e: any) {
    ElMessage.error(e.message || '获取详情失败');
  } finally {
    loading.value = false;
  }
}

async function handleApprove() {
  submitting.value = true;
  try {
    const data = {
      approved: approveForm.decision === 'APPROVED',
      comment: approveForm.comment,
    };
    if (detail.value.status === 'SUBMITTED') {
      await teachingPlansApi.teacherApprove(id, data);
    } else {
      await teachingPlansApi.groupLeaderApprove(id, data);
    }
    ElMessage.success('审批提交成功');
    fetchDetail();
  } catch (e: any) {
    ElMessage.error(e.message || '审批失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.approve-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee; }
.approve-section h4 { margin: 0 0 16px; }
.approve-form { max-width: 500px; }
</style>
