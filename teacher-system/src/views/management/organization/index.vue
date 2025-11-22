<template>
  <div class="organization-container">
    <el-card>
      <div class="action-bar">
        <el-button type="primary">新建部门</el-button>
      </div>

      <el-tree
        :data="treeData"
        :props="{ children: 'children', label: 'label' }"
        default-expand-all
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <span>{{ data.label }}</span>
            <span class="tree-actions">
              <el-button type="primary" link size="small">添加子部门</el-button>
              <el-button type="primary" link size="small">编辑</el-button>
              <el-button type="danger" link size="small">删除</el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const treeData = ref([
  {
    label: '总部',
    children: [
      {
        label: '教学部',
        children: [
          { label: '语文组' },
          { label: '数学组' }
        ]
      },
      { label: '行政部' }
    ]
  }
])
</script>

<style scoped lang="scss">
.organization-container {
  .action-bar {
    margin-bottom: 20px;
  }

  .tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .tree-actions {
      display: none;
    }

    &:hover .tree-actions {
      display: block;
    }
  }
}
</style>
