import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(false)

    const applyTheme = (dark: boolean) => {
      const html = document.documentElement
      if (dark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }

    const toggleTheme = () => {
      isDark.value = !isDark.value
    }

    const setTheme = (dark: boolean) => {
      isDark.value = dark
    }

    // 监听变化，实时应用
    watch(isDark, (val) => {
      applyTheme(val)
      try {
        localStorage.setItem('theme-mode', val ? 'dark' : 'light')
      } catch {}
    }, { immediate: true })

    // 初始化：从 localStorage 读取
    const init = () => {
      try {
        const saved = localStorage.getItem('theme-mode')
        if (saved === 'dark') {
          isDark.value = true
          applyTheme(true)
        }
      } catch {}
    }

    init()

    return {
      isDark,
      toggleTheme,
      setTheme,
    }
  },
  {
    persist: false, // 手动控制 localStorage
  },
)
