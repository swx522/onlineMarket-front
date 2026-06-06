import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

/**
 * 全局 TagsView 管理
 * 在 App.vue 或 Layout.vue 中调用一次即可
 */
export function useTagsView() {
  const router = useRouter()
  const tabsStore = useTabsStore()

  const handleRouteChange = (to: { path: string; meta?: { title?: string } }) => {
    if (to.path && to.meta?.title) {
      tabsStore.addTab(to.path, to.meta.title, to.path !== '/home')
    }
  }

  // 注册路由后置守卫（只注册一次）
  router.afterEach((to) => {
    handleRouteChange(to)
  })

  // 监听 tab 切换，同步路由
  watch(
    () => tabsStore.activeTab,
    (path) => {
      if (path && path !== router.currentRoute.value.path) {
        router.push(path)
      }
    },
  )

  // 页面刷新时恢复 tab
  onMounted(() => {
    const route = router.currentRoute.value
    if (route.path && route.meta?.title) {
      tabsStore.addTab(route.path, route.meta.title as string, route.path !== '/home')
      tabsStore.setActiveTab(route.path)
    }
  })
}
