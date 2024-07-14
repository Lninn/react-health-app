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
import { type Week } from "./constant"

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

export function getDateMap(dateArray: Date[]) {
  const map: Record<Week, Date[]> ={
    'Mon': [],
    'Tue': [],
    'Wed': [],
    'Thu': [],
    'Fri': [],
    'Sat': [],
    'Sun': [],
  }
  dateArray.forEach(date => {
    if (isMonday(date)) {
      map.Mon.push(date)
    } else if (isTuesday(date)) {
      map.Tue.push(date)
    } else if (isWednesday(date)) {
      map.Wed.push(date)
    } else if (isThursday(date)) {
      map.Thu.push(date)
    } else if (isFriday(date)) {
      map.Fri.push(date)
    } else if (isSaturday(date)) {
      map.Sat.push(date)
    } else if (isSunday(date)) {
      map.Sun.push(date)
    }
  })

  return map;
}
