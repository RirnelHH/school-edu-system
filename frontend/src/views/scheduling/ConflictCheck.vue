<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">冲突检测</h2>
    </div>

    <el-card class="mt-4">
      <template #header>检测条件</template>
      <el-form :model="checkForm" label-width="100px" inline>
        <el-form-item label="版本ID">
          <el-input v-model="checkForm.scheduleVersionId" placeholder="排课版本ID" />
        </el-form-item>
        <el-form-item label="教室ID">
          <el-input v-model="checkForm.roomId" placeholder="教室ID" />
        </el-form-item>
        <el-form-item label="教师ID">
          <el-input v-model="checkForm.teacherId" placeholder="教师ID" />
        </el-form-item>
        <el-form-item label="班级ID">
          <el-input v-model="checkForm.classId" placeholder="班级ID" />
        </el-form-item>
        <el-form-item label="星期">
          <el-select v-model="checkForm.weekday" style="width: 120px">
            <el-option v-for="d in weekdays" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始节次">
          <el-input-number v-model="checkForm.periodStart" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="结束节次">
          <el-input-number v-model="checkForm.periodEnd" :min="1" :max="10" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleCheck" :loading="checking">检测</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4" v-if="result">
      <template #header>检测结果</template>
      <el-result
        :icon="result.hasConflict ? 'error' : 'success'"
        :title="result.hasConflict ? '存在冲突' : '无冲突'"
      >
        <template #sub-title>
          <div v-if="result.hasConflict">
            <div v-for="(c, idx) in result.conflicts" :key="idx" class="conflict-item">
              <el-tag type="danger" size="small">{{ c.type }}</el-tag>
              {{ c.message }}
            </div>
          </div>
          <div v-else>该时段安排无冲突</div>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { schedulingApi, type ConflictResult } from '@/api/scheduling';

const checking = ref(false);
const result = ref<ConflictResult | null>(null);

const weekdays = [
  { value: 1, label: '周一' }, { value: 2, label: '周二' }, { value: 3, label: '周三' },
  { value: 4, label: '周四' }, { value: 5, label: '周五' }, { value: 6, label: '周六' }, { value: 7, label: '周日' },
];

const checkForm = reactive({
  scheduleVersionId: '',
  roomId: '',
  teacherId: '',
  classId: '',
  weekday: 1,
  periodStart: 1,
  periodEnd: 2,
});

async function handleCheck() {
  checking.value = true;
  try {
    const res = await schedulingApi.checkConflicts({ ...checkForm });
    result.value = res.data || { hasConflict: false, conflicts: [] };
  } catch (e: any) {
    ElMessage.error(e.message || '检测失败');
  } finally {
    checking.value = false;
  }
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
.conflict-item { margin: 8px 0; }
</style>
