<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">成绩审批</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card class="mt-4" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>成绩详情</span>
          <el-tag :type="statusType(detail.status)" size="small">{{ statusText(detail.status) }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="学生姓名">{{ detail.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detail.className }}</el-descriptions-item>
        <el-descriptions-item label="课程">{{ detail.courseName }}</el-descriptions-item>
        <el-descriptions-item label="考试类型">{{ examTypeText(detail.examType) }}</el-descriptions-item>
        <el-descriptions-item label="分数">{{ detail.score ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ detail.grade || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

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
import { gradesApi } from '@/api/grades';

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

function examTypeText(type?: string) {
  return { MIDTERM: '期中', FINAL: '期末', MAKEUP: '补考' }[type || ''] || '-';
}

function statusText(status: string) {
  return { DRAFT: '草稿', SUBMITTED: '已提交', APPROVED: '已审批' }[status] || status;
}

function statusType(status: string) {
  return { DRAFT: 'info', SUBMITTED: 'warning', APPROVED: 'success' }[status] || 'info';
}

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await gradesApi.findOne(id);
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
    await gradesApi.approve(id, {
      approved: approveForm.decision === 'APPROVED',
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
.approve-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee; }
.approve-section h4 { margin: 0 0 16px; }
.approve-form { max-width: 500px; }
</style>
