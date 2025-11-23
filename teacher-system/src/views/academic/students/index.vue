<template>
  <div class="students-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="学员" name="all"></el-tab-pane>
        <el-tab-pane label="花名册" name="roster"></el-tab-pane>
        <el-tab-pane label="报送列表" name="report"></el-tab-pane>
        <el-tab-pane label="分班列表" name="class-assign"></el-tab-pane>
        <el-tab-pane label="学员成绩" name="grades"></el-tab-pane>
      </el-tabs>

      <div class="search-bar">
        <div class="search-left">
          <el-button type="primary" @click="showAddDialog">新增学员</el-button>
          <el-button @click="handleBatchImport">批量导入</el-button>
          <el-select v-model="searchForm.status" placeholder="学员状态" clearable style="width: 120px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="在读" value="在读"></el-option>
            <el-option label="已毕业" value="已毕业"></el-option>
          </el-select>
          <el-select v-model="searchForm.campus" placeholder="报读校区" clearable style="width: 120px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="魏桥书院" value="魏桥书院"></el-option>
          </el-select>
          <el-select v-model="searchForm.gender" placeholder="性别" clearable style="width: 100px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </div>
        <div class="search-right">
          <el-dropdown split-button type="primary">
            学员姓名
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>学员姓名</el-dropdown-item>
                <el-dropdown-item>手机号</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-input
            v-model="searchForm.searchValue"
            placeholder="请输入姓名、支持拼音缩写"
            clearable
            style="width: 250px;"
          >
            <template #append>
              <el-button icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </div>

      <div class="action-bar">
        <div class="action-left">
          <el-button @click="handleExport">导出当前信息</el-button>
          <el-button @click="handleSendNotice">发送通知公告</el-button>
          <el-button>批量调班</el-button>
          <el-button>批量打印二维码</el-button>
        </div>
        <div class="action-right">
          <el-button type="primary">自定义显示列</el-button>
        </div>
      </div>

      <div class="stat-info">
        当前结果：学员共计 {{ pagination.total }} 名，欠费共计 0.00 元
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="学员姓名" width="120" sortable>
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewStudent(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="relation" label="关系" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="schoolHomeStatus" label="校宝家关注" width="120">
          <template #default="{ row }">
            <el-icon v-if="row.isFollowed" color="#52c41a"><CircleCheck /></el-icon>
            <el-icon v-else color="#ccc"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="bindCard" label="磁卡绑定" width="120">
          <template #default="{ row }">
            <el-icon v-if="row.cardBound" color="#52c41a"><Checked /></el-icon>
            <el-icon v-else color="#ccc"><Close /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="starRating" label="人脉评级" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="欠费" width="100" sortable />
        <el-table-column prop="status" label="学员状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '在读' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="campus" label="报读校区" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑学员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="studentForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="学员姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入学员姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="家长关系" prop="relation">
          <el-select v-model="studentForm.relation" placeholder="请选择">
            <el-option label="父亲" value="父亲"></el-option>
            <el-option label="母亲" value="母亲"></el-option>
            <el-option label="爷爷" value="爷爷"></el-option>
            <el-option label="奶奶" value="奶奶"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker
            v-model="studentForm.birthday"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="报读校区" prop="campus">
          <el-select v-model="studentForm.campus" placeholder="请选择校区">
            <el-option label="魏桥书院" value="魏桥书院"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="studentForm.remark"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getStudentList, createStudent, updateStudent, deleteStudent } from '@/api/student'

const activeTab = ref('all')
const dialogVisible = ref(false)
const dialogTitle = ref('新增学员')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  status: '在读',
  campus: '',
  gender: '',
  relation: '',
  bindCard: '',
  source: '',
  campus2: '',
  isNew: '',
  searchValue: ''
})

