import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns"
import { 
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
} from 'date-fns'
import type { IMonthItem, IDatum, Week } from "./constant"
import { XMLParser } from 'fast-xml-parser'

function formatYearMonthDay(dateTimeStr: string) {
  const regex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = dateTimeStr.match(regex);
  
  if (match) {
    const year = match[1];
    const month = match[2];
    const day = match[3];
    
    // 保持月份为两位数字，如果小于10则前面补零
    const formattedMonth = month.padStart(2, '0');
    // 保持日期为两位数字，如果小于10则前面补零
    const formattedDay = day.padStart(2, '0');
    
    return `${year}-${formattedMonth}-${formattedDay}`;
  }
  
  return null; // 如果字符串不匹配，则返回 null
}


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

  function add(week: Week, item: IDatum) {
    const m = new Date(item.dt).getMonth() + 1
    map[week].push({
      ...item,
      flag: m % 2 === 0 ? 1 : 0
    })
  }

  items.forEach(item => {
    const date = item.dt
    if (isMonday(date)) {
      add('Mon', item)
    } else if (isTuesday(date)) {
      add('Tue', item)
    } else if (isWednesday(date)) {
      add('Wed', item)
    } else if (isThursday(date)) {
      add('Thu', item)
    } else if (isFriday(date)) {
      add('Fri', item)
    } else if (isSaturday(date)) {
      add('Sat', item)
    } else if (isSunday(date)) {
      add('Sun', item)
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

  try {
    for (const record of data) {
      if (record['@_type'] === "HKQuantityTypeIdentifierStepCount") {
        
        const rawDate = record['@_creationDate']
        const normalDate = formatYearMonthDay(rawDate) ?? ''
        const strDate = new Date(normalDate).toLocaleDateString()
  
        if (strDate in result) {
          result[strDate] = result[strDate] + Number(record['@_value'])
        } else {
          result[strDate] = Number(record['@_value'])
        }

      }
    }
  } catch (error) {
    console.log('getStepData error ')
  }

  return Object.entries(result).reduce((acc, next) =>{
    return [
      ...acc,
      { dt: next[0], value: next[1], level: null, flag: 0 }
    ]
  }, [] as IDatum[])
}

export function getOriginalRecords(text: string): never[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const jObj = parser.parse(text);

  const result = jObj?.HealthData?.Record ?? null

  return result
}

// 假设我们没有使用额外的库，使用原生 JavaScript 实现
 export function fillMissingDates(dataList: IDatum[]): IDatum[] {
  const filledList: IDatum[] = [...dataList]; // 创建原始列表的副本，避免修改原列表
  let lastDate = new Date(filledList[0].dt);

  for (let i = 1; i < filledList.length; i++) {
    const currentDate = new Date(filledList[i].dt);
    const daysDifference = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    // 如果两个日期之间有超过一天的差异，则填充缺失的日期
    if (daysDifference > 1) {
      for (let j = 1; j < daysDifference; j++) {
        const missingDate = new Date(lastDate);
        missingDate.setDate(lastDate.getDate() + j);
        const formattedDate = `${missingDate.getFullYear()}/${missingDate.getMonth() + 1}/${missingDate.getDate()}`;

        // 填充缺失的日期，可以设置默认的 value 和 level
        filledList.splice(i + j - 1, 0, {
          dt: formattedDate,
          value: 0, // 默认 value
          level: null, // 默认 level,
          flag: 0,
        });
      }
    }

    lastDate = currentDate;
  }

  return filledList;
}

export function isDataContinuousInRange(start: string, end: string, dataList: IDatum[]): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 确保开始日期小于等于结束日期
  if (startDate > endDate) {
    throw new Error('Start date must be less than or equal to end date.');
  }

  const dateSet = new Set(dataList.map(item => item.dt));

  for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    const dateString = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
    if (!dateSet.has(dateString)) {
      return false;
    }
  }

  return true;
}

export function patchDataList(list: IDatum[]) {
  const sliceList = list.sort((prev, next) => {
    const prevDate = new Date(prev.dt)
    const nextDate = new Date(next.dt)
    return prevDate.getTime() - nextDate.getTime()
  })

  const finalList = fillMissingDates(sliceList)

  // 连续性检查
  const start = finalList[0].dt
  const end = finalList[finalList.length - 1].dt
  if (!isDataContinuousInRange(start, end, finalList)) {
    console.log('存在不连续的日期')
  }

  return finalList
}

export function getMonthList(data: IDatum[]): IMonthItem[] {
  const result: IMonthItem[] = []

  const gm = (item: IDatum) => new Date(item.dt).getMonth() + 1

  const isTwoContinuousMonths = (date1: string, date2: string) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    const endOfDate1 = format(endOfMonth(d1), 'yyyy/M/d')
    const startOfDate2 = format(startOfMonth(d2), 'yyyy/M/d')
    
    return (
      endOfDate1 === date1 &&
      startOfDate2 === date2
    )
  }

  const weekOfCount = 7
  let i = 0
  let span = 0

  while(i < data.length) {
    const list = data.slice(i, i + weekOfCount)

    const tmp = list.map(gm)
    const isSameMonth = tmp.every(m => m === tmp[0])

    const isNotTwoContinuousMonths = !isTwoContinuousMonths(
      data[(i + weekOfCount - 1) % data.length].dt,
      data[(i + weekOfCount) % data.length].dt,
    )

    // const restCheck = tmp.length === weekOfCount
    const restCheck = true
    if (isSameMonth && isNotTwoContinuousMonths && restCheck) {
      span++
    } else {
      result.push({
        label: data[i].dt,
        span: span + 1,
        logs: tmp,
      })
      span = 0
    }

    i += weekOfCount
  }

  return result
}
