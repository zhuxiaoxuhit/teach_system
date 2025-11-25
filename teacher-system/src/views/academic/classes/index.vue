<template>
  <div class="classes-container">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="班级列表" name="list"></el-tab-pane>
        <el-tab-pane label="导入记录" name="import-records"></el-tab-pane>
        <el-tab-pane label="分班操作日志" name="assignment-logs"></el-tab-pane>
      </el-tabs>

      <!-- 班级列表 Tab -->
      <div v-show="activeTab === 'list'">
        <!-- 筛选条件 -->
        <div class="filter-bar">
          <el-select v-model="filters.classFilter" placeholder="班级" clearable style="width: 120px;" @change="fetchClasses">
            <el-option label="全部班级" value=""></el-option>
          </el-select>
          <el-select v-model="filters.campus" placeholder="校区" clearable style="width: 120px;" @change="fetchClasses">
            <el-option label="魏桥书院" value="魏桥书院"></el-option>
          </el-select>
          <el-select v-model="filters.courseType" placeholder="课程类型" clearable style="width: 130px;" @change="fetchClasses">
            <el-option label="农小硬笔暑托" value="农小硬笔暑托"></el-option>
            <el-option label="农小一对一课试课" value="农小一对一课试课"></el-option>
            <el-option label="农小创意美术" value="农小创意美术"></el-option>
          </el-select>
          <el-select v-model="filters.teacher" placeholder="上课教师" clearable style="width: 120px;" @change="fetchClasses">
            <el-option label="杨倩" value="杨倩"></el-option>
            <el-option label="陈老师" value="陈老师"></el-option>
            <el-option label="梁辰" value="梁辰"></el-option>
          </el-select>
          <el-select v-model="filters.orgStatus" placeholder="组织状态" clearable style="width: 120px;">
            <el-option label="已组织" value="已组织"></el-option>
            <el-option label="未组织" value="未组织"></el-option>
          </el-select>
          <el-select v-model="filters.status" placeholder="班级状态" clearable style="width: 120px;" @change="fetchClasses">
            <el-option label="开班在读" value="开班在读"></el-option>
            <el-option label="已结业" value="已结业"></el-option>
          </el-select>
          <el-select v-model="filters.teachingCampus" placeholder="授课校区" clearable style="width: 120px;">
            <el-option label="魏桥书院" value="魏桥书院"></el-option>
          </el-select>
          <el-input
            v-model="filters.keyword"
            placeholder="请输入班级名称"
            clearable
            style="width: 200px;"
            @keyup.enter="fetchClasses"
          >
            <template #append>
              <el-button icon="Search" @click="fetchClasses" />
            </template>
          </el-input>
          <el-button @click="clearFilters">清空筛选</el-button>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
          <div class="action-left">
            <el-button type="primary" @click="showAddDialog">班级建档</el-button>
            <el-button>延长课程</el-button>
            <el-button @click="handleExport">导出已选班级</el-button>
          </div>
          <el-button type="primary" @click="showImportDialog">批量导入</el-button>
        </div>

        <!-- 统计信息 -->
        <div class="stat-info">
          当前班级 共计 {{ pagination.total }} 个；其中 班级 {{ pagination.total }} 个，共计学员: {{ totalStudents }} 名，关联课程班级 {{ totalCourses }} 个
        </div>

        <!-- 表格 -->
        <el-table
          :data="tableData"
          style="width: 100%"
          border
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="code" label="班级名称" width="200" sortable>
            <template #default="{ row }">
              <div class="class-name">
                <el-tag size="small" type="success">班</el-tag>
                <span>{{ row.code }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="人数" width="100" sortable>
            <template #default="{ row }">
              {{ row.studentCount }}/{{ row.capacity }}
            </template>
          </el-table-column>
          <el-table-column prop="teacher" label="班主任" width="120" />
          <el-table-column prop="course" label="所属课程" width="200" />
          <el-table-column label="开始结束时间" width="220" sortable>
            <template #default="{ row }">
              {{ row.startDate }} ~ {{ row.endDate || '进行中' }}
            </template>
          </el-table-column>
          <el-table-column label="上课时间" width="250">
            <template #default="{ row }">
              <span>{{ row.schedule || '每周一 ~ 19:10-11:10' }}</span>
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

      <!-- 导入记录 Tab -->
      <div v-show="activeTab === 'import-records'">
        <div class="filter-bar">
          <el-date-picker
            v-model="importFilters.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 280px;"
          />
          <el-select v-model="importFilters.status" placeholder="导入状态" clearable style="width: 120px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="失败" value="failed"></el-option>
          </el-select>
          <el-button type="primary" @click="fetchImportRecords">搜索</el-button>
          <el-button @click="clearImportFilters">清空筛选</el-button>
        </div>

        <div class="stat-info">
          共找到 {{ importPagination.total }} 条导入记录
        </div>

        <el-table :data="importTableData" style="width: 100%" border stripe>
          <el-table-column prop="created_at" label="导入时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="filename" label="文件名" width="250" show-overflow-tooltip />
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="total_count" label="总数" width="100" />
          <el-table-column prop="success_count" label="成功" width="100">
            <template #default="{ row }">
              <span style="color: #67c23a;">{{ row.success_count }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fail_count" label="失败" width="100">
            <template #default="{ row }">
              <span :style="{ color: row.fail_count > 0 ? '#f56c6c' : '#67c23a' }">{{ row.fail_count }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'danger'">
                {{ row.status === 'completed' ? '已完成' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150">
            <template #default="{ row }">
              <el-button
                v-if="row.fail_count > 0"
                type="primary"
                link
                @click="handleViewFailDetails(row)"
              >
                查看失败详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="importPagination.current"
          v-model:page-size="importPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="importPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleImportSizeChange"
          @current-change="handleImportCurrentChange"
        />
      </div>

      <!-- 分班操作日志 Tab -->
      <div v-show="activeTab === 'assignment-logs'">
        <div class="filter-bar">
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
          <el-button @click="clearLogFilters">清空筛选</el-button>
        </div>

        <div class="stat-info">
          共找到 {{ logPagination.total }} 条记录
        </div>

        <el-table :data="logTableData" style="width: 100%" border stripe>
          <el-table-column prop="created_at" label="时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="student_name" label="学员" width="120" />
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

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入班级"
      width="600px"
      @close="resetImport"
    >
      <div class="import-content">
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".xlsx,.xls"
            drag
          >
            <div class="upload-inner">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">点击或拖拽您的文件到这里</div>
              <div class="upload-hint">仅支持xlsx、xls格式</div>
            </div>
          </el-upload>
        </div>

        <div class="import-tips">
          <p>1. 文件格式必须为Excel格式，请遵循标准模板填写；</p>
          <p>2. 导入数据中有重复班级将会覆盖，不存在的添加新记录；</p>
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

    <!-- 失败详情对话框 -->
    <el-dialog
      v-model="failDetailsDialogVisible"
      title="导入失败详情"
      width="700px"
    >
      <el-table :data="currentFailDetails" style="width: 100%" max-height="400">
        <el-table-column prop="row" label="行号" width="80" />
        <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Document, Search, ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadInstance } from 'element-plus'
import dayjs from 'dayjs'
import {
  getClassList,
  createClass,
  updateClass,
  deleteClass,
  finishClass,
  importClasses,
  getImportRecords
} from '@/api/class'
import { getAssignmentLogs } from '@/api/class-assignment'

const activeTab = ref('list')
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const failDetailsDialogVisible = ref(false)
const dialogTitle = ref('新建班级')
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<any>(null)
const importing = ref(false)
const importResult = ref<any>(null)
const currentFailDetails = ref<any[]>([])

// 筛选条件
const filters = reactive({
  classFilter: '',
  campus: '',
  courseType: '',
  teacher: '',
  orgStatus: '',
  status: '',
  teachingCampus: '',
  keyword: ''
})

// 导入记录筛选
const importFilters = reactive({
  dateRange: null as any,
  status: ''
})

// 日志筛选
const logFilters = reactive({
  operationType: '',
  dateRange: null as any,
  keyword: ''
})

// 表格数据
const tableData = ref<any[]>([])
const importTableData = ref<any[]>([])
const logTableData = ref<any[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const importPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const logPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表单数据
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

// 表单验证规则
const rules: FormRules = {
  code: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入班级容量', trigger: 'blur' }],
  teacher: [{ required: true, message: '请选择班主任', trigger: 'change' }],
  course: [{ required: true, message: '请选择课程', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开班日期', trigger: 'change' }]
}

// 统计数据
const totalStudents = computed(() => {
  return tableData.value.reduce((sum, c) => sum + (c.studentCount || 0), 0)
})

const totalCourses = computed(() => {
  return new Set(tableData.value.map(c => c.course)).size
})

// Tab切换
const handleTabChange = (name: string) => {
  if (name === 'import-records') {
    fetchImportRecords()
  } else if (name === 'assignment-logs') {
    fetchAssignmentLogs()
  }
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }

    if (filters.status) params.status = filters.status
    if (filters.teacher) params.teacher = filters.teacher
    if (filters.keyword) params.keyword = filters.keyword

    const res = await getClassList(params)

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
        status: item.status || '开班在读',
        schedule: '每周一 ~ 19:10-11:10'
      }))
      pagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

// 获取导入记录
const fetchImportRecords = async () => {
  try {
    const params: any = {
      page: importPagination.current,
      pageSize: importPagination.pageSize
    }

    if (importFilters.dateRange && importFilters.dateRange.length === 2) {
      params.startDate = importFilters.dateRange[0]
      params.endDate = importFilters.dateRange[1]
    }

    if (importFilters.status) {
      params.status = importFilters.status
    }

    const res = await getImportRecords(params)

    if (res.code === 200) {
      importTableData.value = res.data.list
      importPagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载导入记录失败')
  }
}

// 获取分班日志
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

// 清空筛选
const clearFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key as keyof typeof filters] = ''
  })
  fetchClasses()
}

const clearImportFilters = () => {
  importFilters.dateRange = null
  importFilters.status = ''
  fetchImportRecords()
}

const clearLogFilters = () => {
  logFilters.operationType = ''
  logFilters.dateRange = null
  logFilters.keyword = ''
  fetchAssignmentLogs()
}

// 新建班级
const showAddDialog = () => {
  dialogTitle.value = '班级建档'
  dialogVisible.value = true
}

// 编辑班级
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑班级'
  Object.assign(classForm, row)
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看班级: ${row.code}`)
}

// 结业班级
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

// 删除班级
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

// 提交表单
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

// 重置表单
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

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 显示导入对话框
const showImportDialog = () => {
  importDialogVisible.value = true
  importResult.value = null
  selectedFile.value = null
}

// 文件选择
const handleFileChange = (file: any) => {
  selectedFile.value = file
  importResult.value = null
}

// 移除文件
const removeFile = () => {
  selectedFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 下载模板
const downloadTemplate = () => {
  window.open('/templates/班级导入模板.xls', '_blank')
}

// 导入
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

// 重置导入
const resetImport = () => {
  selectedFile.value = null
  importResult.value = null
  importing.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 查看失败详情
const handleViewFailDetails = (row: any) => {
  currentFailDetails.value = row.fail_details || []
  failDetailsDialogVisible.value = true
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// 表格选择
const handleSelectionChange = (selection: any[]) => {
  console.log('选中的班级:', selection)
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchClasses()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchClasses()
}

const handleImportSizeChange = (size: number) => {
  importPagination.pageSize = size
  fetchImportRecords()
}

const handleImportCurrentChange = (page: number) => {
  importPagination.current = page
  fetchImportRecords()
}

const handleLogSizeChange = (size: number) => {
  logPagination.pageSize = size
  fetchAssignmentLogs()
}

const handleLogCurrentChange = (page: number) => {
  logPagination.current = page
  fetchAssignmentLogs()
}

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped lang="scss">
.classes-container {
  padding: 20px;

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    .action-left {
      display: flex;
      gap: 12px;
    }
  }

  .stat-info {
    margin-bottom: 16px;
    font-size: 14px;
    color: #666;
  }

  .class-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}

.import-content {
  .upload-area {
    margin-bottom: 20px;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 40px 20px;
    }

    .upload-inner {
      text-align: center;

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

      .upload-hint {
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
