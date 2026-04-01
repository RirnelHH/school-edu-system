<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑成绩' : '录入成绩' }}</h2>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-card class="mt-4">
      <el-form :model="formData" :rules="formRules" label-width="100px" ref="formRef">
        <el-form-item label="学生ID" prop="studentId">
          <el-input v-model="formData.studentId" placeholder="请输入学生ID" />
        </el-form-item>
        <el-form-item label="班级ID" prop="classId">
          <el-input v-model="formData.classId" placeholder="请输入班级ID" />
        </el-form-item>
        <el-form-item label="课程ID" prop="courseId">
          <el-input v-model="formData.courseId" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="学期ID" prop="semesterId">
          <el-input v-model="formData.semesterId" placeholder="请输入学期ID" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="formData.examType" style="width: 100%">
            <el-option label="期中考试" value="MIDTERM" />
            <el-option label="期末考试" value="FINAL" />
            <el-option label="补考" value="MAKEUP" />
          </el-select>
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="formData.score" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="等级" prop="grade">
          <el-input v-model="formData.grade" placeholder="如: A, B, C" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="handleSubmitAndContinue">保存并继续</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { gradesApi } from '@/api/grades';

const router = useRouter();
const route = useRoute();
const recordId = route.query.id as string;
const isEdit = !!recordId;

const loading = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  studentId: '',
  classId: '',
  courseId: '',
  semesterId: '2024-2025-1',
  examType: 'FINAL',
  score: undefined as number | undefined,
  grade: '',
  remark: '',
});

const formRules: FormRules = {
  studentId: [{ required: true, message: '请输入学生ID', trigger: 'blur' }],
  classId: [{ required: true, message: '请输入班级ID', trigger: 'blur' }],
  courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
  semesterId: [{ required: true, message: '请输入学期ID', trigger: 'blur' }],
  examType: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
};

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await gradesApi.upsert({ ...formData });
      ElMessage.success('保存成功');
      router.back();
    } catch (e: any) {
      ElMessage.error(e.message || '保存失败');
    } finally {
      submitting.value = false;
    }
  });
}

async function handleSubmitAndContinue() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await gradesApi.upsert({ ...formData });
      ElMessage.success('保存成功');
      formRef.value?.resetFields();
    } catch (e: any) {
      ElMessage.error(e.message || '保存失败');
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(async () => {
  if (recordId) {
    loading.value = true;
    try {
      const res = await gradesApi.findOne(recordId);
      const data = res.data;
      if (data) {
        formData.studentId = data.studentId;
        formData.classId = data.classId;
        formData.courseId = data.courseId;
        formData.semesterId = data.semesterId;
        formData.examType = data.examType || 'FINAL';
        formData.score = data.score;
        formData.grade = data.grade || '';
        formData.remark = data.remark || '';
      }
    } catch (e: any) {
      ElMessage.error(e.message || '获取成绩详情失败');
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
</style>
