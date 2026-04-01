<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">每日签到</h2>
      <el-button type="primary" @click="handleCheckin" :loading="checking" :disabled="alreadyCheckedIn">
        {{ alreadyCheckedIn ? '已签到' : '签到' }}
      </el-button>
    </div>

    <el-alert v-if="alreadyCheckedIn" type="success" :closable="false" class="mt-4">
      您今日已完成签到，签到时间：{{ todayRecord?.checkinTime }}
    </el-alert>

    <el-card class="mt-4" v-loading="loading">
      <template #header>今日签到记录</template>
      <el-table :data="todayRecords" stripe>
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkinTime" label="签到时间" width="170" />
        <el-table-column prop="checkoutTime" label="签退时间" width="170" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-select v-model="row.newStatus" size="small" style="width: 100px" @change="handleUpdateStatus(row)">
              <el-option label="出勤" value="PRESENT" />
              <el-option label="缺勤" value="ABSENT" />
              <el-option label="迟到" value="LATE" />
              <el-option label="请假" value="LEAVE" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mt-4">
      <template #header>快速签到（按班级）</template>
      <el-form inline>
        <el-form-item label="班级ID">
          <el-input v-model="quickClassId" placeholder="请输入班级ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchClassCheckins">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="classCheckins" stripe class="mt-4">
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { checkinApi, type CheckinRecord } from '@/api/checkin';

const loading = ref(false);
const checking = ref(false);
const alreadyCheckedIn = ref(false);
const todayRecord = ref<CheckinRecord | null>(null);
const todayRecords = ref<CheckinRecord[]>([]);
const classCheckins = ref<CheckinRecord[]>([]);
const quickClassId = ref('');

function statusText(status: string) {
  return { PRESENT: '出勤', ABSENT: '缺勤', LATE: '迟到', LEAVE: '请假' }[status] || status;
}

function statusType(status: string) {
  return { PRESENT: 'success', ABSENT: 'danger', LATE: 'warning', LEAVE: 'info' }[status] || 'info';
}

async function handleCheckin() {
  checking.value = true;
  try {
    await checkinApi.checkin();
    ElMessage.success('签到成功');
    alreadyCheckedIn.value = true;
    fetchTodayRecords();
  } catch (e: any) {
    ElMessage.error(e.message || '签到失败');
  } finally {
    checking.value = false;
  }
}

async function fetchTodayRecords() {
  loading.value = true;
  try {
    const res = await checkinApi.getTodayRecords();
    todayRecords.value = res.data || [];
    const myRecord = todayRecords.value.find((r) => r.userName);
    if (myRecord?.checkinTime) {
      alreadyCheckedIn.value = true;
      todayRecord.value = myRecord;
    }
  } catch (e: any) {
    ElMessage.error(e.message || '获取签到记录失败');
  } finally {
    loading.value = false;
  }
}

async function fetchClassCheckins() {
  if (!quickClassId.value) {
    ElMessage.warning('请输入班级ID');
    return;
  }
  loading.value = true;
  try {
    const res = await checkinApi.findAll({ classId: quickClassId.value });
    classCheckins.value = res.data || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取失败');
  } finally {
    loading.value = false;
  }
}

async function handleUpdateStatus(row: CheckinRecord & { newStatus?: string }) {
  if (!row.newStatus) return;
  try {
    await checkinApi.updateStatus(row.id, row.newStatus);
    ElMessage.success('更新成功');
    fetchTodayRecords();
  } catch (e: any) {
    ElMessage.error(e.message || '更新失败');
  }
}

onMounted(() => {
  fetchTodayRecords();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
</style>
