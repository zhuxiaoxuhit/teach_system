<template>
  <div class="employees-container">
    <el-card>
      <div class="action-bar">
        <el-button type="primary">新建员工</el-button>
        <el-button>导入员工</el-button>
        <el-button>导出员工</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职日期" width="120" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  {
    id: '1',
    name: '在线客服',
    phone: '18701538360',
    role: '管理员',
    department: '教学部',
    status: '在职',
    joinDate: '2025-01-01'
  }
])
</script>

<style scoped lang="scss">
.employees-container {
  .action-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
