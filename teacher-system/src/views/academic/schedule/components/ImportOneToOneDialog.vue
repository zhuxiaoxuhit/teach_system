<template>
  <el-dialog
    v-model="dialogVisible"
    title="一对一排课导入"
    width="800px"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 上传区域 -->
      <div class="upload-area">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
          accept=".xlsx,.xls"
          drag
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件
              <el-link type="primary" @click="downloadTemplate">下载导入模板</el-link>
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 导入说明 -->
      <div class="import-tips">
        <h4>导入说明：</h4>
        <ol>
          <li>请先下载导入模板，按照模板格式填写数据</li>
          <li>必填字段：学员姓名、课程名称、教师、教室、上课日期、开始时间、结束时间</li>
          <li>日期格式：YYYY-MM-DD，例如：2025-11-23</li>
          <li>时间格式：HH:mm，例如：09:00</li>
          <li>系统会自动检测时间冲突，冲突的排课将不会导入</li>
        </ol>
      </div>

      <!-- 预览数据 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <h4>预览数据（共 {{ previewData.length }} 条）：</h4>
        <el-table
          :data="previewData"
          max-height="300"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="studentName" label="学员" width="100" />
          <el-table-column prop="courseName" label="课程" width="120" />
          <el-table-column prop="teacherName" label="教师" width="80" />
          <el-table-column prop="classroom" label="教室" width="100" />
          <el-table-column prop="scheduleDate" label="日期" width="110" />
          <el-table-column label="时间" width="120">
            <template #default="{ row }">
              {{ row.startTime }}-{{ row.endTime }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.valid ? 'success' : 'danger'" size="small">
                {{ row.valid ? '有效' : '无效' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="importing"
        :disabled="previewData.length === 0"
        @click="handleImport"
      >
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { importOneToOne } from '@/api/schedules'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const dialogVisible = ref(false)
const uploadRef = ref()
const fileList = ref<any[]>([])
const previewData = ref<any[]>([])
const importing = ref(false)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 文件变化
const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e: any) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 解析数据
      previewData.value = jsonData.map((row: any) => {
        const valid = validateRow(row)
        return {
          studentName: row['学员姓名'] || row['studentName'],
          courseName: row['课程名称'] || row['courseName'],
          teacherName: row['教师'] || row['teacherName'],
          classroom: row['教室'] || row['classroom'],
          scheduleDate: row['上课日期'] || row['scheduleDate'],
          startTime: row['开始时间'] || row['startTime'],
          endTime: row['结束时间'] || row['endTime'],
          valid
        }
      })

      ElMessage.success('文件解析成功')
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

// 验证行数据
const validateRow = (row: any) => {
  const required = ['学员姓名', '课程名称', '教师', '教室', '上课日期', '开始时间', '结束时间']
  return required.every(field => row[field])
}

// 下载模板
const downloadTemplate = () => {
  const template = [
    {
      '学员姓名': '张三',
      '课程名称': '一对一课程',
      '教师': '李老师',
      '教室': '1F教室1',
      '上课日期': '2025-11-23',
      '开始时间': '09:00',
      '结束时间': '10:00',
      '备注': ''
    }
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '排课模板')
  XLSX.writeFile(wb, '一对一排课导入模板.xlsx')
  ElMessage.success('模板下载成功')
}

// 导入
const handleImport = async () => {
  const validData = previewData.value.filter(item => item.valid)

  if (validData.length === 0) {
    ElMessage.warning('没有有效的数据可导入')
    return
  }

  importing.value = true
  try {
    // 这里需要先查询学员ID
    const schedules = validData.map(item => ({
      studentId: null, // 需要通过学员姓名查询获得
      courseName: item.courseName,
      teacherName: item.teacherName,
      classroom: item.classroom,
      scheduleDate: item.scheduleDate,
      startTime: item.startTime,
      endTime: item.endTime
    }))

    const res = await importOneToOne({ schedules })
    if (res.code === 200) {
      ElMessage.success(
        `导入成功！共导入 ${res.data.successCount} 条，冲突 ${res.data.conflictCount} 条`
      )
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  fileList.value = []
  previewData.value = []
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.import-container {
  .upload-area {
    margin-bottom: 20px;

    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }

  .import-tips {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
    }

    ol {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: #606266;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .preview-section {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
