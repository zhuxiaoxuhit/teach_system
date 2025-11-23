<template>
  <div class="course-list">
    <div class="header-actions">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">新增课程</el-button>
        <el-button @click="showImportDialog">批量导入</el-button>
      </div>
      <div class="search-box">
        <el-select v-model="searchForm.status" placeholder="课程状态" clearable style="width: 150px; margin-right: 10px">
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select v-model="searchForm.category_id" placeholder="课程类别" clearable style="width: 150px; margin-right: 10px">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索课程名称"
          style="width: 300px"
          clearable
          @keyup.enter="fetchCourses"
        >
          <template #append>
            <el-button icon="Search" @click="fetchCourses" />
          </template>
        </el-input>
      </div>
    </div>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="课程名称" min-width="200" />
      <el-table-column prop="category_name" label="课程类别" width="120" />
      <el-table-column prop="teaching_mode" label="授课模式" width="100" />
      <el-table-column prop="charge_mode" label="收费模式" width="120" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="{ row }">
          <span>¥{{ row.price }}/{{ row.charge_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="100" />
      <el-table-column prop="total_lessons" label="总课时" width="100" />
      <el-table-column prop="campus" label="开课校区" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="fetchCourses"
      @current-change="fetchCourses"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="courseForm.id ? '编辑课程' : '新增课程'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="courseForm" :rules="formRules" label-width="120px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>

        <el-form-item label="课程类别" prop="category_id">
          <el-select v-model="courseForm.category_id" placeholder="请选择课程类别" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="授课模式" prop="teaching_mode">
          <el-radio-group v-model="courseForm.teaching_mode">
            <el-radio value="班课">班课</el-radio>
            <el-radio value="一对一">一对一</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="收费模式" prop="charge_mode">
          <el-select v-model="courseForm.charge_mode" placeholder="请选择收费模式" style="width: 100%">
            <el-option label="按课时收费" value="按课时收费" />
            <el-option label="按期收费" value="按期收费" />
            <el-option label="按月收费" value="按月收费" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="courseForm.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="charge_unit">
              <el-input v-model="courseForm.charge_unit" placeholder="课时/期/月" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程时长" prop="duration">
              <el-input-number v-model="courseForm.duration" :min="0" placeholder="分钟" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总课时数" prop="total_lessons">
              <el-input-number v-model="courseForm.total_lessons" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="开课校区" prop="campus">
          <el-input v-model="courseForm.campus" placeholder="请输入开课校区" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="停用">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="courseForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="课程导入"
      width="500px"
    >
      <div class="import-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xls,.xlsx"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>

        <div class="import-template">
          <el-link type="primary" :underline="false" @click="downloadTemplate">
            点击下载导入模板
          </el-link>
        </div>

        <div class="import-notice">
          <div class="notice-title">导入须知：</div>
          <ol>
            <li>红字标题的列为必填项</li>
            <li>请不要修改列次序，或修改头部；须知短信内容须展示完整，对接数据按无需匹配</li>
            <li>为保持导入处理效率，建议每次最多导入1000条</li>
          </ol>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadInstance, UploadFile } from 'element-plus'
import { getCourseList, createCourse, updateCourse, deleteCourse, getCourseCategories, importCourses, type Course, type CourseCategory } from '@/api/course'

const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const tableData = ref<Course[]>([])
const categories = ref<CourseCategory[]>([])
const importing = ref(false)
const uploadFile = ref<UploadFile | null>(null)

const searchForm = reactive({
  status: '',
  category_id: undefined as number | undefined,
  keyword: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const courseForm = reactive<Partial<Course>>({
  name: '',
  category_id: undefined,
  teaching_mode: '班课',
  charge_mode: '按课时收费',
  charge_unit: '课时',
  price: 0,
  campus: '',
  duration: 60,
  total_lessons: 0,
  status: '启用',
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  teaching_mode: [{ required: true, message: '请选择授课模式', trigger: 'change' }],
  charge_mode: [{ required: true, message: '请选择收费模式', trigger: 'change' }]
}

const fetchCourses = async () => {
  try {
    console.log('开始获取课程列表...')
    const res = await getCourseList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined,
      category_id: searchForm.category_id || undefined,
      keyword: searchForm.keyword || undefined
    })

    console.log('课程列表响应:', res)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
      console.log(`成功加载${res.data.list.length}条课程数据，总数:${res.data.total}`)
    }
  } catch (error: any) {
    console.error('加载课程列表失败:', error)
    ElMessage.error(error.message || '加载课程列表失败')
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCourseCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程类别失败')
  }
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleEdit = (row: Course) => {
  Object.assign(courseForm, row)
  dialogVisible.value = true
}

const showImportDialog = () => {
  importDialogVisible.value = true
  uploadFile.value = null
  uploadRef.value?.clearFiles()
}

const handleFileChange = (file: UploadFile) => {
  uploadFile.value = file
}

const downloadTemplate = () => {
  // 下载模板文件
  const link = document.createElement('a')
  link.href = '/templates/校宝课程信息导入模板.xls'
  link.download = '校宝课程信息导入模板.xls'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载模板文件')
}

const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', uploadFile.value.raw!)

    console.log('开始上传导入文件...')
    const res = await importCourses(formData)
    console.log('导入响应:', res)

    if (res.code === 200) {
      const { total, successCount, failCount, errors } = res.data

      let message = `导入完成！共${total}条，成功${successCount}条，失败${failCount}条`

      console.log('导入结果:', { total, successCount, failCount })

      if (errors && errors.length > 0) {
        message += '\n错误信息：\n' + errors.join('\n')
        ElMessageBox.alert(message, '导入结果', {
          confirmButtonText: '确定',
          type: failCount > 0 ? 'warning' : 'success'
        })
      } else {
        ElMessage.success(message)
      }

      // 刷新列表 - 重置到第一页并清空搜索条件
      console.log('准备刷新课程列表...')
      pagination.current = 1
      searchForm.status = ''
      searchForm.category_id = undefined
      searchForm.keyword = ''
      await fetchCourses()
      importDialogVisible.value = false
      console.log('导入流程完成')
    }
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

const handleDelete = async (row: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCourse(row.id!)
    ElMessage.success('删除成功')
    await fetchCourses()
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
        if (courseForm.id) {
          await updateCourse(courseForm.id, courseForm)
          ElMessage.success('编辑成功')
        } else {
          await createCourse(courseForm)
          ElMessage.success('新增成功')
        }

        await fetchCourses()
        dialogVisible.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const resetForm = () => {
  Object.assign(courseForm, {
    id: undefined,
    name: '',
    category_id: undefined,
    teaching_mode: '班课',
    charge_mode: '按课时收费',
    charge_unit: '课时',
    price: 0,
    campus: '',
    duration: 60,
    total_lessons: 0,
    status: '启用',
    remark: ''
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchCourses()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.course-list {
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-actions {
      display: flex;
      gap: 10px;
    }

    .search-box {
      display: flex;
      align-items: center;
    }
  }

  .import-content {
    .el-upload {
      width: 100%;
    }

    .import-template {
      text-align: center;
      margin-top: 20px;
    }

    .import-notice {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .notice-title {
        font-weight: 600;
        margin-bottom: 10px;
        color: #303133;
      }

      ol {
        margin: 0;
        padding-left: 20px;
        color: #606266;

        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
