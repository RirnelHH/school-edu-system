<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">学校管理</h2>
      <el-button type="primary" @click="handleAdd">新增学校</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="name" label="学校名称" />
      <el-table-column prop="code" label="学校代码" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="contact" label="联系方式" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

function handleAdd() {
  ElMessage.info('功能开发中');
}

function handleEdit(_row: any) {
  ElMessage.info('编辑功能开发中');
}

function handleDelete(_row: any) {
  ElMessage.info('删除功能开发中');
}
</script>
