import { WeeklyHours, getCurrentDayInfo, formatDayHours, DAYS, DAY_NAMES } from '@/lib/hours'

interface OpeningHoursProps {
  hours: WeeklyHours | null
}

export default function OpeningHours({ hours }: OpeningHoursProps) {
  if (!hours) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h2>
        <p className="text-gray-600">Opening hours not available</p>
      </div>
    )
  }

  const { dayName, hours: todayHours, isOpen } = getCurrentDayInfo(hours)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Opening Hours</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isOpen
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isOpen ? 'Open now' : 'Closed now'}
        </span>
      </div>

      <div className="space-y-2">
        {DAYS.map((day, index) => {
          const isToday = DAY_NAMES[index] === dayName
          return (
            <div key={day} className={`flex justify-between items-center ${
              isToday ? 'bg-blue-50 -mx-2 px-2 py-1 rounded' : ''
            }`}>
              <span className={`font-medium ${
                isToday ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {DAY_NAMES[index]}
                {isToday && ' (Today)'}
              </span>
              <span className={`${
                isToday ? 'text-blue-800' : 'text-gray-600'
              }`}>
                {formatDayHours(hours[day])}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}