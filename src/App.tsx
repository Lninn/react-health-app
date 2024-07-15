import './App.css'

import { CSSProperties, useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { Button, Divider, message, Progress, Skeleton, Slider, Space, Upload } from 'antd'
import { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { DeleteOutlined, GithubOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import type { IMonthItem, IDatum } from './constant'
import DataTable from './DataTable'
import {
  categorizeDataByLevels,
  getMonthList,
  getOriginalRecords,
  getStepData,
  patchDataList
} from './common'


const KEY = 'stepData'

function App() {
  const [percent, setPercent] = useState(0)
  const [datumList, setDatumList] = useState<IDatum[]>([])
  const [months, setMonths] = useState<IMonthItem[]>([])
  const [size, setSize] = useState(12)

  useEffect(() => {
    console.log('App mounted ')

    try {
      const res = localStorage.getItem(KEY)
      const data = JSON.parse(res ?? '')
      if (data) {
        setMonths(getMonthList(data))
        setDatumList(data)
      }
    } catch (error) {
      console.log('error on localStorage ', error)
    }

    return () => {
      console.log('App unmounted')
    }
  }, [])

  function handleSizeChange(val: number) {
    setSize(val)
  }

  function handleFileChange(evt: UploadChangeParam<UploadFile<string>>) {
    const file = evt.file

    const reader = new FileReader()
  
    reader.onprogress = (ev) => {
      const { loaded, total } = ev
      const val = Math.floor((loaded / total) * 100)
      setPercent(val)
    }

    reader.onload = (ev) => {
      const textResult = (ev.target?.result) ?? ''
      const originalResult = getOriginalRecords(textResult as string)

      const unSetData = getStepData(originalResult)
      const list = categorizeDataByLevels(unSetData)

     const finalList = patchDataList(list)

      setDatumList(finalList);
      setMonths(getMonthList(finalList))

      message.info('数据解析完成')
    }
    reader.readAsText(file as never as Blob)
  }

  const rootStyle: CSSProperties & { [key in string]: string | number } = {
    '--cell-size': size + 'px'
  }

  function saveToLocalStorage() {
    if (datumList.length === 0) {
      message.warning('请先解析数据')
      return
    }

    const key = KEY
    const value = JSON.stringify(datumList)
    localStorage.setItem(key, value)

    message.info('数据已保存到本地浏览器')
  }

  function clearData() {
    const key = KEY
    localStorage.removeItem(key)
    setDatumList([])

    message.info('数据已清空')
  }

  return (
    <div style={rootStyle}>
      <div style={{ width: 450 }}>
        <Space style={{ marginBlockEnd: 16 }}>
          <Button
            icon={<GithubOutlined />}
            onClick={() => {
              window.open('https://github.com/Lninn/vite-react-project')
            }}
          />
          <Button title='保存数据到本地' onClick={saveToLocalStorage} icon={<SaveOutlined />} />
          <Button title='清空数据' onClick={clearData} icon={<DeleteOutlined />} />
          <Upload beforeUpload={() => false} onChange={handleFileChange}>
            <Button icon={<UploadOutlined />}>上传文件并解析</Button>
          </Upload>
        </Space>

        <LabelItem label='文件解析  进度'>
          <Progress percent={percent} type="line" />
        </LabelItem>

        <LabelItem label="调整单元格大小">
          <Slider
            min={5}
            max={15}
            value={size}
            onChange={handleSizeChange}
            tooltip={{ open: true }}
          />
        </LabelItem>
        <LabelItem label='天数'>
          {datumList.length + '天'}
        </LabelItem>
      </div>
      <Divider />
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {
          datumList.length ? (
            <DataTable months={months} data={datumList} />
          ) : <Skeleton />
        }
      </div>

      <div className='indicator'>
        <div className='cell ContributionCalendar-day' />
        <div className='cell ContributionCalendar-day' data-level="1" />
        <div className='cell ContributionCalendar-day' data-level="2" />
        <div className='cell ContributionCalendar-day' data-level="3" />
        <div className='cell ContributionCalendar-day' data-level="4" />
      </div>

      <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
        数据来自 Apple 健康 App
      </div>
    </div>
  )
}

function LabelItem({
  label,
  children,
}:{
  label: string;
  children: React.ReactNode
}) {
  return (
    <div className='label-item'>
      <div className='name'>{label}：</div>
      <div style={{ flexGrow: 1 }}>{children}</div>
    </div>
  )
}

export default App
