<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">请假审批</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card v-loading="loading" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>请假详情</span>
          <el-tag :type="statusType(detail.status)" size="small">{{ statusText(detail.status) }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="学生姓名">{{ detail.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detail.className }}</el-descriptions-item>
        <el-descriptions-item label="请假类型">{{ leaveTypeText(detail.type) }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ detail.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ detail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="请假原因" :span="2">{{ detail.reason }}</el-descriptions-item>
      </el-descriptions>

      <!-- 审批记录 -->
      <div class="approve-records mt-4" v-if="detail.approvals?.length">
        <h4>审批记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(approval, idx) in detail.approvals"
            :key="idx"
            :type="approval.decision === 'APPROVED' ? 'success' : 'danger'"
          >
            <p><strong>{{ approval.approverName }}</strong> {{ approval.decision === 'APPROVED' ? '通过了' : '驳回了' }}申请</p>
            <p v-if="approval.comment">意见：{{ approval.comment }}</p>
            <p class="time">{{ formatDate(approval.decidedAt) }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 审批操作 -->
      <div class="approve-section" v-if="detail.id && detail.status === 'PENDING'">
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
import { leavesApi } from '@/api/leaves';

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

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await leavesApi.findOne(id);
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
    await leavesApi.approve(id, {
      decision: approveForm.decision as 'APPROVED' | 'REJECTED',
      comment: approveForm.comment,
    });
    ElMessage.success('审批成功');
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
.approve-records h4, .approve-section h4 { margin: 16px 0; }
.approve-form { max-width: 500px; }
.time { color: #999; font-size: 12px; }
</style>
