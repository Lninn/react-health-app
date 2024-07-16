import './Footer.css'

import { Button } from 'antd'
import { GithubOutlined } from '@ant-design/icons'


export function Footer() {
  return (
    <footer className="footer">
      <div className='footer-content'>
        <span>IOS 健康App-日历数据</span>
        <Button
          type='link'
          icon={<GithubOutlined />}
          onClick={() => {
            window.open('https://github.com/Lninn/vite-react-project')
          }}
        />
      </div>
    </footer>
  )
}
