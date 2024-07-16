import './index.css'

import { Skeleton, Tooltip } from "antd"
import { format } from "date-fns"
import { type IDatum, type IMonthItem, weeks } from "../constant"
import { useMemo } from "react"
import { getDateMap } from "../common"
import classnames from "classnames"


interface IProps {
  data: IDatum[]
  months: IMonthItem[]
}

export default function HealthCalendar({
  data,
  months,
}: IProps) {
  const map = useMemo(() => {
    return getDateMap(data)
  }, [data])

  if (data.length === 0) {
    return (
      <Skeleton />
    )
  }

  return (
    <table className='HealthCalendar-table'>
      <thead>
        <tr>
          <th style={{ width: 28 }}></th>
          {months.map(item => {
            const monthName = new Date(item.label).toLocaleString('zh', { month: 'short' })
            return (
              <td key={item.label} className='ContributionCalendar-label' colSpan={item.span}>
                {monthName}
              </td>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {map && weeks.map((week, k) => {
          const dateArray = map[week]

          return (
            <tr key={week} className='HealthCalendar-row'>
              <WeekCell index={k} />
              {dateArray.map((item, j) => <Cell key={j} item={item} />)}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Cell({
  item
}:{
  item: IDatum
}) {
  const title = format(item.dt, 'yyyy-MM-dd') + ` - ${item.value}`

  const isDebug = false
  const cls = classnames(
    'HealthCalendar-day',
    isDebug ? (
      item.flag === 0 ? 'odd' : ''
    ) : ''
  )

  return (
    <Tooltip title={title}>
      <td
        className={cls}
        data-level={item.level ? +item.level - 1 : null}
      ></td>
    </Tooltip>
  )
}

function WeekCell({
  index
}: {
  index: number
}) {
  return (
    <td className='ContributionCalendar-label'>
      <span className="sr-only">weeks[index]</span>
      <span style={{
        position: 'absolute',
        bottom: -3,
        clipPath: index % 2 !== 0 ? 'none' : 'Circle(0)'
      }}>
        {weeks[index]}
      </span>
    </td>
  )
}
