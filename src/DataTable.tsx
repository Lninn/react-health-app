import './DataTable.css'

import { Tooltip } from "antd"
import { format } from "date-fns"
import { type IDatum, weeks } from "./constant"
import { useMemo } from "react"
import { getDateMap } from "./common"


export default function DataTable({
  data,
}: {
  data: IDatum[]
}) {
  const map = useMemo(() => {
    return getDateMap(data)
  }, [data])

  return (
    <table className='table'>
      <tbody>
        {map && weeks.map(week => {
          const dateArray = map[week]

          return (
            <tr key={week} className='row'>
              {
                dateArray.map((item, j) => {
                  const title = format(item.dt, 'yyyy-MM-dd') + ` - ${item.value}`
                  return (
                    <Tooltip title={title} key={j}>
                      <td
                        className='cell ContributionCalendar-day'
                        data-level={item.level}
                      />
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
