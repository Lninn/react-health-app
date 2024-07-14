import { Tooltip } from "antd"
import { format } from "date-fns"
import { type IDatum, type Week, weeks } from "./constant"


export default function DataTable({
  map,
}: {
  map: Record<Week, IDatum[]>
}) {
  return (
    <table className='table'>
      <tbody>
        {map && weeks.map(week => {
          const dateArray = map[week]

          return (
            <tr key={week} style={{ height: 10 }}>{dateArray.map((item, j) => {
              const dateString = format(item.dt, 'yyyy-MM-dd')
              return (
                <Tooltip title={dateString} key={j}>
                  <td className='cell ContributionCalendar-day' data-level={item.level} data-value={dateString} />
                </Tooltip>
              )
            })}</tr>
          )
        })}
      </tbody>
    </table>
  )
}
