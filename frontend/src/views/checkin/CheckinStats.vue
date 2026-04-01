<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">签到统计</h2>
      <div class="header-actions">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" style="margin-right: 10px" @change="fetchStats" />
        <el-button type="primary" @click="fetchStats">查询</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="mt-4">
      <el-col :span="6">
        <el-card>
          <el-statistic title="应到人数" :value="summary.total" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="实到人数" :value="summary.present" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="出勤率" :value="summary.rate" suffix="%" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="缺勤人数" :value="summary.absent" />
        </el-card>
      </el-col>
    </el-row>

    <el-table :data="statsData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="total" label="应到" width="80" />
      <el-table-column prop="present" label="出勤" width="80" />
      <el-table-column prop="late" label="迟到" width="80" />
      <el-table-column prop="leave" label="请假" width="80" />
      <el-table-column prop="absent" label="缺勤" width="80" />
      <el-table-column prop="rate" label="出勤率" width="100">
        <template #default="{ row }">
          <el-progress :percentage="row.rate" :color="rateColor(row.rate)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { checkinApi, type CheckinStats } from '@/api/checkin';

const loading = ref(false);
const statsData = ref<CheckinStats[]>([]);
const dateRange = ref<[string, string]>(['', '']);

const summary = computed(() => {
  const total = statsData.value.reduce((sum, s) => sum + s.total, 0);
  const present = statsData.value.reduce((sum, s) => sum + s.present, 0);
  const absent = statsData.value.reduce((sum, s) => sum + s.absent, 0);
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, rate };
});

function rateColor(rate: number) {
  if (rate >= 90) return '#67c23a';
  if (rate >= 70) return '#e6a23c';
  return '#f56c6c';
}

async function fetchStats() {
  loading.value = true;
  try {
    const [startDate, endDate] = dateRange.value || ['', ''];
    const res = await checkinApi.getStats({ startDate, endDate });
    statsData.value = res.data || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取统计数据失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  dateRange.value = [start, end];
  fetchStats();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; }
.mt-4 { margin-top: 16px; }
</style>
