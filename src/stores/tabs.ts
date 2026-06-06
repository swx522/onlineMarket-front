import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface TabItem {
  path: string
  title: string
  closable: boolean
}

const MAX_TABS = 20

export const useTabsStore = defineStore(
  'tabs',
  () => {
    /** 已打开的标签页列表 */
    const tabs = ref<TabItem[]>([
      { path: '/home', title: '首页', closable: false }
    ])

    /** 当前激活的标签页路径 */
    const activeTab = ref('/home')

    /** 添加一个标签页 */
    const addTab = (path: string, title: string, closable = true) => {
      // 避免重复添加
      const exists = tabs.value.find(t => t.path === path)
      if (exists) {
        activeTab.value = path
        return
      }
      // 限制最大数量
      if (tabs.value.length >= MAX_TABS) {
        // 关闭最前面的可关闭标签
        const firstClosable = tabs.value.find(t => t.closable)
        if (firstClosable) {
          removeTab(firstClosable.path)
        }
      }
      tabs.value.push({ path, title, closable })
      activeTab.value = path
    }

    /** 关闭指定标签页 */
    const removeTab = (path: string) => {
      const index = tabs.value.findIndex(t => t.path === path)
      if (index === -1) return

      const removed = tabs.value.splice(index, 1)[0]
    void removed
      if (activeTab.value === path) {
        // 激活相邻的标签
        const next = tabs.value[index] || tabs.value[index - 1]
        if (next) {
          activeTab.value = next.path
        }
      }
    }

    /** 关闭除指定路径外的所有标签 */
    const closeOtherTabs = (path: string) => {
      tabs.value = tabs.value.filter(t => !t.closable || t.path === path)
      activeTab.value = path
    }

    /** 关闭所有可关闭标签 */
    const closeAllTabs = () => {
      tabs.value = tabs.value.filter(t => !t.closable)
      activeTab.value = '/home'
    }

    /** 设置当前激活标签 */
    const setActiveTab = (path: string) => {
      activeTab.value = path
    }

    /** 从本地存储恢复 */
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem('tabs-state')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
            tabs.value = parsed.tabs
            activeTab.value = parsed.activeTab || '/home'
          }
        }
      } catch {}
    }

    /** 保存到本地存储 */
    const saveToStorage = () => {
      try {
        localStorage.setItem('tabs-state', JSON.stringify({
          tabs: tabs.value,
          activeTab: activeTab.value,
        }))
      } catch {}
    }

    loadFromStorage()

    // 自动保存到 localStorage
    watch(
      [tabs, activeTab],
      () => {
        saveToStorage()
      },
      { deep: true },
    )

    return {
      tabs,
      activeTab,
      addTab,
      removeTab,
      closeOtherTabs,
      closeAllTabs,
      setActiveTab,
      saveToStorage,
    }
  },
  {
    persist: false,
  },
)
