interface BusyTimeData {
  dayOfWeek: number
  hour: number
  averageScore: number
}

interface TopBusyWindow {
  day: string
  timeRange: string
  averageScore: number
}

interface TypicalBusyTimesProps {
  hasEnoughData: boolean
  busyTimeData: BusyTimeData[]
  topBusyWindows: TopBusyWindow[]
}

export default function TypicalBusyTimes({
  hasEnoughData,
  busyTimeData,
  topBusyWindows,
}: TypicalBusyTimesProps) {
  if (!hasEnoughData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Typical Busy Times</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Not enough data yet</h3>
          <p className="text-gray-600 text-sm">
            We need at least 30 days of status updates to show typical busy times. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

  const getIntensityColor = (score: number) => {
    if (score >= 2.5) return 'bg-red-400'
    if (score >= 2) return 'bg-yellow-400'
    if (score >= 1.5) return 'bg-green-400'
    return 'bg-green-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Typical Busy Times</h2>

      {/* Top Busy Windows */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-900 mb-4">Typically busiest times:</h3>
        <div className="space-y-2">
          {topBusyWindows.map((window, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                <span className="font-medium">#{index + 1}</span> {window.day} {window.timeRange}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                window.averageScore >= 2.5
                  ? 'bg-red-100 text-red-800'
                  : window.averageScore >= 2
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {window.averageScore >= 2.5 ? 'Very Busy' : window.averageScore >= 2 ? 'Busy' : 'Moderate'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Weekly Pattern</h3>

        {/* Legend */}
        <div className="flex items-center justify-center mb-4 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
              <span>Quiet</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
              <span>Light</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
              <span>Busy</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour headers */}
            <div className="flex mb-1">
              <div className="w-12"></div> {/* Spacer for day labels */}
              {hours.map(hour => (
                <div key={hour} className="w-6 text-xs text-gray-500 text-center">
                  {hour}
                </div>
              ))}
            </div>

            {/* Days and data */}
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1">
                <div className="w-12 text-xs text-gray-700 font-medium">
                  {dayNames[dayIndex]}
                </div>
                {hours.map(hour => {
                  const dataPoint = busyTimeData.find(
                    d => d.dayOfWeek === dayIndex && d.hour === hour
                  )
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`w-6 h-6 mr-px rounded-sm ${
                        dataPoint
                          ? getIntensityColor(dataPoint.averageScore)
                          : 'bg-gray-100'
                      }`}
                      title={
                        dataPoint
                          ? `${dayNames[dayIndex]} ${hour}:00 - Score: ${dataPoint.averageScore.toFixed(1)}`
                          : 'No data'
                      }
                    ></div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Based on the last 30 days of status updates
        </p>
      </div>
    </div>
  )
}