import './App.css'

import { CSSProperties, useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { Button, Divider, message, Progress, Slider, Space, Upload } from 'antd'
import { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { categorizeDataByLevels, getOriginalRecords, getStepData } from './common'
import { type IDatum } from './constant'
import DataTable from './DataTable'
import { DeleteOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'


const KEY = 'stepData'

function App() {
  const [percent, setPercent] = useState(0)
  const [datumList, setDatumList] = useState<IDatum[]>([])
  const [size, setSize] = useState(10)

  useEffect(() => {
    console.log('App mounted ')

    try {
      const res = localStorage.getItem(KEY)
      const data = JSON.parse(res ?? '')
      if (data) {
        setDatumList(data)
      }
    } catch (error) {
      console.log('error on localStorage ')
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
      setDatumList(list);

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
        <Space>
          <Button title='保存数据到本地' onClick={saveToLocalStorage} icon={<SaveOutlined />} />
          <Button title='清空数据' onClick={clearData} icon={<DeleteOutlined />} />
        </Space>
        <div>
          <Upload beforeUpload={() => false} onChange={handleFileChange}>
            <Button icon={<UploadOutlined />}>上传文件并解析</Button>
          </Upload>
          <LabelItem label='文件进度'>
            <Progress percent={percent} type="line" />
          </LabelItem>
        </div>
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
      <DataTable data={datumList} />
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
