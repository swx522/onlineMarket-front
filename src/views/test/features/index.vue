<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useTableColumnStore } from '@/stores/tableColumn'
import TableColumnConfig from '@/components/TableColumnConfig/index.vue'
import { exportToExcel, formatPrice, type ExcelColumn } from '@/utils/exportExcel'
import { importFromExcel, downloadExcelTemplate } from '@/utils/importExcel'
import { ElMessage } from 'element-plus'
import { Upload, Download, Refresh, Plus } from '@element-plus/icons-vue'

const tableColumnStore = useTableColumnStore()

// ============================================================
// 表格列配置示例（第一步）
// ============================================================
const tableId = 'demo-product-table'
const productColumns = [
  { key: 'id', label: '编号', width: 80, dataIndex: 'id' },
  { key: 'pic', label: '商品图片', width: 120, dataIndex: 'pic' },
  { key: 'name', label: '商品名称', width: 200, dataIndex: 'name' },
  { key: 'price', label: '价格', width: 100, dataIndex: 'price' },
  { key: 'brandName', label: '品牌', width: 120, dataIndex: 'brandName' },
  { key: 'sale', label: '销量', width: 80, dataIndex: 'sale' },
  { key: 'stock', label: '库存', width: 80, dataIndex: 'stock' },
  { key: 'publishStatus', label: '上架状态', width: 100, dataIndex: 'publishStatus' },
  { key: 'verifyStatus', label: '审核状态', width: 100, dataIndex: 'verifyStatus' },
  { key: 'sort', label: '排序', width: 80, dataIndex: 'sort' },
]

// 模拟商品数据
const productList = ref<Array<Record<string, unknown>>>([
  { id: 1, pic: 'https://via.placeholder.com/80', name: 'iPhone 15 Pro Max', price: 9999, brandName: 'Apple', sale: 1234, stock: 56, publishStatus: 1, verifyStatus: 1, sort: 1 },
  { id: 2, pic: 'https://via.placeholder.com/80', name: '小米14 Ultra', price: 5999, brandName: '小米', sale: 876, stock: 120, publishStatus: 1, verifyStatus: 1, sort: 2 },
  { id: 3, pic: 'https://via.placeholder.com/80', name: '华为Mate 60 Pro+', price: 7999, brandName: '华为', sale: 654, stock: 89, publishStatus: 0, verifyStatus: 1, sort: 3 },
  { id: 4, pic: 'https://via.placeholder.com/80', name: 'MacBook Pro 16"', price: 19999, brandName: 'Apple', sale: 432, stock: 34, publishStatus: 1, verifyStatus: 1, sort: 4 },
  { id: 5, pic: 'https://via.placeholder.com/80', name: 'ThinkPad X1 Carbon', price: 12999, brandName: '联想', sale: 321, stock: 67, publishStatus: 1, verifyStatus: 0, sort: 5 },
])

const activeColumns = computed(() => {
  tableColumnStore.initColumns(tableId, productColumns)
  return tableColumnStore.getColumns(tableId).filter(c => c.visible)
})

// ============================================================
// Excel 导出示例（第三步）
// ============================================================
const excelColumns: ExcelColumn[] = [
  { title: '编号', dataIndex: 'id' },
  { title: '商品名称', dataIndex: 'name' },
  { title: '品牌', dataIndex: 'brandName' },
  { title: '价格', dataIndex: 'price', formatter: formatPrice },
  { title: '销量', dataIndex: 'sale' },
  { title: '库存', dataIndex: 'stock' },
  { title: '上架状态', dataIndex: 'publishStatus', formatter: (v) => v === 1 ? '上架' : '下架' },
  { title: '审核状态', dataIndex: 'verifyStatus', formatter: (v) => v === 1 ? '通过' : '待审' },
]

const handleExport = () => {
  try {
    exportToExcel(productList.value, excelColumns, '商品数据导出')
    ElMessage.success('导出成功！')
  } catch (e) {
    ElMessage.error((e as Error).message)
  }
}

