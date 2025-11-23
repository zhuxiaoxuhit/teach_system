<template>
  <div class="category-list">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新建课程类别</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="请输入课程大类名称"
        style="width: 300px"
        clearable
        @keyup.enter="fetchCategories"
      >
        <template #append>
          <el-button icon="Search" @click="fetchCategories" />
        </template>
      </el-input>
    </div>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px" border>
      <el-table-column prop="sort_order" label="序号" width="100" />
      <el-table-column prop="name" label="课程类别" min-width="200" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="categoryForm.id ? '编辑课程类别' : '新建课程类别'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="categoryForm" :rules="formRules" label-width="100px">
        <el-form-item label="序号" prop="sort_order">
          <el-input-number v-model="categoryForm.sort_order" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="类别名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入课程类别" />
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
import { getCourseCategories, createCourseCategory, updateCourseCategory, deleteCourseCategory, type CourseCategory } from '@/api/course'

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<CourseCategory[]>([])
const searchKeyword = ref('')

const categoryForm = reactive<Partial<CourseCategory>>({
  name: '',
  sort_order: 0
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }],
  sort_order: [{ required: true, message: '请输入序号', trigger: 'blur' }]
}

const fetchCategories = async () => {
  try {
    const res = await getCourseCategories()
    if (res.code === 200) {
      let data = res.data
      if (searchKeyword.value) {
        data = data.filter((item: CourseCategory) =>
          item.name.includes(searchKeyword.value)
        )
      }
      tableData.value = data
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程类别失败')
  }
}

const handleAdd = () => {
  // 自动设置序号为当前最大序号+1
  const maxOrder = tableData.value.length > 0
    ? Math.max(...tableData.value.map(item => item.sort_order))
    : 0
  categoryForm.sort_order = maxOrder + 1
  dialogVisible.value = true
}

const handleEdit = (row: CourseCategory) => {
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

const handleDelete = async (row: CourseCategory) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程类别"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCourseCategory(row.id)
    ElMessage.success('删除成功')
    await fetchCategories()
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
        if (categoryForm.id) {
          await updateCourseCategory(categoryForm.id, categoryForm)
          ElMessage.success('编辑成功')
        } else {
          await createCourseCategory(categoryForm)
          ElMessage.success('新增成功')
        }

        await fetchCategories()
        dialogVisible.value = false
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const resetForm = () => {
  Object.assign(categoryForm, {
    id: undefined,
    name: '',
    sort_order: 0
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.category-list {
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
