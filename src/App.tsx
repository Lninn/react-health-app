import './App.css'

import { CSSProperties, useEffect, useRef, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { Button, Divider, message, Skeleton, Slider, Space, Upload } from 'antd'
import { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { DeleteOutlined, FileImageOutlined, GithubOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import HealthCalendar from './HealthCalendar'
import {
  getMonthList,
  getOriginalRecords,
} from './common'
import * as htmlToImage from 'html-to-image';
import downloadjs from 'downloadjs'
import JSZip from 'jszip';
import VConsole from 'vconsole';
import { useDataProcessing } from './HealthCalendar/process'
import { Footer } from './components'


new VConsole();

const KEY = 'stepData'

function extractName(filename: string) {
  const result = filename.split('.')
  return result[0]
}

function getFileName(fullPath: string) {
  const result = fullPath.split('/')
  return extractName(result[result.length - 1])
}

function App() {

  const [size, setSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const dataNodeRef = useRef<HTMLDivElement | null>(null)
  const { datumList, months, setOriginalList, setDatumList, setMonths } = useDataProcessing()

  function handleFile(file: UploadFile<string>) {
    const originalFileName = extractName(file.name);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const zipData = fileReader.result;
      loadAndProcessZip(zipData as ArrayBuffer, originalFileName, (fileContent) => {
        const originalResult = getOriginalRecords(fileContent)
        setOriginalList(originalResult);

        message.info('数据解析完成');
        setLoading(false);
      });
    };
    setLoading(true);
    fileReader.readAsArrayBuffer(file as never as Blob);
  }

  async function loadAndProcessZip(
    zipData: ArrayBuffer,
    originalFileName: string,
    run: (fileContent: string) => void
  ) {
    // 使用 JSZip 解析 ZIP 文件
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipData);

    // 遍历 ZIP 文件中的所有条目
    Object.keys(loadedZip.files).forEach(async fileName => {
      const file = loadedZip.files[fileName];

      if (!file.dir) {
        // 读取文件内容为文本或 ArrayBuffer
        const fileContent = await file.async('text'); // 或者使用 'arraybuffer' 或 'nodebuffer'
        console.log(`Content of ${fileName}:`);

        const realFilename = getFileName(file.name)
        if (realFilename === originalFileName) {
          run(fileContent)
        }
      }
    });
  }

  useEffect(() => {
    console.log('App mounted ')

    try {
      const res = localStorage.getItem(KEY)
      const data = JSON.parse(res ?? '[]')
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

    if (!file) {
      console.log('No file selected');
      return;
    }

    handleFile(file);
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

  function saveAsImage() {
    const node = dataNodeRef.current
    if (!node) return

    htmlToImage.toPng(node)
      .then(function (dataUrl) {
        downloadjs(dataUrl, 'my-node.png');
      });
  }

  return (
    <Skeleton active loading={loading} >
      <div style={rootStyle}>
        <div>
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
            <Button title='保存为图片' onClick={saveAsImage} icon={<FileImageOutlined />} />
          </Space>

          <LabelItem label="调整单元格大小">
            <Slider
              min={5}
              max={15}
              value={size}
              onChange={handleSizeChange}
              tooltip={{ open: false }}
            />
          </LabelItem>
          <LabelItem label='天数'>
            {datumList.length + '天'}
          </LabelItem>
        </div>
        <Divider />
        <div className="table-wrapper" ref={dataNodeRef}>
          {
            datumList.length ? (
              <HealthCalendar months={months} data={datumList} />
            ) : <Skeleton />
          }
        </div>

        <div className='indicator'>
          <div className='cell HealthCalendar-day' />
          <div className='cell HealthCalendar-day' data-level="1" />
          <div className='cell HealthCalendar-day' data-level="2" />
          <div className='cell HealthCalendar-day' data-level="3" />
          <div className='cell HealthCalendar-day' data-level="4" />
        </div>
      </div>

      <Footer />
    </Skeleton>
  )
}

function LabelItem({
  label,
  children,
}: {
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
