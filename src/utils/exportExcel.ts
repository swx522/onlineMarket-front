import * as XLSX from 'xlsx'

export interface ExcelColumn {
  /** 列标题 */
  title: string
  /** 数据字段名 */
  dataIndex: string
  /** 宽度（可选，默认 120） */
  width?: number
  /** 格式化函数 */
  formatter?: (value: unknown, row: Record<string, unknown>) => string
}

/**
 * 导出数据为 Excel 文件
 * @param data 数据源（数组）
 * @param columns 列配置
 * @param filename 文件名（不含扩展名）
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string,
): void {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据')
  }

  // 映射数据
  const sheetData = data.map((row) => {
    return columns.map((col) => {
      const value = row[col.dataIndex]
      if (col.formatter) {
        return col.formatter(value, row)
      }
      return value ?? ''
    })
  })

  // 构建工作簿
  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map(c => c.title),
    ...sheetData,
  ])

  // 设置列宽
  worksheet['!cols'] = columns.map(col => ({
    wch: col.width || 15,
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 触发下载
  XLSX.writeFile(workbook, `${filename}_${formatDate(new Date())}.xlsx`)
}

/**
 * 格式化日期为 YYYY-MM-DD_HH-mm-ss
 */
function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
}

/**
 * 通用格式化函数
 */

/** 金额格式化 */
export const formatPrice = (value: unknown) => {
  if (value === null || value === undefined) return '0.00'
  const num = Number(value)
  return isNaN(num) ? '0.00' : `¥${num.toFixed(2)}`
}

/** 状态文字映射 */
export const formatStatus = (
  value: unknown,
  map: Record<string | number, string>,
) => {
  return map[String(value)] || String(value ?? '')
}

/** 日期时间格式化 */
export const formatDateTime = (value: unknown) => {
  if (!value) return ''
  const d = new Date(value as string | number)
  if (isNaN(d.getTime())) return String(value)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 布尔值格式化 */
export const formatBool = (value: unknown) => {
  return value ? '是' : '否'
}
