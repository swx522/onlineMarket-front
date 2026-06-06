<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <!-- 通过ConfigProvider全局设置国际化 -->
  <el-config-provider :locale="zhCn">
    <div id="app" :class="{ dark: themeStore.isDark }">
      <router-view />
    </div>
  </el-config-provider>
</template>

<style></style>
