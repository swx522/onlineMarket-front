<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain.vue'
import TagsView from '@/components/TagsView/index.vue'
import useResizeHandler from './composables/useResizeHandler'
import { useTabsStore } from '@/stores/tabs'

const appStore = useAppStore()
const tabsStore = useTabsStore()
const router = useRouter()
const route = useRoute()

const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}))

useResizeHandler()

// 监听 tab 切换，同步路由（单例）
watch(
  () => tabsStore.activeTab,
  (path) => {
    if (path && path !== route.path) {
      router.push(path)
    }
  },
)

// 监听路由变化，同步到 tab store（单例）
router.afterEach((to) => {
  if (to.path && to.meta?.title && to.path !== '/login') {
    tabsStore.addTab(to.path, to.meta.title as string, to.path !== '/home')
  }
})
</script>


<template>
  <div class="app-wrapper" :class="classObj">
    <Sidebar class="sidebar-container"></Sidebar>
    <div class="main-container">
      <Navbar></Navbar>
      <TagsView></TagsView>
      <AppMain></AppMain>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/mixin.scss";

.app-wrapper {
  @include mixin.clearfix;
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
