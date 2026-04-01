<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">教材列表</h2>
      <el-button type="primary" @click="handleAdd">新增教材</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe class="mt-4">
      <el-table-column prop="name" label="教材名称" min-width="200" />
      <el-table-column prop="isbn" label="ISBN" width="160" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="publisher" label="出版社" min-width="140" />
      <el-table-column prop="price" label="价格" width="80">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="edition" label="版次" width="80" />
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="courseName" label="关联课程" width="140" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="mt-4"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="教材名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入教材名称" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="formData.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="formData.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="formData.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="版次">
          <el-input v-model="formData.edition" placeholder="如: 第1版" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" />
        </el-form-item>
        <el-form-item label="课程ID">
          <el-input v-model="formData.courseId" placeholder="请输入课程ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { textbooksApi, type Textbook } from '@/api/textbooks';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<Textbook[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('新增教材');
const editingId = ref('');
const formRef = ref<FormInstance>();

const formData = reactive({
  name: '',
  isbn: '',
  author: '',
  publisher: '',
  price: 0,
  edition: '',
  stock: 0,
  courseId: '',
});

const formRules: FormRules = {
  name: [{ required: true, message: '请输入教材名称', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
};

async function fetchData() {
  loading.value = true;
  try {
    const res = await textbooksApi.findAll();
    tableData.value = res.data || [];
    total.value = tableData.value.length;
  } catch (e: any) {
    ElMessage.error(e.message || '获取数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  dialogTitle.value = '新增教材';
  editingId.value = '';
  dialogVisible.value = true;
}

function handleEdit(row: Textbook) {
  dialogTitle.value = '编辑教材';
  editingId.value = row.id;
  Object.assign(formData, {
    name: row.name,
    isbn: row.isbn,
    author: row.author,
    publisher: row.publisher,
    price: row.price,
    edition: row.edition || '',
    stock: row.stock,
    courseId: row.courseId || '',
  });
  dialogVisible.value = true;
}

async function handleDelete(row: Textbook) {
  try {
    await ElMessageBox.confirm('确定要删除该教材吗？', '提示', { type: 'warning' });
    await textbooksApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch {
    // cancelled
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (editingId.value) {
        await textbooksApi.update(editingId.value, { ...formData });
        ElMessage.success('编辑成功');
      } else {
        await textbooksApi.create({ ...formData });
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      fetchData();
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
}

function resetForm() {
  formRef.value?.resetFields();
}

fetchData();
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
</style>
