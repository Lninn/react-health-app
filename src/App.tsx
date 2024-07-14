import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { getDateMap } from './common'
import { type IDatum, type Week } from './constant'
import DataTable from './DataTable'
import { Button, Upload } from 'antd'
import { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { XMLParser } from 'fast-xml-parser'



function categorizeDataByLevels(data: IDatum[]) {
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

function App() {
  const [dateMap, setDateMap] = useState<Record<Week, IDatum[]>>()

  const [resultMap, setResultMap] = useState<Record<string, number>>()

  useEffect(() => {
    console.log('App mounted ', resultMap)

    if (!resultMap) return

    console.log("数据转换中...")
    const unHandData: IDatum[] = []
    for (const [key, value] of Object.entries(resultMap)) {
      unHandData.push({
        dt: key,
        value,
        level: null
      })
    }

    const finalData = categorizeDataByLevels(unHandData)

    const map = getDateMap(finalData)

    console.log("数据渲染...")
    setDateMap(
      map
    )

    return () => {
      console.log('App unmounted')
    }
  }, [resultMap])

  function handleFileChange(evt: UploadChangeParam<UploadFile<string>>) {
    const file = evt.file

    const reader = new FileReader()
    reader.onload = async (e) => {
      const XMLdata = (e.target?.result) ?? ''
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
      const jObj = parser.parse(XMLdata);

      const recordList = jObj.HealthData.Record

      const stepDataList = []

      for (const record of recordList) {
        if (record['@_type'] === "HKQuantityTypeIdentifierStepCount") {
          stepDataList.push(record)
        }
      }

      const result: Record<string, number> = {}

      for (const record of stepDataList) {
        const rawDate = record['@_creationDate']
        const strDate = new Date(rawDate).toLocaleDateString()

        if (strDate in result) {
          result[strDate] = result[strDate] + Number(record['@_value'])
        } else {
          result[strDate] = Number(record['@_value'])
        }

      }

      console.log('数据解析完成...')
      setResultMap(result)
    };
    console.log('开始解析数据...')
    reader.readAsText(file as never as Blob)

  }

  return (
    <>
      <Upload beforeUpload={() => false} onChange={handleFileChange}>
        <Button>Click to Upload</Button>
      </Upload>
      {dateMap ? <DataTable map={dateMap} /> : null}
    </>
  )
}

export default App
