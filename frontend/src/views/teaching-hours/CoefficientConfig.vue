<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">系数配置</h2>
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="mt-4">
          <template #header>
            <div class="card-header">
              <span>班级人数系数</span>
              <el-button size="small" type="primary" @click="handleSaveCS">保存</el-button>
            </div>
          </template>
          <el-table :data="classSizeData" border size="small">
            <el-table-column label="人数范围" prop="range" />
            <el-table-column label="系数" prop="coefficient">
              <template #default="{ row }">
                <el-input-number v-model="row.coefficient" :min="0" :max="3" :step="0.05" size="small" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="mt-4">
          <template #header>
            <div class="card-header">
              <span>重复课时系数</span>
              <el-button size="small" type="primary" @click="handleSaveDup">保存</el-button>
            </div>
          </template>
          <el-table :data="duplicateData" border size="small">
            <el-table-column label="任教班数" prop="rank" />
            <el-table-column label="系数" prop="coefficient">
              <template #default="{ row }">
                <el-input-number v-model="row.coefficient" :min="0" :max="2" :step="0.05" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="说明" prop="description" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { teachingHoursApi, type CoefficientItem } from '@/api/teaching-hours';

const classSizeData = ref<CoefficientItem[]>([]);
const duplicateData = ref<CoefficientItem[]>([]);

async function fetchCoefficients() {
  try {
    const [csRes, dupRes] = await Promise.all([
      teachingHoursApi.getClassSizeCoefficients(),
      teachingHoursApi.getDuplicateCoefficients(),
    ]);
    classSizeData.value = csRes.data || [];
    duplicateData.value = dupRes.data || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取系数配置失败');
  }
}

function handleSaveCS() {
  ElMessage.success('班级人数系数保存成功（仅本地演示）');
}

function handleSaveDup() {
  ElMessage.success('重复课时系数保存成功（仅本地演示）');
}

onMounted(() => {
  fetchCoefficients();
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
