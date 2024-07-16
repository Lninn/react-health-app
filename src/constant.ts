export type Week = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export const weeks: Week[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface IDatum {
  dt: string
  // 0: 当前月份为奇数, 1: 当前月份为偶数
  flag: 0 | 1
  value: number
  level: string | number | null
}

export interface IMonthItem {
  label: string
  span: number
  logs: number[]
}

export const DATE_FORMAT = 'yyyy/MM/dd'
