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
import { XMLParser } from 'fast-xml-parser'


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

export function categorizeDataByLevels(data: IDatum[]) {
  // 验证输入是否为数组
  if (!Array.isArray(data)) {
    throw new Error('Input data must be an array.');
  }

  // 提取所有 value 值并排序
  const values = data.map(item => item.value).sort((a, b) => a - b);

  // 计算边界值
  const quartiles: number[] = [];
  for (let i = 1; i < 5; i++) {
    const index = (i / 5) * values.length;
    if (Number.isInteger(index)) {
      quartiles.push(values[index - 1]);
    } else {
      const lowerIndex = Math.floor(index);
      const upperIndex = Math.ceil(index);
      quartiles.push((values[lowerIndex - 1] + values[upperIndex - 1]) / 2);
    }
  }

  // 更新每个数据点的 level
  return data.map(item => ({
    ...item,
    level: item.value <= quartiles[0] ? 1 :
      item.value <= quartiles[1] ? 2 :
        item.value <= quartiles[2] ? 3 :
          item.value <= quartiles[3] ? 4 : 5
  }));
}

export function getStepData(data: never[]): IDatum[] {
  const result: Record<string, number> = {}

  for (const record of data) {
    if (record['@_type'] === "HKQuantityTypeIdentifierStepCount") {
      
      const rawDate = record['@_creationDate']
      const strDate = new Date(rawDate).toLocaleDateString()

      if (strDate in result) {
        result[strDate] = result[strDate] + Number(record['@_value'])
      } else {
        result[strDate] = Number(record['@_value'])
      }

    }
  }

  return Object.entries(result).reduce((acc, next) =>{
    return [
      ...acc,
      { dt: next[0], value: next[1], level: null }
    ]
  }, [] as IDatum[])
}

export function getOriginalRecords(text: string): never[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const jObj = parser.parse(text);

  const result = jObj?.HealthData?.Record ?? null

  return result
}
