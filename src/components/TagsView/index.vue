<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { Close, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed(() => tabsStore.activeTab)

const handleTabClick = (tab: { path: string }) => {
  router.push(tab.path)
  tabsStore.setActiveTab(tab.path)
}

const handleCloseTab = (path: string, event: Event) => {
  event.stopPropagation()
  if (path === '/home') return
  tabsStore.removeTab(path)
  if (tabsStore.activeTab === path) {
    const current = tabsStore.tabs.find(t => t.path === tabsStore.activeTab)
    if (current) router.push(current.path)
  }
}

const handleCloseAll = () => {
  tabsStore.closeAllTabs()
  router.push('/home')
}
</script>

<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tags-view-item"
        :class="{ active: activeTab === tab.path }"
        @click.prevent="handleTabClick(tab)"
        @contextmenu.prevent
      >
        <el-icon v-if="tab.path === '/home'" class="el-icon-middle">
          <HomeFilled />
        </el-icon>
        {{ tab.title }}
        <el-icon
          v-if="tab.closable"
          class="el-icon-close"
          @click.prevent="handleCloseTab(tab.path, $event)"
        >
          <Close />
        </el-icon>
      </router-link>
    </div>

    <el-dropdown class="tags-view-more" trigger="click">
      <el-icon><Close /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleCloseAll">关闭所有</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped lang="scss">
.tags-view-container {
  background-color: var(--navbar-bg, #fff);
  border-bottom: 1px solid #d8dce5;
  height: 34px;
  display: flex;
  align-items: center;
  padding: 0 8px;

  .tags-view-wrapper {
    display: flex;
    align-items: center;
    overflow-x: auto;
    flex: 1;
    height: 100%;

    &::-webkit-scrollbar {
      height: 4px;
    }
  }

  .tags-view-item {
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    height: 26px;
    line-height: 26px;
    margin-right: 4px;
    border-radius: 4px;
    font-size: 12px;
    color: #495057;
    background-color: #fff;
    border: 1px solid #d8dce5;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      background-color: #f1f3f5;
      color: #409eff;
      border-color: #409eff;
    }

    &.active {
      background-color: #409eff;
      color: #fff;
      border-color: #409eff;

      .el-icon-close {
        color: #fff;
      }
    }

    .el-icon-close {
      margin-left: 4px;
      font-size: 10px;
      border-radius: 50%;
      padding: 1px;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    .el-icon-middle {
      margin-right: 2px;
      vertical-align: middle;
    }
  }

  .tags-view-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    border-radius: 4px;
    margin-left: 4px;

    &:hover {
      background-color: #f1f3f5;
    }
  }
}

html.dark .tags-view-container {
  border-bottom-color: var(--el-border-color);
}
</style>
