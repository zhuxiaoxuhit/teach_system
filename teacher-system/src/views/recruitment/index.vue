<template>
  <div class="recruitment-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="活动秀场" name="showcase"></el-tab-pane>
        <el-tab-pane label="推送" name="push"></el-tab-pane>
        <el-tab-pane label="小游戏" name="game"></el-tab-pane>
        <el-tab-pane label="招生统计" name="stats"></el-tab-pane>
        <el-tab-pane label="分类" name="category"></el-tab-pane>
        <el-tab-pane label="权利" name="rights"></el-tab-pane>
        <el-tab-pane label="接入" name="access"></el-tab-pane>
        <el-tab-pane label="设置" name="settings"></el-tab-pane>
      </el-tabs>

      <div class="showcase-grid">
        <el-card
          v-for="item in showcaseItems"
          :key="item.id"
          class="showcase-item"
          :body-style="{ padding: '0' }"
          shadow="hover"
        >
          <div class="item-tag">{{ item.tag }}</div>
          <div class="item-image">
            <img :src="item.image" :alt="item.title" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-stats">
              <span>推广 {{ item.views }}</span>
              <span>热度 <el-icon color="#ff4d4f"><Sunny /></el-icon> {{ item.heat }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('showcase')

const showcaseItems = ref([
  {
    id: 1,
    tag: '热门推荐',
    title: '双旦专属 | 圣诞大神来袭',
    image: 'https://via.placeholder.com/300x200/f5222d/ffffff?text=Christmas',
    views: 1985,
    heat: '100+'
  },
  {
    id: 2,
    tag: '招生活动',
    title: '拼团 | 家商有优，成批如意',
    image: 'https://via.placeholder.com/300x200/52c41a/ffffff?text=Group',
    views: 2134,
    heat: '90+'
  },
  {
    id: 3,
    tag: '精选',
    title: '赠课安全 | 爆款选手专，付费抢拼...',
    image: 'https://via.placeholder.com/300x200/1890ff/ffffff?text=Special',
    views: 188,
    heat: '75+'
  },
  {
    id: 4,
    tag: '热门',
    title: '招生 | 爱12元即围绕',
    image: 'https://via.placeholder.com/300x200/faad14/ffffff?text=Hot',
    views: 2629,
    heat: '85+'
  }
])
</script>

<style scoped lang="scss">
.recruitment-container {
  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;

    .showcase-item {
      position: relative;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .item-tag {
        position: absolute;
        top: 10px;
        left: 0;
        background-color: #ff4d4f;
        color: white;
        padding: 4px 12px;
        font-size: 12px;
        border-radius: 0 4px 4px 0;
        z-index: 1;
      }

      .item-image {
        width: 100%;
        height: 180px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-info {
        padding: 12px;

        .item-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #999;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}
</style>
