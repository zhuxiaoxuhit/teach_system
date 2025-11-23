<template>
  <div class="upgrade-list">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新建升期</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="请输入升期名称"
        style="width: 300px"
        clearable
        @keyup.enter="fetchUpgrades"
      >
        <template #append>
          <el-button icon="Search" @click="fetchUpgrades" />
        </template>
      </el-input>
    </div>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border v-if="tableData.length > 0">
      <el-table-column prop="name" label="升期关系名称" min-width="200" />
      <el-table-column prop="period_count" label="期数" width="100" />
      <el-table-column prop="course_count" label="课程数" width="100" />
      <el-table-column prop="created_at" label="创建日期" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="很抱歉，这里什么都没有" :image-size="150" style="margin-top: 100px" />

    <el-pagination
      v-if="tableData.length > 0"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="fetchUpgrades"
      @current-change="fetchUpgrades"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="upgradeForm.id ? '编辑升期关系' : '新建升期关系'"
      width="700px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="upgradeForm" :rules="formRules" label-width="120px">
        <el-form-item label="升期关系名称" prop="name">
          <el-input v-model="upgradeForm.name" placeholder="请输入升期关系名称" />
        </el-form-item>

        <el-form-item label="升期期数">
          <el-table :data="upgradeForm.details" border style="width: 100%">
            <el-table-column label="期数" width="100">
              <template #default="{ row }">
                第{{ row.period_number }}期
              </template>
            </el-table-column>
            <el-table-column label="课程名称">
              <template #default="{ row, $index }">
                <el-select
                  v-model="row.course_id"
                  placeholder="选择课程"
                  filterable
                  style="width: 100%"
                  @change="handleCourseChange($index)"
                >
                  <el-option
                    v-for="course in availableCourses"
                    :key="course.id"
                    :label="course.name"
                    :value="course.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="removePeriod($index)"
                  :disabled="upgradeForm.details.length <= 1"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" plain style="width: 100%; margin-top: 10px" @click="addPeriod">
            新增期数
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'
import {
  getCourseUpgradeList,
  getCourseUpgradeDetail,
  createCourseUpgrade,
  updateCourseUpgrade,
  deleteCourseUpgrade,
  getCourseList,
  type CourseUpgradeRelation,
  type CourseUpgradeDetail,
  type Course
} from '@/api/course'

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<CourseUpgradeRelation[]>([])
const searchKeyword = ref('')
const availableCourses = ref<Course[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const upgradeForm = reactive<Partial<CourseUpgradeRelation>>({
  name: '',
  description: '',
  details: [
    { period_number: 1, course_id: 0 },
    { period_number: 2, course_id: 0 }
  ]
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入升期关系名称', trigger: 'blur' }]
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchUpgrades = async () => {
  try {
    const res = await getCourseUpgradeList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    })

    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载升期关系列表失败')
  }
}

const fetchCourses = async () => {
  try {
    const res = await getCourseList({ page: 1, pageSize: 1000 })
    if (res.code === 200) {
      availableCourses.value = res.data.list
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程列表失败')
  }
}

const handleAdd = () => {
  upgradeForm.details = [
    { period_number: 1, course_id: 0 },
    { period_number: 2, course_id: 0 }
  ]
  dialogVisible.value = true
}

const handleEdit = async (row: CourseUpgradeRelation) => {
  try {
    const res = await getCourseUpgradeDetail(row.id!)
    if (res.code === 200) {
      Object.assign(upgradeForm, res.data)
      dialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载升期关系详情失败')
  }
}

const handleDelete = async (row: CourseUpgradeRelation) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除升期关系"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCourseUpgrade(row.id!)
    ElMessage.success('删除成功')
    await fetchUpgrades()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const addPeriod = () => {
  const maxPeriod = upgradeForm.details!.length > 0
    ? Math.max(...upgradeForm.details!.map(d => d.period_number))
    : 0
  upgradeForm.details!.push({
    period_number: maxPeriod + 1,
    course_id: 0
  })
}

const removePeriod = (index: number) => {
  upgradeForm.details!.splice(index, 1)
  // 重新调整期数
  upgradeForm.details!.forEach((detail, idx) => {
    detail.period_number = idx + 1
  })
}

const handleCourseChange = (index: number) => {
  const courseId = upgradeForm.details![index].course_id
  const course = availableCourses.value.find(c => c.id === courseId)
  if (course) {
    upgradeForm.details![index].course_name = course.name
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 验证所有期数都选择了课程
        const hasEmptyCourse = upgradeForm.details!.some(d => !d.course_id || d.course_id === 0)
        if (hasEmptyCourse) {
          ElMessage.warning('请为所有期数选择课程')
          return
        }

        if (upgradeForm.id) {
          await updateCourseUpgrade(upgradeForm.id, upgradeForm)
          ElMessage.success('编辑成功')
        } else {
          await createCourseUpgrade(upgradeForm)
          ElMessage.success('新增成功')
        }

        await fetchUpgrades()
        dialogVisible.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const resetForm = () => {
  Object.assign(upgradeForm, {
    id: undefined,
    name: '',
    description: '',
    details: [
      { period_number: 1, course_id: 0 },
      { period_number: 2, course_id: 0 }
    ]
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchUpgrades()
  fetchCourses()
})
</script>

<style scoped lang="scss">
.upgrade-list {
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
