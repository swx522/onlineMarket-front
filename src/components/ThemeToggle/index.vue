<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { Sunny, Moon } from '@element-plus/icons-vue'

const themeStore = useThemeStore()
</script>

<template>
  <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
    <el-button
      :icon="themeStore.isDark ? Sunny : Moon"
      circle
      text
      class="theme-toggle-btn"
      @click="themeStore.toggleTheme()"
    />
  </el-tooltip>
</template>

<style scoped>
.theme-toggle-btn {
  font-size: 18px;
  color: var(--el-text-color-regular);
}

.theme-toggle-btn:hover {
  color: #409eff;
}
</style>
