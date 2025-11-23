<template>
  <el-dialog
    v-model="dialogVisible"
    title="新建排课"
    width="600px"
    @close="handleClose"
  >
    <el-tabs v-model="scheduleType">
      <el-tab-pane label="班级排课" name="class"></el-tab-pane>
      <el-tab-pane label="教师排课" name="teacher"></el-tab-pane>
    </el-tabs>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="margin-top: 20px"
    >
      <el-form-item label="班级/一对一" prop="classId" v-if="scheduleType === 'class'">
        <el-select
          v-model="form.classId"
          placeholder="请选择班级/一对一"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="cls in classList"
            :key="cls.id"
            :label="cls.code"
            :value="cls.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="排课方式">
        <el-radio-group v-model="arrangementType">
          <el-radio label="free">自由排课</el-radio>
          <el-radio label="repeat">重复排课</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="上课日期" prop="scheduleDate">
        <el-button type="primary" @click="showDatePicker = true">选择日期</el-button>
        <span v-if="form.scheduleDate" style="margin-left: 12px">
          {{ form.scheduleDate }}
        </span>
      </el-form-item>

      <el-form-item label="上课时段" prop="timeRange">
        <el-select
          v-model="form.timeRange"
          placeholder="请选择上课时段"
          style="width: 200px; margin-right: 12px"
        >
          <el-option label="上午" value="am" />
          <el-option label="下午" value="pm" />
          <el-option label="晚上" value="evening" />
        </el-select>
        <el-link type="primary" @click="showCustomTime = true">自定义时段</el-link>
      </el-form-item>

      <el-form-item label="上课教师" prop="teacherName">
        <el-select
          v-model="form.teacherName"
          placeholder="请选择上课教师"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="teacher in teacherList"
            :key="teacher.id"
            :label="teacher.name"
            :value="teacher.name"
          />
        </el-select>
        <el-button
          type="primary"
          link
          style="margin-top: 8px"
          @click="showCreateTeacher = true"
        >
          创建教室
        </el-button>
      </el-form-item>

      <el-form-item label="上课教室" prop="classroom">
        <el-select
          v-model="form.classroom"
          placeholder="请选择上课教室"
          style="width: 100%"
          filterable
          allow-create
        >
          <el-option label="1F教室1" value="1F教室1" />
          <el-option label="1F教室2" value="1F教室2" />
          <el-option label="2F教室1" value="2F教室1" />
        </el-select>
      </el-form-item>

      <el-form-item label="助教">
        <el-input v-model="form.assistant" placeholder="请选择助教" />
      </el-form-item>

      <el-form-item label="上课主题">
        <el-input
          v-model="form.courseName"
          placeholder="最多可输入20字"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>

    <!-- 日期选择对话框 -->
    <el-dialog v-model="showDatePicker" title="选择日期" width="400px" append-to-body>
      <el-calendar v-model="tempDate" />
      <template #footer>
        <el-button @click="showDatePicker = false">取消</el-button>
        <el-button type="primary" @click="confirmDate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 自定义时段对话框 -->
    <el-dialog v-model="showCustomTime" title="自定义时段" width="400px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="customStartTime"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="customEndTime"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCustomTime = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomTime">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { createSchedule, getTeachers, getCourses } from '@/api/schedules'
import { getClasses } from '@/api/classes'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const scheduleType = ref('class')
const arrangementType = ref('free')
const showDatePicker = ref(false)
const showCustomTime = ref(false)
const showCreateTeacher = ref(false)
const submitting = ref(false)

const formRef = ref()
const form = ref({
  classId: null,
  scheduleDate: '',
  timeRange: '',
  teacherName: '',
  classroom: '',
  assistant: '',
  courseName: ''
})

const tempDate = ref(new Date())
const customStartTime = ref('09:00')
const customEndTime = ref('10:00')

const classList = ref([])
const teacherList = ref([])

const rules = {
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '请选择上课日期', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择上课时段', trigger: 'change' }],
  teacherName: [{ required: true, message: '请选择教师', trigger: 'change' }],
  classroom: [{ required: true, message: '请选择教室', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 确认日期
const confirmDate = () => {
  form.value.scheduleDate = dayjs(tempDate.value).format('YYYY-MM-DD')
  showDatePicker.value = false
}

// 确认自定义时段
const confirmCustomTime = () => {
  form.value.timeRange = 'custom'
  showCustomTime.value = false
}

// 加载班级列表
const loadClasses = async () => {
  try {
    const res = await getClasses({ pageSize: 1000 })
    if (res.code === 200) {
      classList.value = res.data.list
    }
  } catch (error) {
    console.error('加载班级列表失败', error)
  }
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

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()

  submitting.value = true
  try {
    const data: any = {
      classId: form.value.classId,
      scheduleDate: form.value.scheduleDate,
      teacherName: form.value.teacherName,
      classroom: form.value.classroom,
      courseName: form.value.courseName || '课程',
      scheduleType: 'class'
    }

    // 处理时间
    if (form.value.timeRange === 'custom') {
      data.startTime = customStartTime.value
      data.endTime = customEndTime.value
    } else {
      // 根据时段设置时间
      const timeMap: any = {
        am: { start: '09:00', end: '12:00' },
        pm: { start: '14:00', end: '17:00' },
        evening: { start: '18:00', end: '21:00' }
      }
      const times = timeMap[form.value.timeRange]
      data.startTime = times.start
      data.endTime = times.end
    }

    const res = await createSchedule(data)
    if (res.code === 200) {
      ElMessage.success('创建成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

onMounted(() => {
  loadClasses()
  loadTeachers()
})
</script>

<style scoped lang="scss">
:deep(.el-calendar-table) {
  .el-calendar-day {
    padding: 0;
    height: 50px;
  }
}
</style>
