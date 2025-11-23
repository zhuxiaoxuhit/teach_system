<template>
  <div class="students-container">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="花名册" name="roster"></el-tab-pane>
        <el-tab-pane label="报读列表" name="enrollments"></el-tab-pane>
        <el-tab-pane label="分班列表" name="class-assignments"></el-tab-pane>
        <el-tab-pane label="学员成绩" name="scores"></el-tab-pane>
      </el-tabs>

      <!-- 花名册 Tab -->
      <div v-show="activeTab === 'roster'">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button type="primary" @click="showAddDialog">新增学员</el-button>
            <el-button @click="showImportDialog">批量导入</el-button>
            <el-select v-model="rosterFilters.status" placeholder="学员状态" clearable style="width: 120px;" @change="loadRosterData">
              <el-option label="在读" value="在读"></el-option>
              <el-option label="晓课堂书院" value="晓课堂书院"></el-option>
            </el-select>
            <el-select v-model="rosterFilters.campus" placeholder="报读校区" clearable style="width: 120px;" @change="loadRosterData">
              <el-option label="魏桥书院" value="魏桥书院"></el-option>
            </el-select>
            <el-select v-model="rosterFilters.gender" placeholder="性别" clearable style="width: 100px;" @change="loadRosterData">
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
            </el-select>
            <el-select v-model="rosterFilters.relation" placeholder="是否关注法宝家" clearable style="width: 150px;">
              <el-option label="已关注" value="1"></el-option>
              <el-option label="未关注" value="0"></el-option>
            </el-select>
            <el-select placeholder="是否绑磁卡" clearable style="width: 120px;">
              <el-option label="已绑定" value="1"></el-option>
              <el-option label="未绑定" value="0"></el-option>
            </el-select>
            <el-select placeholder="是否录入人脉" clearable style="width: 130px;"></el-select>
            <el-select placeholder="建档人" clearable style="width: 100px;"></el-select>
          </div>
          <div class="toolbar-right">
            <el-dropdown split-button>
              学员姓名
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>学员姓名</el-dropdown-item>
                  <el-dropdown-item>手机号</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-input
              v-model="rosterFilters.keyword"
              placeholder="请输入姓名、支持拼音缩写"
              clearable
              style="width: 250px;"
              @keyup.enter="loadRosterData"
            >
              <template #append>
                <el-button icon="Search" @click="loadRosterData" />
              </template>
            </el-input>
            <el-button type="primary">更多筛选</el-button>
            <el-button>清空筛选</el-button>
          </div>
        </div>

        <div class="action-bar">
          <el-button>导出当前信息</el-button>
          <el-button>发送通知公告</el-button>
          <el-button>新建成绩单</el-button>
          <el-button>批量调班</el-button>
          <el-button>批量打印二维码</el-button>
          <el-button type="primary">自定义显示列</el-button>
        </div>

        <div class="stat-info">
          当前结果：学员共计 {{ rosterPagination.total }} 名，欠费共计 {{ totalBalance.toFixed(2) }} 元
        </div>

        <el-table
          :data="rosterData"
          style="width: 100%"
          stripe
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="学员姓名" width="120" sortable>
            <template #default="{ row }">
              <el-link type="primary">{{ row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="relation" label="关系" width="100" />
          <el-table-column prop="phone" label="联系电话" width="140" />
          <el-table-column label="校宝家关注" width="120">
            <template #default="{ row }">
              <el-icon v-if="row.is_followed" color="#52c41a"><CircleCheck /></el-icon>
              <el-icon v-else color="#ccc"><CircleClose /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="磁卡绑定" width="120">
            <template #default="{ row }">
              <el-icon v-if="row.card_bound" color="#52c41a"><Check /></el-icon>
              <el-icon v-else color="#ccc"><Close /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="人脉评级" width="120">
            <template #default="{ row }">
              <el-rate v-model="row.rating" disabled size="small" />
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
          v-model:current-page="rosterPagination.current"
          v-model:page-size="rosterPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="rosterPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleRosterSizeChange"
          @current-change="handleRosterPageChange"
        />
      </div>

      <!-- 报读列表 Tab -->
      <div v-show="activeTab === 'enrollments'">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button>发送通知公告</el-button>
            <el-button>新建成绩单</el-button>
            <el-button>批量调班</el-button>
            <el-button>批量打印</el-button>
            <el-select v-model="enrollmentFilters.campus" placeholder="报读校区" clearable style="width: 120px;" @change="loadEnrollmentData">
              <el-option label="魏桥书院" value="魏桥书院"></el-option>
            </el-select>
            <el-select v-model="enrollmentFilters.courseType" placeholder="课程类型" clearable style="width: 120px;" @change="loadEnrollmentData">
              <el-option label="农小硬笔" value="农小硬笔"></el-option>
            </el-select>
            <el-select v-model="enrollmentFilters.status" placeholder="状态" clearable style="width: 100px;" @change="loadEnrollmentData">
              <el-option label="在读" value="在读"></el-option>
              <el-option label="晓课堂书院" value="晓课堂书院"></el-option>
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-dropdown split-button>
              学员姓名
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>学员姓名</el-dropdown-item>
                  <el-dropdown-item>手机号</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-input
              v-model="enrollmentFilters.keyword"
              placeholder="请输入姓名、支持拼音缩写"
              clearable
              style="width: 250px;"
              @keyup.enter="loadEnrollmentData"
            >
              <template #append>
                <el-button icon="Search" @click="loadEnrollmentData" />
              </template>
            </el-input>
            <el-button type="primary">更多筛选</el-button>
            <el-button>清空筛选</el-button>
          </div>
        </div>

        <div class="stat-info">
          当前结果：学员报读共计 {{ enrollmentPagination.total }} 条，报读课时共计 {{ enrollmentStats.totalHours }} 元
        </div>

        <el-table :data="enrollmentData" style="width: 100%" stripe border>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="student_name" label="学员姓名" width="120" sortable />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="relation" label="联系方式" width="100" />
          <el-table-column prop="phone" label="联系电话" width="140" />
          <el-table-column prop="course_type" label="课程类型" width="120" />
          <el-table-column prop="course_name" label="课程名称" width="150" />
          <el-table-column prop="total_class_hours" label="总课时" width="100" sortable />
          <el-table-column prop="used_class_hours" label="已用课时" width="100" sortable />
          <el-table-column prop="remaining_class_hours" label="剩余课时" width="100" sortable />
          <el-table-column prop="total_amount" label="合计" width="100" />
          <el-table-column prop="paid_amount" label="已付" width="100" />
          <el-table-column prop="discount_amount" label="优惠" width="100" />
          <el-table-column prop="refund_amount" label="退费" width="100" />
          <el-table-column prop="balance" label="欠费" width="100" sortable />
          <el-table-column prop="campus" label="校区" width="120" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link>详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="enrollmentPagination.current"
          v-model:page-size="enrollmentPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="enrollmentPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleEnrollmentSizeChange"
          @current-change="handleEnrollmentPageChange"
        />
      </div>

      <!-- 分班列表 Tab -->
      <div v-show="activeTab === 'class-assignments'">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button>新建作业交流群</el-button>
            <el-select v-model="assignmentFilters.campus" placeholder="上课校区" clearable style="width: 120px;" @change="loadAssignmentData">
              <el-option label="魏桥书院" value="魏桥书院"></el-option>
            </el-select>
            <el-select v-model="assignmentFilters.courseType" placeholder="课程类型" clearable style="width: 120px;" @change="loadAssignmentData">
              <el-option label="农小硬笔" value="农小硬笔"></el-option>
            </el-select>
            <el-select v-model="assignmentFilters.className" placeholder="分班日期" clearable style="width: 150px;" @change="loadAssignmentData"></el-select>
            <el-select v-model="assignmentFilters.status" placeholder="是否开班" clearable style="width: 120px;" @change="loadAssignmentData">
              <el-option label="随堂班" value="随堂班"></el-option>
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-dropdown split-button>
              学员姓名
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>学员姓名</el-dropdown-item>
                  <el-dropdown-item>支持拼音搜索</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-input
              v-model="assignmentFilters.keyword"
              placeholder="请输入姓名、支持拼音缩写"
              clearable
              style="width: 250px;"
              @keyup.enter="loadAssignmentData"
            >
              <template #append>
                <el-button icon="Search" @click="loadAssignmentData" />
              </template>
            </el-input>
            <el-button>清空筛选</el-button>
          </div>
        </div>

        <div class="stat-info">
          当前结果：学员分班记录共计 {{ assignmentPagination.total }} 条
        </div>

        <el-table :data="assignmentData" style="width: 100%" stripe border>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="student_name" label="学员姓名" width="120" sortable />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="phone" label="联系方式" width="140" />
          <el-table-column prop="course_type" label="课程类型" width="120" />
          <el-table-column prop="course_name" label="课程名称" width="150" />
          <el-table-column prop="class_name" label="班级" width="150" />
          <el-table-column prop="classroom" label="上课校区" width="120" />
          <el-table-column prop="teacher" label="老师" width="100" />
          <el-table-column prop="schedule" label="上课时间" width="150" />
          <el-table-column prop="class_type" label="班型" width="100" />
          <el-table-column prop="enrollment_date" label="报班日期" width="120" />
          <el-table-column prop="start_date" label="开班日期" width="120" />
          <el-table-column prop="end_date" label="结班日期" width="120" />
          <el-table-column prop="status" label="是否开班" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '在读' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link>未开班</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="assignmentPagination.current"
          v-model:page-size="assignmentPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="assignmentPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleAssignmentSizeChange"
          @current-change="handleAssignmentPageChange"
        />
      </div>

      <!-- 学员成绩 Tab -->
      <div v-show="activeTab === 'scores'">
        <div class="score-tabs">
          <el-button :type="scoreTab === 'manage' ? 'primary' : ''" @click="scoreTab = 'manage'">成绩管理</el-button>
          <el-button :type="scoreTab === 'project' ? 'primary' : ''" @click="scoreTab = 'project'">项目设置</el-button>
          <el-button :type="scoreTab === 'exam' ? 'primary' : ''" @click="scoreTab = 'exam'">考试设置</el-button>
        </div>

        <div v-show="scoreTab === 'manage'">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-button type="primary">录入成绩</el-button>
              <el-select v-model="scoreFilters.courseName" placeholder="来源" clearable style="width: 120px;" @change="loadScoreData">
                <el-option label="项目" value="项目"></el-option>
              </el-select>
              <el-select v-model="scoreFilters.className" placeholder="班级" clearable style="width: 120px;" @change="loadScoreData"></el-select>
              <el-select v-model="scoreFilters.examType" placeholder="考试" clearable style="width: 120px;" @change="loadScoreData"></el-select>
              <el-date-picker
                v-model="scoreDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="考试日期"
                end-placeholder="结束日期"
                style="width: 240px;"
                @change="handleScoreDateChange"
              />
            </div>
            <div class="toolbar-right">
              <el-dropdown split-button>
                学员姓名
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>学员姓名</el-dropdown-item>
                    <el-dropdown-item>支持拼音搜索</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-input
                v-model="scoreFilters.keyword"
                placeholder="请输入姓名、支持拼音缩写"
                clearable
                style="width: 250px;"
                @keyup.enter="loadScoreData"
              >
                <template #append>
                  <el-button icon="Search" @click="loadScoreData" />
                </template>
              </el-input>
              <el-button>清空筛选</el-button>
            </div>
          </div>

          <div class="stat-info">
            当前结果：共计 {{ scorePagination.total }} 条
          </div>

          <el-table :data="scoreData" style="width: 100%" stripe border>
            <el-table-column type="selection" width="55" />
            <el-table-column prop="student_name" label="学员姓名" width="120" sortable />
            <el-table-column prop="gender" label="关系" width="80" />
            <el-table-column prop="phone" label="联系方式" width="140" />
            <el-table-column prop="course_name" label="项目" width="150" />
            <el-table-column prop="score" label="成绩" width="100" sortable>
              <template #default="{ row }">
                <span :style="{ color: row.score >= 60 ? '#67C23A' : '#F56C6C' }">
                  {{ row.score }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="class_name" label="来源" width="150" />
            <el-table-column prop="exam_date" label="考试日期" width="120" sortable />
            <el-table-column prop="exam_type" label="考试" width="120" />
            <el-table-column prop="class_count" label="班级名称" width="120" />
            <el-table-column prop="remark" label="备注" min-width="150" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link>编辑</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="scorePagination.current"
            v-model:page-size="scorePagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="scorePagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleScoreSizeChange"
            @current-change="handleScorePageChange"
          />
        </div>
      </div>
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
          <el-select v-model="studentForm.relation" placeholder="请选择" style="width: 100%;">
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
          <el-select v-model="studentForm.campus" placeholder="请选择校区" style="width: 100%;">
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

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="学员导入"
      width="600px"
      @close="resetImportDialog"
    >
      <div class="import-steps">
        <el-steps :active="importStep" align-center>
          <el-step title="上传文件" />
          <el-step title="检测内容" />
          <el-step title="检测数据" />
          <el-step title="完成导入" />
        </el-steps>

        <!-- 步骤1：上传文件 -->
        <div v-show="importStep === 0" class="import-step-content">
          <div class="upload-area">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <p class="upload-text">单击或拖动文件到此区域进行上传</p>
            <p class="upload-hint">上传已填写好的学员信息Excel文件，仅支持.xls或.xlsx的文件</p>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".xls,.xlsx"
              drag
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
            <div v-if="uploadFile" class="file-info">
              已选择文件：{{ uploadFile.name }}
            </div>
          </div>
          <div class="template-download">
            <p>下载导入模板，并按照要求填写</p>
            <el-link type="primary" :underline="false">（按模板）学员导入模板.xls</el-link>
            <el-link type="primary" :underline="false">（按问卷）学员导入模板.xls</el-link>
          </div>
          <div class="import-tips">
            <p>• 请务必先下载上方最新版本的导入模板填写</p>
            <p>• 每次最多支持导入1000条数据</p>
            <p>• 请勿修改任何模板格式，仅填写内容即可。文字内容首尾勿留空格或回车</p>
          </div>
        </div>

        <!-- 步骤2-4：检测和导入结果 -->
        <div v-show="importStep > 0" class="import-result">
          <div v-if="importStep === 1" class="checking">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>正在检测内容...</p>
          </div>
          <div v-if="importStep === 2" class="checking">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>正在检测数据...</p>
          </div>
          <div v-if="importStep === 3" class="result">
            <el-result
              :icon="importResult.success ? 'success' : 'warning'"
              :title="importResult.message"
            >
              <template #sub-title>
                <p v-if="importResult.successCount > 0">成功导入 {{ importResult.successCount }} 条</p>
                <p v-if="importResult.failCount > 0" style="color: #F56C6C;">失败 {{ importResult.failCount }} 条</p>
                <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
                  <p v-for="(error, index) in importResult.errors" :key="index">{{ error }}</p>
                </div>
              </template>
            </el-result>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button v-if="importStep === 0" @click="importDialogVisible = false">取消</el-button>
        <el-button v-if="importStep === 0" type="primary" :disabled="!uploadFile" @click="handleImport">上传</el-button>
        <el-button v-if="importStep === 3" type="primary" @click="importDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, CircleClose, Check, Close, Search, Upload, Loading } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getStudentList,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  getEnrollmentList,
  getClassAssignmentList,
  getScoreList
} from '@/api/student'

const activeTab = ref('roster')
const scoreTab = ref('manage')
const dialogVisible = ref(false)
const dialogTitle = ref('新增学员')
const formRef = ref<FormInstance>()
const importDialogVisible = ref(false)
const importStep = ref(0)
const uploadFile = ref<File | null>(null)
const uploadRef = ref()

// 花名册筛选条件
const rosterFilters = reactive({
  keyword: '',
  status: '在读',
  campus: '',
  gender: '',
  relation: ''
})

// 报读列表筛选条件
const enrollmentFilters = reactive({
  keyword: '',
  campus: '',
  courseType: '',
  status: ''
})

// 分班列表筛选条件
const assignmentFilters = reactive({
  keyword: '',
  campus: '',
  courseType: '',
  className: '',
  status: ''
})

// 成绩筛选条件
const scoreFilters = reactive({
  keyword: '',
  courseName: '',
  className: '',
  examType: '',
  startDate: '',
  endDate: ''
})

const scoreDateRange = ref<[Date, Date] | null>(null)

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

const rosterData = ref([])
const enrollmentData = ref([])
const assignmentData = ref([])
const scoreData = ref([])

const rosterPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const enrollmentPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const assignmentPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const scorePagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const enrollmentStats = reactive({
  totalHours: 0
})

const importResult = reactive({
  success: true,
  message: '',
  successCount: 0,
  failCount: 0,
  errors: []
})

const totalBalance = computed(() => {
  return rosterData.value.reduce((sum, s) => sum + parseFloat(s.balance || 0), 0)
})

const selectedRows = ref([])

// Tab切换
const handleTabChange = (tabName: string) => {
  switch (tabName) {
    case 'roster':
      loadRosterData()
      break
    case 'enrollments':
      loadEnrollmentData()
      break
    case 'class-assignments':
      loadAssignmentData()
      break
    case 'scores':
      loadScoreData()
      break
  }
}

// ==================== 花名册相关 ====================

const loadRosterData = async () => {
  try {
    const res = await getStudentList({
      page: rosterPagination.current,
      pageSize: rosterPagination.pageSize,
      keyword: rosterFilters.keyword,
      status: rosterFilters.status,
      campus: rosterFilters.campus,
      gender: rosterFilters.gender,
      relation: rosterFilters.relation
    })

    if (res.code === 200) {
      rosterData.value = res.data.list
      rosterPagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

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
    await loadRosterData()
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
          await updateStudent(studentForm.id, studentForm)
          ElMessage.success('编辑成功')
        } else {
          await createStudent(studentForm)
          ElMessage.success('新增成功')
        }
        await loadRosterData()
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

const handleRosterSizeChange = (size: number) => {
  rosterPagination.pageSize = size
  loadRosterData()
}

const handleRosterPageChange = (page: number) => {
  rosterPagination.current = page
  loadRosterData()
}

// ==================== 批量导入相关 ====================

const showImportDialog = () => {
  importDialogVisible.value = true
  importStep.value = 0
}

const resetImportDialog = () => {
  importStep.value = 0
  uploadFile.value = null
  importResult.success = true
  importResult.message = ''
  importResult.successCount = 0
  importResult.failCount = 0
  importResult.errors = []
}

const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  try {
    importStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 1000))

    importStep.value = 2
    await new Promise(resolve => setTimeout(resolve, 1000))

    const res = await importStudents(uploadFile.value)

    importStep.value = 3
    if (res.code === 200) {
      importResult.success = true
      importResult.message = res.message || '导入完成'
      importResult.successCount = res.data.successCount
      importResult.failCount = res.data.failCount
      importResult.errors = res.data.failedRows?.map((r: any) => `${r.name}: ${r.error}`) || []

      await loadRosterData()
    }
  } catch (error: any) {
    importStep.value = 3
    importResult.success = false
    importResult.message = '导入失败'
    importResult.errors = [error.message || '未知错误']
  }
}

// ==================== 报读列表相关 ====================

const loadEnrollmentData = async () => {
  try {
    const res = await getEnrollmentList({
      page: enrollmentPagination.current,
      pageSize: enrollmentPagination.pageSize,
      keyword: enrollmentFilters.keyword,
      campus: enrollmentFilters.campus,
      courseType: enrollmentFilters.courseType,
      status: enrollmentFilters.status
    })

    if (res.code === 200) {
      enrollmentData.value = res.data.list
      enrollmentPagination.total = res.data.total
      enrollmentStats.totalHours = res.data.list.reduce((sum: number, item: any) => sum + (parseFloat(item.total_class_hours) || 0), 0)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

const handleEnrollmentSizeChange = (size: number) => {
  enrollmentPagination.pageSize = size
  loadEnrollmentData()
}

const handleEnrollmentPageChange = (page: number) => {
  enrollmentPagination.current = page
  loadEnrollmentData()
}

// ==================== 分班列表相关 ====================

const loadAssignmentData = async () => {
  try {
    const res = await getClassAssignmentList({
      page: assignmentPagination.current,
      pageSize: assignmentPagination.pageSize,
      keyword: assignmentFilters.keyword,
      campus: assignmentFilters.campus,
      courseType: assignmentFilters.courseType,
      className: assignmentFilters.className,
      status: assignmentFilters.status
    })

    if (res.code === 200) {
      assignmentData.value = res.data.list
      assignmentPagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

const handleAssignmentSizeChange = (size: number) => {
  assignmentPagination.pageSize = size
  loadAssignmentData()
}

const handleAssignmentPageChange = (page: number) => {
  assignmentPagination.current = page
  loadAssignmentData()
}

// ==================== 学员成绩相关 ====================

const loadScoreData = async () => {
  try {
    const res = await getScoreList({
      page: scorePagination.current,
      pageSize: scorePagination.pageSize,
      keyword: scoreFilters.keyword,
      courseName: scoreFilters.courseName,
      className: scoreFilters.className,
      examType: scoreFilters.examType,
      startDate: scoreFilters.startDate,
      endDate: scoreFilters.endDate
    })

    if (res.code === 200) {
      scoreData.value = res.data.list
      scorePagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

const handleScoreDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    scoreFilters.startDate = dates[0].toISOString().split('T')[0]
    scoreFilters.endDate = dates[1].toISOString().split('T')[0]
  } else {
    scoreFilters.startDate = ''
    scoreFilters.endDate = ''
  }
  loadScoreData()
}

const handleScoreSizeChange = (size: number) => {
  scorePagination.pageSize = size
  loadScoreData()
}

const handleScorePageChange = (page: number) => {
  scorePagination.current = page
  loadScoreData()
}

const handleSelectionChange = (selection: any) => {
  selectedRows.value = selection
}

onMounted(() => {
  loadRosterData()
})
</script>

<style scoped lang="scss">
.students-container {
  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
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

  .score-tabs {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }

  .import-steps {
    padding: 20px 0;

    .import-step-content {
      margin-top: 30px;

      .upload-area {
        text-align: center;
        padding: 40px;
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        margin-bottom: 20px;

        .upload-icon {
          font-size: 48px;
          color: #409eff;
        }

        .upload-text {
          margin: 10px 0;
          font-size: 16px;
          color: #606266;
        }

        .upload-hint {
          margin-bottom: 20px;
          font-size: 12px;
          color: #909399;
        }

        .file-info {
          margin-top: 10px;
          color: #67c23a;
        }
      }

      .template-download {
        margin-bottom: 20px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;

        p {
          margin-bottom: 10px;
          color: #606266;
        }

        .el-link {
          margin-right: 15px;
        }
      }

      .import-tips {
        padding: 15px;
        background: #fff7e6;
        border-left: 3px solid #faad14;
        border-radius: 4px;

        p {
          margin: 5px 0;
          font-size: 13px;
          color: #606266;
        }
      }
    }

    .import-result {
      margin-top: 30px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      .checking {
        text-align: center;

        .loading-icon {
          font-size: 48px;
          color: #409eff;
          animation: rotating 2s linear infinite;
        }

        p {
          margin-top: 20px;
          font-size: 16px;
          color: #606266;
        }
      }

      .error-list {
        margin-top: 20px;
        text-align: left;
        max-height: 200px;
        overflow-y: auto;

        p {
          margin: 5px 0;
          padding: 5px 10px;
          background: #fef0f0;
          border-radius: 4px;
        }
      }
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
