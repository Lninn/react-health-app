import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { getDateArrayByRange, getDateMap } from './common'
import { type Week } from './constant'
import DataTable from './DataTable'


function App() {
  const [dateMap, setDateMap] = useState<Record<Week, Date[]>>()

  useEffect(() => {
    console.log('App mounted')

    const now = new Date()
    const before1Year = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 2)
    const dateOfLast6Month = getDateArrayByRange(before1Year, now)

    const map = getDateMap(dateOfLast6Month)

    setDateMap(
      map
    )

    return () => {
      console.log('App unmounted')
    }
  }, [])

  return (
    <>
      {dateMap ? <DataTable map={dateMap} /> : null}
    </>
  )
}

export default App