const studentForm = reactive({
  id: '',
  name: '',
  gender: '男',
  relation: '母亲',
  phone: '',
  birthday: '',
  campus: '魏桥书院',
  remark: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  relation: [{ required: true, message: '请选择家长关系', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  campus: [{ required: true, message: '请选择校区', trigger: 'change' }]
}

// 生成更多Mock数据
const generateMockStudents = () => {
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨敏', '赵磊', '黄强', '周杰', '吴超',
    '徐丽', '孙勇', '马明', '朱红', '胡军', '郭涛', '林芳', '何敏', '高峰', '罗琳']
  const genders = ['男', '女']
  const relations = ['父亲', '母亲', '爷爷', '奶奶']

  const students = []
  for (let i = 0; i < 50; i++) {
    const gender = genders[Math.floor(Math.random() * 2)]
    students.push({
      id: String(i + 1),
      name: names[i % names.length] + (i > 19 ? i - 19 : ''),
      gender,
      relation: relations[Math.floor(Math.random() * 4)],
      phone: '1' + Math.floor(Math.random() * 9000000000 + 1000000000),
      isFollowed: Math.random() > 0.5,
      cardBound: Math.random() > 0.7,
      rating: Math.floor(Math.random() * 5),
      balance: 0,
      status: '在读',
      campus: '魏桥书院'
    })
  }
  return students
}

const tableData = ref(generateMockStudents())
const allStudents = ref([...tableData.value])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 50
})

const selectedRows = ref([])

const showAddDialog = () => {
  dialogTitle.value = '新增学员'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑学员'
  Object.assign(studentForm, row)
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除学员"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteStudent(row.id)
    ElMessage.success('删除成功')
    // 重新加载数据
    await fetchStudents()
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
        if (studentForm.id) {
          // 编辑
          await updateStudent(studentForm.id, studentForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createStudent(studentForm)
          ElMessage.success('新增成功')
        }
        // 重新加载数据
        await fetchStudents()
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
  studentForm.id = ''
  studentForm.name = ''
  studentForm.gender = '男'
  studentForm.relation = '母亲'
  studentForm.phone = ''
  studentForm.birthday = ''
  studentForm.campus = '魏桥书院'
  studentForm.remark = ''
}

const handleSearch = () => {
  let filtered = [...allStudents.value]

  if (searchForm.status) {
    filtered = filtered.filter(s => s.status === searchForm.status)
  }
  if (searchForm.campus) {
    filtered = filtered.filter(s => s.campus === searchForm.campus)
  }
  if (searchForm.gender) {
    filtered = filtered.filter(s => s.gender === searchForm.gender)
  }
  if (searchForm.searchValue) {
    filtered = filtered.filter(s => s.name.includes(searchForm.searchValue) || s.phone.includes(searchForm.searchValue))
  }

  pagination.total = filtered.length
  pagination.current = 1
  tableData.value = filtered.slice(0, pagination.pageSize)
  ElMessage.success(`找到 ${filtered.length} 条记录`)
}

const handleViewStudent = (row: any) => {
  ElMessage.info(`查看学员: ${row.name}`)
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleSendNotice = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择学员')
    return
  }
  ElMessage.success(`向 ${selectedRows.value.length} 名学员发送通知`)
}

const handleSelectionChange = (selection: any) => {
  selectedRows.value = selection
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
  tableData.value = allStudents.value.slice(start, end)
}

// 从后端获取学员数据
const fetchStudents = async () => {
  try {
    const res = await getStudentList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined,
      name: searchForm.searchValue || undefined
    })

    if (res.code === 200) {
      // 将后端数据映射为前端格式
      tableData.value = res.data.list.map((student: any) => ({
        id: student.id,
        name: student.name,
        gender: student.gender,
        relation: student.parent_relation || '母亲',
        phone: student.phone,
        isFollowed: false,
        cardBound: false,
        rating: 0,
        balance: 0,
        status: student.status,
        campus: student.campus
      }))
      pagination.total = res.data.total
      allStudents.value = [...tableData.value]
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    // 如果后端失败，使用 mock 数据
    tableData.value = generateMockStudents()
    allStudents.value = [...tableData.value]
    pagination.total = tableData.value.length
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

<style scoped lang="scss">
.students-container {
  .search-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;

    .search-left,
    .search-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
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

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
