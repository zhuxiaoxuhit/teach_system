<template>
  <el-dialog
    v-model="dialogVisible"
    title="排课详情"
    width="600px"
    @close="handleClose"
  >
    <div v-if="schedule" class="schedule-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="班级/一对一">
          {{ schedule.class_code || `一对一-${schedule.student_name}` }}
        </el-descriptions-item>
        <el-descriptions-item label="课程名称">
          {{ schedule.course_name }}
        </el-descriptions-item>
        <el-descriptions-item label="教师">
          {{ schedule.teacher_name }}
        </el-descriptions-item>
        <el-descriptions-item label="教室">
          {{ schedule.classroom }}
        </el-descriptions-item>
        <el-descriptions-item label="上课日期">
          {{ formatDate(schedule.schedule_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="上课时间">
          {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(schedule.status)" size="small">
            {{ getStatusText(schedule.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排课类型">
          {{ schedule.schedule_type === 'class' ? '班级排课' : '一对一排课' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ schedule.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button @click="handleEdit">编辑</el-button>
      <el-button
        v-if="schedule?.status !== 'cancelled'"
        type="warning"
        @click="handleCancel"
      >
        取消排课
      </el-button>
      <el-popconfirm
        title="确定删除这条排课吗？"
        @confirm="handleDelete"
      >
        <template #reference>
          <el-button type="danger">删除</el-button>
        </template>
      </el-popconfirm>
    </template>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑排课"
      width="500px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="editForm"
        label-width="100px"
      >
        <el-form-item label="上课日期">
          <el-date-picker
            v-model="editForm.scheduleDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="editForm.startTime"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="editForm.endTime"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="教师">
          <el-select
            v-model="editForm.teacherName"
            placeholder="请选择教师"
            style="width: 100%"
          >
            <el-option
              v-for="teacher in teacherList"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教室">
          <el-input v-model="editForm.classroom" />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="editForm.courseName" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  updateSchedule,
  deleteSchedule,
  cancelSchedule,
  getTeachers
} from '@/api/schedules'

const props = defineProps<{
  modelValue: boolean
  schedule: any
}>()

const emit = defineEmits(['update:modelValue', 'update', 'delete'])

const dialogVisible = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)
const teacherList = ref([])

const editForm = ref({
  scheduleDate: '',
  startTime: '',
  endTime: '',
  teacherName: '',
  classroom: '',
  courseName: '',
  remark: ''
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.schedule) {
    initEditForm()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 初始化编辑表单
const initEditForm = () => {
  if (!props.schedule) return
  editForm.value = {
    scheduleDate: props.schedule.schedule_date,
    startTime: props.schedule.start_time?.substring(0, 5) || '',
    endTime: props.schedule.end_time?.substring(0, 5) || '',
    teacherName: props.schedule.teacher_name,
    classroom: props.schedule.classroom,
    courseName: props.schedule.course_name,
    remark: props.schedule.remark || ''
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY年MM月DD日')
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: any = {
    normal: 'success',
    cancelled: 'warning',
    conflict: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: any = {
    normal: '正常',
    cancelled: '已取消',
    conflict: '冲突'
  }
  return textMap[status] || status
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    const res = await getTeachers()
    if (res.code === 200) {
      teacherList.value = res.data
    }
  } catch (error) {
    console.error('加载教师列表失败', error)
  }
}

// 编辑
const handleEdit = () => {
  showEditDialog.value = true
}

// 保存
const handleSave = async () => {
  if (!props.schedule?.id) return

  saving.value = true
  try {
    const data = {
      scheduleDate: editForm.value.scheduleDate,
      startTime: editForm.value.startTime,
      endTime: editForm.value.endTime,
      teacherName: editForm.value.teacherName,
      classroom: editForm.value.classroom,
      courseName: editForm.value.courseName,
      remark: editForm.value.remark
    }

    const res = await updateSchedule(props.schedule.id, data)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      emit('update')
      handleClose()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = async () => {
  if (!props.schedule?.id) return

  try {
    await ElMessageBox.confirm('确定取消这条排课吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await cancelSchedule(props.schedule.id)
    if (res.code === 200) {
      ElMessage.success('取消成功')
      emit('update')
      handleClose()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

// 删除
const handleDelete = async () => {
  if (!props.schedule?.id) return

  try {
    const res = await deleteSchedule(props.schedule.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      emit('delete')
      handleClose()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 关闭
const handleClose = () => {
  dialogVisible.value = false
}

onMounted(() => {
  loadTeachers()
})
</script>

<style scoped lang="scss">
.schedule-detail {
  margin-bottom: 20px;
}
</style>
