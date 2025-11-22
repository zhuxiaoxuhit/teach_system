<template>
  <div class="dashboard-container">
    <el-alert
      title="公告"
      type="warning"
      description="怎么让AI帮您优质生源？点击跟我的直播>>
      "
      :closable="true"
      show-icon
      class="mb-md"
    />

    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-icon alarm">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">按课时序列课程</div>
          <div class="stat-value">605 位</div>
          <div class="stat-sub">按固定学员到期 0 位</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon warning">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">待处理欠费</div>
          <div class="stat-value">0</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon success">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">待点评作业</div>
          <div class="stat-value">0</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon info">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">待回访</div>
          <div class="stat-value">0</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon primary">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">待处理续期申请</div>
          <div class="stat-value">0</div>
        </div>
      </el-card>
    </div>

    <el-card class="setup-card mb-md">
      <template #header>
        <div class="card-header">
          <span>四步快速完成 初始设置</span>
          <span class="setup-progress">已完成 4/4 步</span>
          <el-link type="primary">展开 ></el-link>
        </div>
      </template>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>常用功能</span>
              <el-icon><Setting /></el-icon>
            </div>
          </template>
          <div class="function-grid">
            <div class="function-item" @click="goTo('/academic/students')">
              <el-icon class="function-icon" color="#1890ff"><Document /></el-icon>
              <div class="function-name">咨询记录</div>
              <div class="function-count">今日登记 2</div>
            </div>
            <div class="function-item" @click="goTo('/academic/classes')">
              <el-icon class="function-icon" color="#52c41a"><User /></el-icon>
              <div class="function-name">报名续费</div>
              <div class="function-count">今日续费 1</div>
            </div>
            <div class="function-item" @click="goTo('/academic/schedule')">
              <el-icon class="function-icon" color="#faad14"><Calendar /></el-icon>
              <div class="function-name">排课</div>
            </div>
            <div class="function-item" @click="goTo('/school-home/evaluation')">
              <el-icon class="function-icon" color="#13c2c2"><Checked /></el-icon>
              <div class="function-name">记上课</div>
              <div class="function-count">今日上课 7</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>产品动态</span>
              <el-link type="primary">更多 ></el-link>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="09/18" placement="top">
              <div class="timeline-title">功能更新 | 电子合同功能升级</div>
            </el-timeline-item>
            <el-timeline-item timestamp="08/08" placement="top">
              <div class="timeline-title">功能更新 | IT单据审批流优化，支持批...</div>
            </el-timeline-item>
            <el-timeline-item timestamp="07/18" placement="top">
              <div class="timeline-title">功能更新 | 收款对账能升级</div>
            </el-timeline-item>
            <el-timeline-item timestamp="07/04" placement="top">
              <div class="timeline-title">功能更新 | 财务账目按校区筛选等</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card mb-md" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>今日总览</span>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-dot new"></span>新生报名</span>
            <span class="legend-item"><span class="legend-dot old"></span>老生报名</span>
            <span class="legend-item"><span class="legend-dot renew"></span>续报咨询</span>
          </div>
        </div>
      </template>
      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>运营指导</span>
          </template>
          <div class="operation-banner">
            <img src="https://via.placeholder.com/800x200/1890ff/ffffff?text=家校绑定攻略" alt="运营指导" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: 100%;">
          <template #header>
            <span>校宝云课堂</span>
          </template>
          <div class="cloud-class">
            <img src="https://via.placeholder.com/300x200/52c41a/ffffff?text=校宝云课堂" alt="云课堂" />
            <div class="cloud-class-info">
              <div class="cloud-class-time">每周三、五 14:00</div>
              <el-button type="primary" size="small">查看直播</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'

const router = useRouter()
const chartRef = ref<HTMLElement>()
let chartInstance: EChartsType | null = null

const goTo = (path: string) => {
  router.push(path)
}

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['魏桥书院', '无'],
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      max: 1
    },
    series: [
      {
        name: '新生报名',
        type: 'bar',
        data: [0, 1],
        itemStyle: {
          color: '#1890ff'
        },
        barWidth: 40
      },
      {
        name: '老生报名',
        type: 'bar',
        data: [0, 1],
        itemStyle: {
          color: '#52c41a'
        },
        barWidth: 40
      },
      {
        name: '续报咨询',
        type: 'bar',
        data: [0, 0],
        itemStyle: {
          color: '#faad14'
        },
        barWidth: 40
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      :deep(.el-card__body) {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;

        &.alarm {
          background-color: #fff1f0;
          color: #ff4d4f;
        }

        &.warning {
          background-color: #fffbe6;
          color: #faad14;
        }

        &.success {
          background-color: #f6ffed;
          color: #52c41a;
        }

        &.info {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        &.primary {
          background-color: #f0f5ff;
          color: #597ef7;
        }
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-sub {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }

  .setup-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .setup-progress {
        color: #52c41a;
        font-size: 14px;
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 500;
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .function-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
        transform: translateY(-2px);
      }

      .function-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .function-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .function-count {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .timeline-title {
    font-size: 14px;
    color: #333;
  }

  .chart-legend {
    display: flex;
    gap: 20px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 2px;

        &.new {
          background-color: #1890ff;
        }

        &.old {
          background-color: #52c41a;
        }

        &.renew {
          background-color: #faad14;
        }
      }
    }
  }

  .chart-container {
    height: 300px;
  }

  .operation-banner {
    img {
      width: 100%;
      border-radius: 4px;
    }
  }

  .cloud-class {
    img {
      width: 100%;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .cloud-class-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .cloud-class-time {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
