import * as XLSX from 'xlsx'
import type { ExcelColumn } from './exportExcel'

export interface ImportResult<T> {
  success: T[]
  errors: { row: number; data: Record<string, unknown>; error: string }[]
}

/**
 * 从 Excel 文件导入数据
 * @param file File 对象
 * @param columns 列配置（dataIndex 映射表头到字段名）
 * @returns 解析后的数据行
 */
export function importFromExcel<T extends Record<string, unknown>>(
  file: File,
  columns: ExcelColumn[],
): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 将整个 sheet 转为 JSON（表头为第一行）
        const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        }) as T[]

        const success: T[] = []
        const errors: ImportResult<T>['errors'] = []

        // 按列配置映射字段
        rawData.forEach((row, index) => {
          const mapped: Record<string, unknown> = {}
          const rowErrors: string[] = []

          columns.forEach(col => {
            // 支持按 title 或 dataIndex 匹配
            const value = row[col.title] ?? row[col.dataIndex]
            mapped[col.dataIndex] = value
          })

          if (Object.keys(mapped).length === 0) {
            rowErrors.push('无法解析该行数据')
          }

          if (rowErrors.length > 0) {
            errors.push({ row: index + 2, data: row, error: rowErrors.join('; ') })
        void err
          } else {
            success.push(mapped as T)
          }
        })

        resolve({ success, errors })
      } catch {
        reject(new Error('Excel 文件解析失败，请检查文件格式'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsBinaryString(file)
  })
}

/**
 * 下载 Excel 导入模板
 * @param columns 列配置
 * @param filename 文件名（不含扩展名）
 */
export function downloadExcelTemplate(
  columns: ExcelColumn[],
  filename: string,
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map(c => c.title),
    ...columns.map(c => c.formatter ? `[示例: ${c.formatter('示例', {})} ]` : ''),
  ])
  worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${filename}_template.xlsx`)
}