// ============================================================
// Excel 导入示例（第三步）
// ============================================================
const importResult = reactive({ success: 0, errors: [] as string[] })
const importing = ref(false)
const importFileRef = ref()

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  try {
    const result = await importFromExcel(file, excelColumns)
    importResult.success = result.success.length
    importResult.errors = result.errors.map(e => `第${e.row}行: ${e.error}`)

    if (result.success.length > 0) {
      // 合并导入数据（实际项目中调用 API）
      productList.value = [...productList.value, ...result.success]
      ElMessage.success(`成功导入 ${result.success.length} 条数据`)
    }
    if (result.errors.length > 0) {
      ElMessage.warning(`${result.errors.length} 条数据导入失败，请检查格式`)
    }
  } catch (e) {
    ElMessage.error((e as Error).message)
  } finally {
    importing.value = false
    if (importFileRef.value) importFileRef.value.value = ''
  }
}

const handleDownloadTemplate = () => {
  downloadExcelTemplate(excelColumns, '商品导入模板')
  ElMessage.info('模板已下载，请按模板格式填写数据')
}

const handleAddRow = () => {
  productList.value.unshift({
    id: Date.now(),
    pic: 'https://via.placeholder.com/80',
    name: '新增商品',
    price: 0,
    brandName: '-',
    sale: 0,
    stock: 0,
    publishStatus: 1,
    verifyStatus: 0,
    sort: 99,
  })
}

const activeTab = ref('column-config')
</script>

<script lang="ts">
export default {}
</script>

