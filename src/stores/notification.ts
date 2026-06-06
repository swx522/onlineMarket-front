import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface NotificationItem {
  id: string
  title: string
  content: string
  type: 'order' | 'system' | 'coupon' | 'stock'
  /** 0=未读, 1=已读 */
  readStatus: 0 | 1
  createTime: string
}

const MAX_NOTIFICATIONS = 99

export const useNotificationStore = defineStore(
  'notification',
  () => {
    const notifications = ref<NotificationItem[]>([])
    const unreadCount = ref(0)

    /** 模拟添加一条通知（实际项目中替换为 WebSocket / API） */
    const addNotification = (item: Omit<NotificationItem, 'id' | 'readStatus' | 'createTime'>) => {
      const newItem: NotificationItem = {
        ...item,
        id: Date.now().toString(),
        readStatus: 0,
        createTime: new Date().toLocaleString('zh-CN'),
      }
      notifications.value.unshift(newItem)
      if (notifications.value.length > MAX_NOTIFICATIONS) {
        notifications.value = notifications.value.slice(0, MAX_NOTIFICATIONS)
      }
      unreadCount.value++
    }

    /** 标记全部已读 */
    const markAllRead = () => {
      notifications.value.forEach(n => (n.readStatus = 1))
      unreadCount.value = 0
    }

    /** 标记单条已读 */
    const markRead = (id: string) => {
      const item = notifications.value.find(n => n.id === id)
      if (item && item.readStatus === 0) {
        item.readStatus = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }

    /** 清空所有通知 */
    const clearAll = () => {
      notifications.value = []
      unreadCount.value = 0
    }

    /** 删除单条通知 */
    const removeNotification = (id: string) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        if (notifications.value[index]!.readStatus === 0) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    }

    /** 加载本地存储 */
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem('notifications')
        if (saved) {
          const parsed = JSON.parse(saved)
          notifications.value = parsed.notifications || []
          unreadCount.value = notifications.value.filter(n => n.readStatus === 0).length
        }
      } catch {}
    }

    /** 保存到本地存储 */
    const saveToStorage = () => {
      try {
        localStorage.setItem('notifications', JSON.stringify({
          notifications: notifications.value,
        }))
      } catch {}
    }

    loadFromStorage()

    watch(notifications, saveToStorage, { deep: true })

    return {
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      markRead,
      clearAll,
      removeNotification,
      saveToStorage,
    }
  },
  {
    persist: false,
  },
)
