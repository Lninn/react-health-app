export type Week = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export const weeks: Week[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface IDatum {
  dt: string
  value: number
  level: string | number | null
}

export interface IMonthItem {
  label: string
  span: number
  logs: number[]
}
