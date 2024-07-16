import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DATE_FORMAT, IDatum, IMonthItem } from "../constant";
import { categorizeDataByLevels, patchDataList, getMonthList } from "../common";


export function useDataProcessing() {
  const [datumList, setDatumList] = useState<IDatum[]>([])
  const [months, setMonths] = useState<IMonthItem[]>([])

  const [originalList, setOriginalList] = useState<never[]>([])

  const [logs, setLogs] = useState<string[]>([])
  function addLog(message: string) {
    setLogs(prev => [
      ...prev,
      message
    ])
  }

  useEffect(() => {
    if (originalList.length === 0) {
      return
    }

    function finalProcess(unCategorizedData: IDatum[]) {
      const list = categorizeDataByLevels(unCategorizedData)
      const finalList = patchDataList(list)

      setDatumList(finalList);
      setMonths(getMonthList(finalList))
    }

    async function asyncBatchProcess(data: never[], batchSize: number, processor: (batch: never[], index: number) => boolean) {
      const totalBatches = Math.ceil(data.length / batchSize);
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize;
        const batch = data.slice(start, end);

        // 使用Promise.resolve()确保处理器函数执行完毕，但不阻塞主线程
        const status = await Promise.resolve().then(() => processor(batch, i));

        // 给JavaScript引擎一个机会去处理其他任务，避免长时间阻塞
        await new Promise(resolve => requestAnimationFrame(resolve));

        if (status === false) {
          break
        }
      }
    }

    const result: Record<string, number> = {}

    function resultAsArray() {
      return Object.entries(result).reduce((acc, next) => {
        return [
          ...acc,
          { dt: next[0], value: next[1], level: null, flag: 0 as const }
        ]
      }, [] as IDatum[])
    }

    // 示例处理器函数
    const sampleProcessor = (batch: never[], index: number) => {
      addLog(`正在处理第${index + 1}批数据...`);

      let i = 0
      for (const record of batch) {
        if (record['@_type'] === "HKQuantityTypeIdentifierStepCount") {

          const rawDate = record['@_creationDate']
          const dateString = getDateString(rawDate)

          if (dateString in result) {
            result[dateString] = result[dateString] + Number(record['@_value'])
          } else {
            result[dateString] = Number(record['@_value'])
          }

          i++;
        }
      }

      return i !== 0;
    };

    // 调用异步批量处理函数
    (async () => {
      await asyncBatchProcess(originalList, 2000, sampleProcessor);
      const resultList = resultAsArray();
      finalProcess(resultList);
      addLog('所有数据处理完毕。');
    })();

  }, [originalList])

  return {
    logs,
    datumList,
    months,
    setOriginalList,
    setDatumList,
    setMonths,
  }
}

function getDateString(dateTimeStr: string) {
  const regex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = dateTimeStr.match(regex);

  let result = '';

  if (match) {
    const year = match[1];
    const month = match[2];
    const day = match[3];

    // 保持月份为两位数字，如果小于10则前面补零
    const formattedMonth = month.padStart(2, '0');
    // 保持日期为两位数字，如果小于10则前面补零
    const formattedDay = day.padStart(2, '0');

    result = `${year}-${formattedMonth}-${formattedDay}`;
  }

  return format(new Date(result), DATE_FORMAT);
}
