import './DataTable.css'

import { Tooltip } from "antd"
import { format } from "date-fns"
import { type IDatum, type IMonthItem, weeks } from "./constant"
import { useMemo } from "react"
import { getDateMap } from "./common"


export default function DataTable({
  data,
  months,
}: {
  data: IDatum[]
  months: IMonthItem[]
}) {
  const map = useMemo(() => {
    return getDateMap(data)
  }, [data])

  return (
    <table className='table'>
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
            <tr key={week} className='row'>
              <td className='ContributionCalendar-label'>
                <span className="sr-only">Tuesday</span>
                <span style={{
                  position: 'absolute',
                  bottom: -3,
                  clipPath: k % 2 !== 0 ? 'none' : 'Circle(0)'
                }}>
                  {weeks[k]}
                </span>
              </td>
              {
                dateArray.map((item, j) => {
                  const title = format(item.dt, 'yyyy-MM-dd') + ` - ${item.value}`
                  return (
                    <Tooltip title={title} key={j}>
                      <td
                        className='cell ContributionCalendar-day'
                        data-level={item.level ? +item.level - 1 : null}
                      ></td>
                    </Tooltip>
                  )
                })
              }
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
