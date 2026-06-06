<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTableColumnStore } from '@/stores/tableColumn'
import { DArrowLeft } from '@element-plus/icons-vue'

const props = defineProps<{
  tableId: string
}>()

const store = useTableColumnStore()

const columns = computed(() => store.getColumns(props.tableId))
const drawerVisible = ref(false)

const toggleColumn = (key: string) => {
  store.toggleColumn(props.tableId, key)
}

const resetColumns = () => {
  store.resetColumns(props.tableId)
  drawerVisible.value = false
}
</script>

<template>
  <div class="column-config-wrapper">
    <el-tooltip content="列配置" placement="top">
      <el-button :icon="DArrowLeft" circle @click="drawerVisible = true" />
    </el-tooltip>

    <el-drawer
      v-model="drawerVisible"
      title="列配置"
      direction="rtl"
      size="280px"
    >
      <div class="drawer-content">
        <div class="drawer-tip">勾选要显示的列，支持拖拽排序（显示顺序影响表格）</div>

        <el-checkbox-group :value="columns.filter(c => c.visible).map(c => c.key)">
          <div v-for="col in columns" :key="col.key" class="column-item">
            <el-checkbox
              :label="col.key"
              @change="() => toggleColumn(col.key)"
            >
              {{ col.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>

        <el-button type="warning" plain class="reset-btn" @click="resetColumns">
          重置为默认
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.column-config-wrapper {
  display: inline-flex;
  align-items: center;
}

.drawer-content {
  padding: 0 16px;
}

.drawer-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
  line-height: 1.5;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.reset-btn {
  width: 100%;
  margin-top: 20px;
}
</style>
