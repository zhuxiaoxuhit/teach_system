<template>
  <div class="classes-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="组织班级" name="organized"></el-tab-pane>
        <el-tab-pane label="分组明细" name="details"></el-tab-pane>
      </el-tabs>

      <div class="filter-bar">
        <el-radio-group v-model="classType" size="default">
          <el-radio-button label="校区">校区</el-radio-button>
          <el-radio-button label="课程">课程</el-radio-button>
          <el-radio-button label="班级">班级</el-radio-button>
          <el-radio-button label="助教">助教</el-radio-button>
          <el-radio-button label="上课人数">上课人数</el-radio-button>
          <el-radio-button label="授课教室">授课教室</el-radio-button>
          <el-radio-button label="班级状态">班级状态</el-radio-button>
        </el-radio-group>
        <el-button type="primary">清空筛选</el-button>
      </div>

      <div class="action-bar">
        <div>
          <el-button type="primary" @click="showAddDialog">新建班级</el-button>
          <el-button>延长课程</el-button>
          <el-button @click="handleExport">导出班级</el-button>
        </div>
      </div>

      <div class="stat-info">
        共显示 {{ pagination.total }} 班级，共计 {{ totalStudents }} 名 关联学员
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="班级名称" width="200" sortable>
          <template #default="{ row }">
            <div>
              <el-tag size="small" type="info">班</el-tag>
              {{ row.code }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="人数" width="100" sortable>
          <template #default="{ row }">
            {{ row.studentCount }}/{{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="班主任" width="120" />
        <el-table-column prop="assistant" label="助教" width="100" />
        <el-table-column prop="course" label="所属课程" width="200" />
        <el-table-column prop="classroom" label="授课教室" width="150" />
        <el-table-column prop="period" label="开班日期" width="200" sortable>
          <template #default="{ row }">
            {{ row.startDate }} ~ {{ row.endDate || '进行中' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="班级状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '开班在读' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-dropdown>
              <el-button type="primary" link>
                操作 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleView(row)">查看详情</el-dropdown-item>
                  <el-dropdown-item @click="handleEdit(row)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleFinish(row)">结业</el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新建/编辑班级对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="classForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级名称" prop="code">
              <el-input v-model="classForm.code" placeholder="请输入班级名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级容量" prop="capacity">
              <el-input-number v-model="classForm.capacity" :min="1" :max="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班主任" prop="teacher">
              <el-select v-model="classForm.teacher" placeholder="请选择">
                <el-option label="杨倩" value="杨倩"></el-option>
                <el-option label="陈老师" value="陈老师"></el-option>
                <el-option label="梁辰" value="梁辰"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="助教">
              <el-select v-model="classForm.assistant" placeholder="请选择">
                <el-option label="无" value="-"></el-option>
                <el-option label="助教1" value="助教1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属课程" prop="course">
              <el-select v-model="classForm.course" placeholder="请选择">
                <el-option label="农小硬笔暑托" value="农小硬笔暑托"></el-option>
                <el-option label="农小一对一课试课" value="农小一对一课试课"></el-option>
                <el-option label="农小创意美术" value="农小创意美术"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课教室">
              <el-select v-model="classForm.classroom" placeholder="请选择">
                <el-option label="1F教室1" value="1F教室1"></el-option>
                <el-option label="1F教室2" value="1F教室2"></el-option>
                <el-option label="2F教室1" value="2F教室1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开班日期" prop="startDate">
              <el-date-picker
                v-model="classForm.startDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="classForm.endDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="classForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'
import { getClassList, createClass, updateClass, deleteClass, finishClass } from '@/api/class'

const activeTab = ref('organized')
const classType = ref('校区')
const dialogVisible = ref(false)
const dialogTitle = ref('新建班级')
const formRef = ref<FormInstance>()

const classForm = reactive({
  id: '',
  code: '',
  capacity: 20,
  teacher: '',
  assistant: '-',
  course: '',
  classroom: '',
  startDate: '',
  endDate: '',
  remark: ''
})

const rules: FormRules = {
  code: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入班级容量', trigger: 'blur' }],
  teacher: [{ required: true, message: '请选择班主任', trigger: 'change' }],
  course: [{ required: true, message: '请选择课程', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开班日期', trigger: 'change' }]
}

const generateMockClasses = () => {
  const codes = ['小硬笔-15:30', '一对一-20:15', '创意美术-15:40', '创意美术-17:30', '硬笔-15:40',
    '英语-14:00', '数学-16:00', '语文-18:00', '科学-10:00', '体育-15:00']
  const teachers = ['杨倩', '陈老师', '梁辰', '王老师', '李老师']
  const courses = ['农小硬笔暑托', '农小一对一课试课', '农小创意美术', '农小英语', '农小数学']
  const classrooms = ['1F教室1', '1F教室2', '2F教室1', '2F教室2', '艇搜音乐教室']

  const classes = []
  for (let i = 0; i < 15; i++) {
    classes.push({
      id: String(i + 1),
      code: `0${(i % 9) + 1}-农${codes[i % codes.length]}`,
      studentCount: Math.floor(Math.random() * 20),
      capacity: 20 + Math.floor(Math.random() * 10),
      teacher: teachers[i % teachers.length],
      assistant: Math.random() > 0.7 ? '助教' + (i % 3 + 1) : '-',
      course: courses[i % courses.length],
      classroom: classrooms[i % classrooms.length],
      startDate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
      endDate: Math.random() > 0.5 ? dayjs().add(Math.floor(Math.random() * 60), 'day').format('YYYY-MM-DD') : '',
      status: '开班在读'
    })
  }
  return classes
}

const allClasses = ref(generateMockClasses())
const tableData = ref([...allClasses.value])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 15
})

const totalStudents = computed(() => {
  return allClasses.value.reduce((sum, c) => sum + c.studentCount, 0)
})

const showAddDialog = () => {
  dialogTitle.value = '新建班级'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑班级'
  Object.assign(classForm, row)
  dialogVisible.value = true
}

const handleView = (row: any) => {
  ElMessage.info(`查看班级: ${row.code}`)
}

const handleFinish = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要结业班级"${row.code}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await finishClass(row.id)
    ElMessage.success('结业成功')
    await fetchClasses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '结业失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除班级"${row.code}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteClass(row.id)
    ElMessage.success('删除成功')
    await fetchClasses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          code: classForm.code,
          teacher: classForm.teacher,
          assistant: classForm.assistant,
          course: classForm.course,
          classroom: classForm.classroom,
          capacity: classForm.capacity,
          start_date: classForm.startDate ? dayjs(classForm.startDate).format('YYYY-MM-DD') : undefined,
          end_date: classForm.endDate ? dayjs(classForm.endDate).format('YYYY-MM-DD') : undefined,
          remark: classForm.remark
        }

        if (classForm.id) {
          await updateClass(classForm.id, data)
          ElMessage.success('编辑成功')
        } else {
          await createClass(data)
          ElMessage.success('新增成功')
        }

        await fetchClasses()
        dialogVisible.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  classForm.id = ''
  classForm.code = ''
  classForm.capacity = 20
  classForm.teacher = ''
  classForm.assistant = '-'
  classForm.course = ''
  classForm.classroom = ''
  classForm.startDate = ''
  classForm.endDate = ''
  classForm.remark = ''
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadTableData()
}

const loadTableData = () => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = allClasses.value.slice(start, end)
}

// 从后端获取班级数据
const fetchClasses = async () => {
  try {
    const res = await getClassList({
      page: pagination.current,
      pageSize: pagination.pageSize
    })

    if (res.code === 200) {
      tableData.value = res.data.list.map((item: any) => ({
        id: item.id,
        code: item.code,
        studentCount: item.student_count || 0,
        capacity: item.capacity,
        teacher: item.teacher,
        assistant: item.assistant || '-',
        course: item.course,
        classroom: item.classroom || '-',
        startDate: item.start_date,
        endDate: item.end_date || '',
        status: item.status || '开班在读'
      }))
      pagination.total = res.data.total
      allClasses.value = [...tableData.value]
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    // 失败时使用 mock 数据
    tableData.value = generateMockClasses()
    allClasses.value = [...tableData.value]
    pagination.total = tableData.value.length
  }
}

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped lang="scss">
.classes-container {
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    & > div {
      display: flex;
      gap: 12px;
    }
  }

  .stat-info {
    margin-bottom: 16px;
    font-size: 14px;
    color: #666;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
