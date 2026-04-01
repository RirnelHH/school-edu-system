<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">培养计划审批</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card v-loading="loading" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>培养计划详情</span>
          <el-tag :type="statusType(detail.status)" size="small">{{ statusText(detail.status) }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="计划名称">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ detail.majorName }}</el-descriptions-item>
        <el-descriptions-item label="年份">{{ detail.year }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detail.version }}</el-descriptions-item>
        <el-descriptions-item label="总学分">{{ detail.totalCredits }}</el-descriptions-item>
        <el-descriptions-item label="学期ID">{{ detail.semesterId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 审批操作 -->
      <div class="approve-section" v-if="detail.id && detail.status === 'SUBMITTED'">
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
            <el-button type="primary" :loading="submitting" @click="handleApprove">通过</el-button>
            <el-button type="danger" :loading="submitting" @click="handleReject">驳回</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="mt-4" v-if="detail.id && detail.status === 'DRAFT'">
        <el-button type="primary" @click="handleSubmit">提交审核</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { developmentPlansApi } from '@/api/development-plans';

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const loading = ref(false);
const submitting = ref(false);
const detail = ref<any>({});

const approveForm = reactive({
  decision: 'APPROVED',
  comment: '',
});

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

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await developmentPlansApi.findOne(id);
    detail.value = res.data || {};
  } catch (e: any) {
    ElMessage.error(e.message || '获取详情失败');
  } finally {
    loading.value = false;
  }
}

async function handleApprove() {
  submitting.value = true;
  try {
    await developmentPlansApi.approve(id, { comment: approveForm.comment });
    ElMessage.success('审批通过');
    fetchDetail();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleReject() {
  if (!approveForm.comment) {
    ElMessage.warning('请输入驳回原因');
    return;
  }
  submitting.value = true;
  try {
    await developmentPlansApi.reject(id, { reason: approveForm.comment });
    ElMessage.success('已驳回');
    fetchDetail();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleSubmit() {
  try {
    await developmentPlansApi.submit(id);
    ElMessage.success('提交成功');
    fetchDetail();
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败');
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