<template>
  <div class="demo-container">
    <el-card class="demo-header" shadow="never">
      <h2>新功能演示面板</h2>
      <p>以下演示了已添加的 5 个新功能。点击顶部导航栏的铃铛图标体验通知中心，点击月亮/太阳图标切换主题。</p>
    </el-card>

    <el-tabs v-model="activeTab" class="demo-tabs">
      <!-- ==================== 第一步：表格列配置 ==================== -->
      <el-tab-pane label="① 表格列配置" name="column-config">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>第一步：表格列配置</span>
              <el-button :icon="Refresh" size="small" @click="tableColumnStore.resetColumns(tableId)">
                重置列
              </el-button>
            </div>
          </template>
          <p class="tip">
            点击右上角 <strong>← 图标</strong> 打开列配置面板，可勾选显示/隐藏列，设置会自动保存到本地存储，刷新页面不丢失。
          </p>

          <div class="operate-bar">
            <el-button type="primary" :icon="Plus" @click="handleAddRow">添加一行</el-button>
            <span class="active-count">当前显示 <strong>{{ activeColumns.length }}</strong> / {{ productColumns.length }} 列</span>
            <TableColumnConfig :table-id="tableId" />
          </div>

          <el-table :data="productList" border style="width: 100%; margin-top: 16px">
            <el-table-column
              v-for="col in activeColumns"
              :key="col.key"
              :prop="col.dataIndex"
              :label="col.label"
              :width="col.width"
              align="center"
            >
              <template #default="{ row }">
                <template v-if="col.key === 'pic'">
                  <img :src="row.pic as string" style="height: 40px" />
                </template>
                <template v-else-if="col.key === 'price'">
                  <span style="color: #f56c6c; font-weight: bold">¥{{ row.price }}</span>
                </template>
                <template v-else-if="col.key === 'publishStatus'">
                  <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
                    {{ row.publishStatus === 1 ? '上架' : '下架' }}
                  </el-tag>
                </template>
                <template v-else-if="col.key === 'verifyStatus'">
                  <el-tag :type="row.verifyStatus === 1 ? 'success' : 'warning'">
                    {{ row.verifyStatus === 1 ? '通过' : '待审' }}
                  </el-tag>
                </template>
                <template v-else>
                  {{ row[col.dataIndex] ?? '-' }}
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- ==================== 第三步：Excel 导入导出 ==================== -->
      <el-tab-pane label="③ Excel 导入导出" name="excel">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>第三步：Excel 导入导出</span>
            </div>
          </template>
          <p class="tip">
            支持导出当前表格数据为 Excel 文件，也支持从 Excel 文件批量导入数据。导入时自动校验格式。
          </p>

          <div class="excel-actions">
            <el-button type="success" :icon="Download" @click="handleExport">
              导出 Excel
            </el-button>
            <el-button :icon="Download" @click="handleDownloadTemplate">
              下载导入模板
            </el-button>
            <el-button type="primary" :icon="Upload" :loading="importing">
              <label for="import-file" style="cursor: pointer;">
                导入 Excel
              </label>
            </el-button>
            <input
              id="import-file"
              ref="importFileRef"
              type="file"
              accept=".xlsx,.xls"
              style="display: none"
              @change="handleImport"
            />
          </div>

          <!-- 导入结果 -->
          <div v-if="importResult.success > 0 || importResult.errors.length > 0" class="import-result">
            <el-alert
              v-if="importResult.success > 0"
              :title="`成功导入 ${importResult.success} 条数据`"
              type="success"
              show-icon
              :closable="false"
            />
            <el-alert
              v-for="(err, i) in importResult.errors.slice(0, 5)"
              :key="i"
              :title="err"
              type="warning"
              show-icon
              :closable="false"
              style="margin-top: 8px"
            />
            <el-alert
              v-if="importResult.errors.length > 5"
              :title="`还有 ${importResult.errors.length - 5} 条错误未显示`"
              type="info"
              :closable="false"
              style="margin-top: 8px"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 功能说明卡片 -->
    <el-card shadow="never" class="feature-summary">
      <template #header>
        <span>功能一览</span>
      </template>
      <el-space wrap>
        <el-tag type="success" size="large">① 表格列配置</el-tag>
        <el-tag type="primary" size="large">② 深色模式</el-tag>
        <el-tag type="warning" size="large">③ Excel 导入导出</el-tag>
        <el-tag type="danger" size="large">④ 多标签页</el-tag>
        <el-tag size="large">⑤ 消息通知中心</el-tag>
      </el-space>
      <div class="feature-desc">
        <div class="feature-item">
          <strong>① 表格列配置</strong> — 右上角 ← 按钮，勾选要显示的列，刷新不丢失
        </div>
        <div class="feature-item">
          <strong>② 深色模式</strong> — 右上角 太阳/月亮 图标，一键切换亮/暗主题
        </div>
        <div class="feature-item">
          <strong>③ Excel 导入导出</strong> — 批量导出商品数据为 Excel，支持按模板导入
        </div>
        <div class="feature-item">
          <strong>④ 多标签页</strong> — 顶部 TagsView，自动记录打开的页面，支持关闭
        </div>
        <div class="feature-item">
          <strong>⑤ 消息通知中心</strong> — 右上角 铃铛 图标，支持订单/系统/优惠券/库存通知
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.demo-container {
  padding: 20px;
}

.demo-header {
  margin-bottom: 20px;
  h2 { margin: 0 0 8px; }
  p { margin: 0; color: #909399; font-size: 13px; }
}

.demo-tabs {
  :deep(.el-tabs__content) {
    padding: 16px 0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  line-height: 1.6;
  strong { color: #409eff; }
}

.operate-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  .active-count { font-size: 13px; color: #606266; }
}

.excel-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.import-result {
  margin-top: 16px;
}

.feature-summary {
  margin-top: 20px;
}

.feature-desc {
  margin-top: 16px;
  .feature-item {
    padding: 8px 0;
    font-size: 13px;
    color: #606266;
    border-bottom: 1px dashed #ebeef5;
    &:last-child { border-bottom: none; }
    strong { color: #303133; }
  }
}
</style>
