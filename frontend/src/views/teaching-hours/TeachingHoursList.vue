<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">课时统计</h2>
      <div class="header-actions">
        <el-select v-model="semesterId" placeholder="选择学期" clearable style="width: 150px; margin-right: 10px">
          <el-option label="2024-2025-1" value="2024-2025-1" />
          <el-option label="2024-2025-2" value="2024-2025-2" />
        </el-select>
        <el-button type="primary" @click="handleCalculate" :loading="calculating">重新计算</el-button>
      </div>
    </div>

    <!-- 系数说明卡片 -->
    <el-row :gutter="16" class="mt-4">
      <el-col :span="12">
        <el-card>
          <template #header>班级人数系数</template>
          <el-table :data="classSizeCoeffs" size="small">
            <el-table-column prop="range" label="人数范围" />
            <el-table-column prop="coefficient" label="系数" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>重复课时系数</template>
          <el-table :data="duplicateCoeffs" size="small">
            <el-table-column prop="rank" label="任教班数" />
            <el-table-column prop="coefficient" label="系数" />
            <el-table-column prop="description" label="说明" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课时统计列表 -->
    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="teacherName" label="教师姓名" width="120" />
      <el-table-column prop="courseName" label="课程名称" min-width="160" />
      <el-table-column prop="classSize" label="班级人数" width="100" />
      <el-table-column prop="classSizeCoefficient" label="人数系数" width="100" />
      <el-table-column prop="duplicateCoefficient" label="重复系数" width="100" />
      <el-table-column prop="baseHours" label="基本课时" width="100" />
      <el-table-column prop="totalHours" label="总课时" width="100">
        <template #default="{ row }">
          <strong>{{ row.totalHours }}</strong>
        </template>
      </el-table-column>
      <el-table-column prop="semesterId" label="学期" width="120" />
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { teachingHoursApi, type TeachingHoursRecord, type CoefficientItem } from '@/api/teaching-hours';

const loading = ref(false);
const calculating = ref(false);
const tableData = ref<TeachingHoursRecord[]>([]);
const classSizeCoeffs = ref<CoefficientItem[]>([]);
const duplicateCoeffs = ref<CoefficientItem[]>([]);
const semesterId = ref('2024-2025-1');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

async function fetchCoefficients() {
  try {
    const [csRes, dupRes] = await Promise.all([
      teachingHoursApi.getClassSizeCoefficients(),
      teachingHoursApi.getDuplicateCoefficients(),
    ]);
    classSizeCoeffs.value = csRes.data || [];
    duplicateCoeffs.value = dupRes.data || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取系数配置失败');
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await teachingHoursApi.calculateAllTeachersHours(semesterId.value);
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取课时数据失败');
  } finally {
    loading.value = false;
  }
}

async function handleCalculate() {
  calculating.value = true;
  try {
    await fetchData();
    ElMessage.success('计算完成');
  } finally {
    calculating.value = false;
  }
}

onMounted(() => {
  fetchCoefficients();
  fetchData();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; }
.mt-4 { margin-top: 16px; }
</style>
