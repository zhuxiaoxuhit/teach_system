<template>
  <div class="classes-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="组织班级" name="organized"></el-tab-pane>
        <el-tab-pane label="分组明细" name="details"></el-tab-pane>
        <el-tab-pane label="分班操作日志" name="assignment-logs"></el-tab-pane>
      </el-tabs>

      <!-- 组织班级标签页 -->
      <div v-show="activeTab === 'organized'">
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
            <el-button @click="showImportDialog">导入班级</el-button>
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
      </div>

      <!-- 分班操作日志标签页 -->
      <div v-show="activeTab === 'assignment-logs'">
        <div class="log-filter-bar">
          <div class="filter-left">
            <el-select v-model="logFilters.operationType" placeholder="操作类型" clearable style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="分配进班" value="分配进班"></el-option>
              <el-option label="移出班级" value="移出班级"></el-option>
              <el-option label="转班" value="转班"></el-option>
            </el-select>
            <el-date-picker
              v-model="logFilters.dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 280px;"
            />
            <el-input
              v-model="logFilters.keyword"
              placeholder="搜索人姓名/班级名称"
              style="width: 200px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="fetchAssignmentLogs">搜索</el-button>
          </div>
          <el-button @click="handleExportLogs">清空筛选</el-button>
        </div>

        <div class="stat-info">
          共找到 {{ logPagination.total }} 条记录
        </div>

        <el-table :data="logTableData" style="width: 100%" border>
          <el-table-column prop="created_at" label="时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="student_name" label="学员" width="100" />
          <el-table-column prop="school" label="校区" width="120" />
          <el-table-column prop="class_name" label="班级" width="200" />
          <el-table-column prop="operation_type" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.operation_type === '分配进班' ? 'success' : row.operation_type === '移出班级' ? 'danger' : 'warning'"
                size="small"
              >
                {{ row.operation_type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="内容" min-width="300" show-overflow-tooltip />
        </el-table>

        <el-pagination
          v-model:current-page="logPagination.current"
          v-model:page-size="logPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="logPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleLogSizeChange"
          @current-change="handleLogCurrentChange"
        />
      </div>
    </el-card>

    <!-- 导入班级对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入"
      width="600px"
      @close="resetImport"
    >
      <div class="import-content">
        <div class="upload-area">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">上传文件</div>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".xlsx,.xls"
            drag
          >
            <div class="upload-hint">
              <p>点击或拖拽您的文件到这里</p>
              <p class="sub-hint">仅支持xlsx、xls格式</p>
            </div>
          </el-upload>
        </div>

        <div class="import-tips">
          <p>1. 文件格式必须为Excel格式，请遵循标准模板填写；</p>
          <p>2. 导入数据中有重复班级将会覆盖，不存在的添加新纪录；</p>
          <p>3. 班级数量为0-5000，一次导入请勿超过5000条</p>
          <p style="margin-top: 12px;">
            <el-button type="primary" link @click="downloadTemplate">点击下载导入模板</el-button>
          </p>
        </div>

        <div v-if="selectedFile" class="file-info">
          <el-icon><Document /></el-icon>
          <span>{{ selectedFile.name }}</span>
          <el-button type="danger" link @click="removeFile">删除</el-button>
        </div>

        <div v-if="importResult" class="import-result">
          <el-alert
            :title="`导入完成：成功 ${importResult.success} 条，失败 ${importResult.fail} 条`"
            :type="importResult.fail > 0 ? 'warning' : 'success'"
            :closable="false"
          />
          <div v-if="importResult.failList && importResult.failList.length > 0" class="fail-list">
            <p>失败明细：</p>
            <div v-for="(item, index) in importResult.failList" :key="index" class="fail-item">
              第 {{ item.row }} 行：{{ item.reason }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleImport">确定导入</el-button>
      </template>
    </el-dialog>

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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Document, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadInstance } from 'element-plus'
import dayjs from 'dayjs'
import { getClassList, createClass, updateClass, deleteClass, finishClass, importClasses } from '@/api/class'
import { getAssignmentLogs } from '@/api/class-assignment'

const activeTab = ref('organized')
const classType = ref('校区')
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogTitle = ref('新建班级')
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<any>(null)
const importing = ref(false)
const importResult = ref<any>(null)

// 日志相关
const logTableData = ref([])
const logFilters = reactive({
  operationType: '',
  dateRange: null as any,
  keyword: ''
})
const logPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

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

const showImportDialog = () => {
  importDialogVisible.value = true
  importResult.value = null
  selectedFile.value = null
}

const handleFileChange = (file: any) => {
  selectedFile.value = file
  importResult.value = null
}

const removeFile = () => {
  selectedFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const downloadTemplate = () => {
  // 创建Excel模板数据
  const template = [
    ['班级名称', '班级容量', '班主任', '助教', '课程', '授课教室', '开班日期', '结束日期', '状态', '备注'],
    ['01-农小硬笔-15:30', '20', '杨倩', '-', '农小硬笔暑托', '1F教室1', '2025-09-01', '', '开班在读', ''],
    ['02-农小创意美术-16:00', '25', '陈老师', '助教1', '农小创意美术', '2F教室1', '2025-09-05', '', '开班在读', '示例备注']
  ]

  // 创建下载链接
  const csvContent = template.map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '班级导入模板.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value.raw)

    const res = await importClasses(formData)

    if (res.code === 200) {
      importResult.value = {
        success: res.data.success.length,
        fail: res.data.fail.length,
        failList: res.data.fail
      }

      ElMessage.success(res.message)
      await fetchClasses()

      // 如果全部成功，3秒后关闭对话框
      if (res.data.fail.length === 0) {
        setTimeout(() => {
          importDialogVisible.value = false
          resetImport()
        }, 3000)
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

const resetImport = () => {
  selectedFile.value = null
  importResult.value = null
  importing.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
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

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// 获取分班操作日志
const fetchAssignmentLogs = async () => {
  try {
    const params: any = {
      page: logPagination.current,
      pageSize: logPagination.pageSize
    }

    if (logFilters.operationType) {
      params.operationType = logFilters.operationType
    }

    if (logFilters.dateRange && logFilters.dateRange.length === 2) {
      params.startDate = logFilters.dateRange[0]
      params.endDate = logFilters.dateRange[1]
    }

    if (logFilters.keyword) {
      params.keyword = logFilters.keyword
    }

    const res = await getAssignmentLogs(params)

    if (res.code === 200) {
      logTableData.value = res.data.list
      logPagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载日志失败')
  }
}

const handleLogSizeChange = (size: number) => {
  logPagination.pageSize = size
  fetchAssignmentLogs()
}

const handleLogCurrentChange = (page: number) => {
  logPagination.current = page
  fetchAssignmentLogs()
}

const handleExportLogs = () => {
  logFilters.operationType = ''
  logFilters.dateRange = null
  logFilters.keyword = ''
  fetchAssignmentLogs()
}

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'assignment-logs') {
    fetchAssignmentLogs()
  }
})

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

  .log-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .filter-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.import-content {
  .upload-area {
    text-align: center;
    margin-bottom: 20px;
    position: relative;

    .upload-icon {
      font-size: 48px;
      color: #409EFF;
      margin-bottom: 12px;
    }

    .upload-text {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 40px 20px;
    }

    .upload-hint {
      p {
        margin: 4px 0;
        color: #666;
      }

      .sub-hint {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .import-tips {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    margin-bottom: 16px;

    p {
      margin: 4px 0;
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    margin-bottom: 16px;

    .el-icon {
      font-size: 20px;
      color: #409EFF;
    }

    span {
      flex: 1;
      font-size: 14px;
    }
  }

  .import-result {
    margin-top: 16px;

    .fail-list {
      margin-top: 12px;
      max-height: 200px;
      overflow-y: auto;

      p {
        font-weight: 500;
        margin-bottom: 8px;
      }

      .fail-item {
        padding: 8px;
        background: #fef0f0;
        border-left: 3px solid #f56c6c;
        margin-bottom: 8px;
        font-size: 13px;
        color: #f56c6c;
      }
    }
  }
}
</style>
