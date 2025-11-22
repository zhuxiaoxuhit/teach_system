<template>
  <div class="reports-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="报表" name="reports"></el-tab-pane>
        <el-tab-pane label="校区经营分析" name="campus-analysis"></el-tab-pane>
        <el-tab-pane label="教务报表" name="academic-reports"></el-tab-pane>
        <el-tab-pane label="财务报表" name="finance-reports"></el-tab-pane>
        <el-tab-pane label="教材杂费报表" name="material-reports"></el-tab-pane>
        <el-tab-pane label="数据大厦" name="data-center"></el-tab-pane>
      </el-tabs>

      <div class="report-filters">
        <div class="filter-group">
          <span class="filter-label">数据范围：</span>
          <el-radio-group v-model="dataScope">
            <el-radio-button label="经办校区">经办校区</el-radio-button>
            <el-radio-button label="跨校书院">跨校书院</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group">
          <span class="filter-label">日期范围：</span>
          <el-radio-group v-model="dateType">
            <el-radio-button label="本月">本月</el-radio-button>
            <el-radio-button label="上月">上月</el-radio-button>
            <el-radio-button label="今日">今日</el-radio-button>
            <el-radio-button label="昨天">昨天</el-radio-button>
            <el-radio-button label="本周">本周</el-radio-button>
            <el-radio-button label="上周">上周</el-radio-button>
            <el-radio-button label="今年">今年</el-radio-button>
            <el-radio-button label="去年">去年</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </div>
      </div>

      <div class="report-options">
        <div class="option-group">
          <div class="option-title">招生概况</div>
          <el-checkbox-group v-model="reportOptions.recruitment">
            <el-checkbox label="新增咨询">新增咨询</el-checkbox>
            <el-checkbox label="新增咨询数据对比">新增咨询数据对比</el-checkbox>
            <el-checkbox label="招生人数">招生人数</el-checkbox>
            <el-checkbox label="招生数据对比">招生数据对比</el-checkbox>
            <el-checkbox label="应收成交额">应收成交额</el-checkbox>
            <el-checkbox label="应收校区对比">应收校区对比</el-checkbox>
            <el-checkbox label="应收数据对比">应收数据对比</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="option-group">
          <div class="option-title">教务概况</div>
          <el-checkbox-group v-model="reportOptions.academic">
            <el-checkbox label="学员就读">学员就读</el-checkbox>
            <el-checkbox label="学员消耗">学员消耗</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="option-group">
          <div class="option-title">财务概况</div>
          <el-checkbox-group v-model="reportOptions.finance">
            <el-checkbox label="财务概况">财务概况</el-checkbox>
            <el-checkbox label="数据对比">数据对比</el-checkbox>
            <el-checkbox label="校区对比">校区对比</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="option-group">
          <div class="option-title">员工概况</div>
          <el-checkbox-group v-model="reportOptions.employee">
            <el-checkbox label="员工概况">员工概况</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div class="report-actions">
        <el-button type="primary" size="large">生成报表</el-button>
      </div>

      <div class="report-charts">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>新增咨询</span>
              </template>
              <div ref="chart1Ref" style="height: 300px;"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>招生数据对比</span>
              </template>
              <div ref="chart2Ref" style="height: 300px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import * as echarts from 'echarts'

const activeTab = ref('campus-analysis')
const dataScope = ref('经办校区')
const dateType = ref('本月')
const customDateRange = ref([])

const reportOptions = reactive({
  recruitment: ['新增咨询', '招生人数', '应收成交额'],
  academic: ['学员就读'],
  finance: ['财务概况'],
  employee: ['员工概况']
})

const chart1Ref = ref()
const chart2Ref = ref()

onMounted(() => {
  // 初始化图表
  if (chart1Ref.value) {
    const chart1 = echarts.init(chart1Ref.value)
    chart1.setOption({
      xAxis: { type: 'category', data: ['11/01', '11/07', '11/13', '11/19', '11/25'] },
      yAxis: { type: 'value' },
      series: [{
        data: [1, 1, 2, 1, 1],
        type: 'bar',
        itemStyle: { color: '#1890ff' }
      }]
    })
  }

  if (chart2Ref.value) {
    const chart2 = echarts.init(chart2Ref.value)
    chart2.setOption({
      xAxis: { type: 'category', data: ['2025/10/01~2025/10/31', '2025/10/01~2025/10/31'] },
      yAxis: { type: 'value', max: 50 },
      series: [
        {
          name: '新报人次',
          type: 'bar',
          data: [9, 27],
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '续报人次',
          type: 'bar',
          data: [8, 42],
          itemStyle: { color: '#f5222d' }
        }
      ]
    })
  }
})
</script>

<style scoped lang="scss">
.reports-container {
  .report-filters {
    margin-bottom: 24px;

    .filter-group {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .filter-label {
        font-weight: 500;
        margin-right: 12px;
        white-space: nowrap;
      }

      .el-radio-group {
        margin-right: 12px;
      }
    }
  }

  .report-options {
    margin-bottom: 24px;

    .option-group {
      margin-bottom: 20px;

      .option-title {
        font-weight: 500;
        margin-bottom: 12px;
        color: #333;
      }

      .el-checkbox-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
    }
  }

  .report-actions {
    text-align: center;
    margin-bottom: 24px;
  }

  .report-charts {
    margin-top: 24px;
  }
}
</style>
