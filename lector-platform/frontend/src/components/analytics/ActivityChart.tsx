import React from 'react'

interface ActivityChartProps {
  activityByDay: { date: string; count: number }[]
}

const DAY_LABELS: Record<number, string> = {
  0: 'Min',
  1: 'Sen',
  2: 'Sel',
  3: 'Rab',
  4: 'Kam',
  5: 'Jum',
  6: 'Sab',
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activityByDay }) => {
  const maxCount = Math.max(...activityByDay.map((d) => d.count), 1)

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-24">
        {activityByDay.map(({ date, count }) => {
          const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 8 : 2)
          const dayOfWeek = new Date(date + 'T00:00:00').getDay()
          const dayLabel = DAY_LABELS[dayOfWeek] ?? ''
          const isToday = date === new Date().toISOString().split('T')[0]

          return (
            <div key={date} className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    background:
                      count > 0
                        ? isToday
                          ? 'linear-gradient(180deg, #9d8ff9, #7c6af7)'
                          : '#7c6af7'
                        : '#1f2937',
                    minHeight: '2px',
                  }}
                  title={`${date}: ${count} aktivitas`}
                />
              </div>
              <span
                className={`text-xs leading-none ${isToday ? 'text-[#9d8ff9] font-semibold' : 'text-gray-500'}`}
              >
                {dayLabel}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">14 hari terakhir</span>
        <span className="text-xs text-gray-500">
          Total:{' '}
          <span className="text-purple-400 font-semibold">
            {activityByDay.reduce((s, d) => s + d.count, 0)} aktivitas
          </span>
        </span>
      </div>
    </div>
  )
}

export default ActivityChart
