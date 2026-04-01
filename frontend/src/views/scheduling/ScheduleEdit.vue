<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑排课' : '排课编辑' }}</h2>
      <div>
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <el-card class="mt-4" v-loading="loading">
      <template #header>
        <span>排课条目</span>
        <el-button size="small" type="primary" @click="handleAddEntry">新增条目</el-button>
      </template>

      <el-table :data="entries" stripe>
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="courseName" label="课程" min-width="140" />
        <el-table-column prop="teacherName" label="教师" width="100" />
        <el-table-column prop="roomName" label="教室" width="100" />
        <el-table-column prop="weekday" label="星期" width="80">
          <template #default="{ row }">
            {{ weekdayText(row.weekday) }}
          </template>
        </el-table-column>
        <el-table-column label="节次" width="100">
          <template #default="{ row }">
            {{ row.periodStart }}~{{ row.periodEnd }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEditEntry(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteEntry(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑条目对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingEntryId ? '编辑条目' : '新增条目'" width="600px" @close="resetEntryForm">
      <el-form ref="formRef" :model="entryForm" :rules="entryRules" label-width="80px">
        <el-form-item label="班级ID" prop="classId">
          <el-input v-model="entryForm.classId" placeholder="请输入班级ID" />
        </el-form-item>
        <el-form-item label="课程ID" prop="courseId">
          <el-input v-model="entryForm.courseId" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="教师ID" prop="teacherId">
          <el-input v-model="entryForm.teacherId" placeholder="请输入教师ID" />
        </el-form-item>
        <el-form-item label="教室ID" prop="roomId">
          <el-input v-model="entryForm.roomId" placeholder="请输入教室ID" />
        </el-form-item>
        <el-form-item label="星期" prop="weekday">
          <el-select v-model="entryForm.weekday" style="width: 100%">
            <el-option v-for="d in weekdays" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始节次" prop="periodStart">
          <el-input-number v-model="entryForm.periodStart" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="结束节次" prop="periodEnd">
          <el-input-number v-model="entryForm.periodEnd" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitEntry">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { schedulingApi, type ScheduleEntry } from '@/api/scheduling';

const router = useRouter();
const route = useRoute();
const versionId = route.params.id as string;
const isEdit = !!versionId;

const loading = ref(false);
const submitting = ref(false);
const entries = ref<ScheduleEntry[]>([]);
const dialogVisible = ref(false);
const editingEntryId = ref('');
const formRef = ref<FormInstance>();

const weekdays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
];

const entryForm = reactive({
  classId: '',
  courseId: '',
  teacherId: '',
  roomId: '',
  weekday: 1,
  periodStart: 1,
  periodEnd: 2,
  scheduleVersionId: versionId,
});

const entryRules: FormRules = {
  classId: [{ required: true, message: '请输入班级ID', trigger: 'blur' }],
  courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入教师ID', trigger: 'blur' }],
  roomId: [{ required: true, message: '请输入教室ID', trigger: 'blur' }],
};

function weekdayText(day: number) {
  return weekdays.find((d) => d.value === day)?.label || `星期${day}`;
}

async function fetchEntries() {
  if (!versionId) return;
  loading.value = true;
  try {
    const res = await schedulingApi.getVersionDetail(versionId);
    entries.value = res.data?.entries || [];
  } catch (e: any) {
    ElMessage.error(e.message || '获取排课条目失败');
  } finally {
    loading.value = false;
  }
}

function handleAddEntry() {
  editingEntryId.value = '';
  dialogVisible.value = true;
}

function handleEditEntry(row: ScheduleEntry) {
  editingEntryId.value = row.id;
  entryForm.classId = row.classId;
  entryForm.courseId = row.courseId;
  entryForm.teacherId = row.teacherId;
  entryForm.roomId = row.roomId;
  entryForm.weekday = row.weekday;
  entryForm.periodStart = row.periodStart;
  entryForm.periodEnd = row.periodEnd;
  dialogVisible.value = true;
}

async function handleDeleteEntry(row: ScheduleEntry) {
  try {
    await schedulingApi.deleteEntry(row.id);
    ElMessage.success('删除成功');
    fetchEntries();
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败');
  }
}

async function handleSubmitEntry() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (editingEntryId.value) {
        await schedulingApi.updateEntry(editingEntryId.value, { ...entryForm });
      } else {
        await schedulingApi.addEntry({ ...entryForm });
      }
      ElMessage.success(editingEntryId.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      fetchEntries();
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
}

function handleSave() {
  ElMessage.success('保存成功');
}

function resetEntryForm() {
  formRef.value?.resetFields();
}

onMounted(() => {
  if (versionId) {
    fetchEntries();
  }
});
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 18px; font-weight: 600; margin: 0; }
.mt-4 { margin-top: 16px; }
</style>
