import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ColumnConfig {
  /** 列的唯一标识 */
  key: string
  /** 列的显示名称 */
  label: string
  /** 是否显示该列 */
  visible: boolean
  /** 列的宽度 */
  width?: string | number
  /** 列的顺序 */
  order: number
}

export interface TableColumnState {
  /** 表格的唯一标识（如 'product-table'） */
  tableId: string
  /** 列配置列表 */
  columns: ColumnConfig[]
}

/** 所有表格的列配置存储 */
const tableColumnStates = ref<Record<string, ColumnConfig[]>>({})

export const useTableColumnStore = defineStore(
  'tableColumn',
  () => {
    /** 获取指定表格的列配置 */
    const getColumns = (tableId: string): ColumnConfig[] => {
      return tableColumnStates.value[tableId] || []
    }

    /** 初始化/重置指定表格的列配置 */
    const initColumns = (tableId: string, defaultColumns: Omit<ColumnConfig, 'visible' | 'order'>[]) => {
      const existing = tableColumnStates.value[tableId]
      if (existing && existing.length === defaultColumns.length) return

      tableColumnStates.value[tableId] = defaultColumns.map((col, index) => ({
        ...col,
        visible: existing?.find(c => c.key === col.key)?.visible ?? true,
        order: existing?.find(c => c.key === col.key)?.order ?? index,
      })).sort((a, b) => a.order - b.order)

      saveToStorage()
    }

    /** 切换某列的显示状态 */
    const toggleColumn = (tableId: string, key: string) => {
      const columns = tableColumnStates.value[tableId]
      if (!columns) return
      const col = columns.find(c => c.key === key)
      if (col) {
        col.visible = !col.visible
        saveToStorage()
      }
    }

    /** 重置为默认（全部显示） */
    const resetColumns = (tableId: string) => {
      delete tableColumnStates.value[tableId]
      saveToStorage()
    }

    /** 根据 tableId 获取当前生效的列（仅 visible=true） */
    const visibleColumns = computed(() => (tableId: string) => {
      return (tableColumnStates.value[tableId] || []).filter(c => c.visible)
    })

    /** 保存到 localStorage */
    const saveToStorage = () => {
      try {
        localStorage.setItem('table-column-config', JSON.stringify(tableColumnStates.value))
      } catch {}
    }

    /** 从 localStorage 恢复 */
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem('table-column-config')
        if (saved) {
          tableColumnStates.value = JSON.parse(saved)
        }
      } catch {}
    }

    /** 恢复 */
    loadFromStorage()

    return {
      tableColumnStates,
      getColumns,
      initColumns,
      toggleColumn,
      resetColumns,
      visibleColumns,
    }
  },
  {
    persist: false, // 手动控制 localStorage
  },
)
