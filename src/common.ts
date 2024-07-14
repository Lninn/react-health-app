import { differenceInCalendarDays, endOfMonth } from "date-fns"
import { 
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday
} from 'date-fns'
import { type IDatum, type Week } from "./constant"

export function getDateArrayByRange(start: Date, end: Date): Date[] {
  const dateArray = Array.from({ length: differenceInCalendarDays(end, start) + 1}, (_, i) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
  })
  return dateArray
}

export function getDateArrayByYear(year: number): Date[] {
  const dateArray = Array.from({ length: 12}, (_, i) => {
    return new Date(year, i, 1)
  }).map(date => {
    const start = date
    const end = endOfMonth (date)
    return [start, end]
  }).map(datePairs => {
    const start = datePairs[0]
    const end = datePairs[1]

    const days = differenceInCalendarDays(end, start) + 1

    return days
  }).map((monthOfDays, m) => {
    return Array.from({ length: monthOfDays }, (_, i) => {
      return new Date(2024, m, i + 1)
    })
  }).flat()

  return dateArray
}

export function getDateMap(items: IDatum[]) {
  const map: Record<Week, IDatum[]> ={
    'Mon': [],
    'Tue': [],
    'Wed': [],
    'Thu': [],
    'Fri': [],
    'Sat': [],
    'Sun': [],
  }
  items.forEach(item => {
    const date = item.dt
    if (isMonday(date)) {
      map.Mon.push(item)
    } else if (isTuesday(date)) {
      map.Tue.push(item)
    } else if (isWednesday(date)) {
      map.Wed.push(item)
    } else if (isThursday(date)) {
      map.Thu.push(item)
    } else if (isFriday(date)) {
      map.Fri.push(item)
    } else if (isSaturday(date)) {
      map.Sat.push(item)
    } else if (isSunday(date)) {
      map.Sun.push(item)
    }
  })

  return map;
}
