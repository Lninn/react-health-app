import { Tooltip } from "antd"
import { format } from "date-fns"
import { type Week, weeks } from "./constant"


export default function DataTable({
  map,
}: {
  map: Record<Week, Date[]>
}) {
  return (
    <table className='table'>
      <tbody>
        {map && weeks.map(week => {
          const dateArray = map[week]

          return (
            <tr key={week} style={{ height: 10 }}>{dateArray.map((date, j) => {
              const dateString = format(date, 'yyyy-MM-dd') + ' 没有数据'
              return (
                <Tooltip title={dateString} key={j}>
                  <td className='cell ContributionCalendar-day' data-level="2" data-value={dateString} />
                </Tooltip>
              )
            })}</tr>
          )
        })}
      </tbody>
    </table>
  )
}
