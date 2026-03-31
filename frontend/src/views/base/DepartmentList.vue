<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">院系管理</h2>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="code" label="编码" />
      <el-table-column label="操作" width="180">
        <template #default>
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
const loading = ref(false);
const tableData = ref<any[]>([]);
function handleAdd() { ElMessage.info('功能开发中'); }
</script>
