<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { Bell, Delete, Check, DeleteFilled } from '@element-plus/icons-vue'

const store = useNotificationStore()

const notifications = computed(() => store.notifications)
const unreadCount = computed(() => store.unreadCount)

const activeType = ref<string>('all')

const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '订单', value: 'order' },
  { label: '系统', value: 'system' },
  { label: '优惠券', value: 'coupon' },
  { label: '库存', value: 'stock' },
]

const filteredList = computed(() => {
  if (activeType.value === 'all') return notifications.value
  return notifications.value.filter(n => n.type === activeType.value)
})

const typeLabel = (type: string) => {
  return typeOptions.find(t => t.value === type)?.label || type
}

const typeColor = (type: string) => {
  const map: Record<string, string> = {
    order: '#409eff',
    system: '#909399',
    coupon: '#e6a23c',
    stock: '#f56c6c',
  }
  return map[type] || '#909399'
}

const handleClearAll = () => {
  store.clearAll()
}

const handleMarkAllRead = () => {
  store.markAllRead()
}

const handleRemove = (id: string) => {
  store.removeNotification(id)
}
</script>

<template>
  <el-popover
    placement="bottom-end"
    :width="360"
    trigger="click"
    :offset="8"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
        <el-button :icon="Bell" circle text class="notification-btn" />
      </el-badge>
    </template>

    <div class="notification-panel">
      <!-- 头部 -->
      <div class="panel-header">
        <span class="panel-title">通知中心</span>
        <div class="panel-actions">
          <el-button
            v-if="unreadCount > 0"
            size="small"
            :icon="Check"
            link
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>
          <el-button
            size="small"
            :icon="DeleteFilled"
            link
            type="danger"
            @click="handleClearAll"
          >
            清空
          </el-button>
        </div>
      </div>

      <!-- 类型筛选 -->
      <div class="type-tabs">
        <span
          v-for="opt in typeOptions"
          :key="opt.value"
          class="type-tab"
          :class="{ active: activeType === opt.value }"
          @click="activeType = opt.value"
        >
          {{ opt.label }}
        </span>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list">
        <template v-if="filteredList.length > 0">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="notification-item"
            :class="{ unread: item.readStatus === 0 }"
            @click="store.markRead(item.id)"
          >
            <div class="item-dot" :style="{ backgroundColor: typeColor(item.type) }"></div>
            <div class="item-content">
              <div class="item-header">
                <span class="item-type" :style="{ color: typeColor(item.type) }">
                  {{ typeLabel(item.type) }}
                </span>
                <el-icon class="item-close" @click.stop="handleRemove(item.id)">
                  <Delete />
                </el-icon>
              </div>
              <div class="item-title">{{ item.title }}</div>
              <div class="item-body">{{ item.content }}</div>
              <div class="item-time">{{ item.createTime }}</div>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无通知" :image-size="60" />
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.notification-btn {
  font-size: 18px;
}

.notification-panel {
  margin: -12px;
  min-height: 300px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);

  .panel-title {
    font-weight: 600;
    font-size: 14px;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
  }
}

.type-tabs {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  gap: 4px;

  .type-tab {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    color: var(--el-text-color-secondary, #909399);
    transition: all 0.2s;

    &:hover {
      color: #409eff;
    }

    &.active {
      background-color: #409eff;
      color: #fff;
    }
  }
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
  }

  &.unread {
    background-color: var(--el-color-primary-light-9, #ecf5ff);

    &:hover {
      background-color: var(--el-color-primary-light-8, #f0f9ff);
    }
  }

  .item-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 6px;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;

    .item-type {
      font-size: 11px;
      font-weight: 600;
    }

    .item-close {
      font-size: 12px;
      color: var(--el-text-color-disabled, #c0c4cc);
      opacity: 0;
      transition: opacity 0.2s;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  &:hover .item-close {
    opacity: 1;
  }

  .item-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary, #303133);
    margin-bottom: 2px;
  }

  .item-body {
    font-size: 12px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-time {
    font-size: 11px;
    color: var(--el-text-color-placeholder, #909399);
    margin-top: 4px;
  }
}
</style>
