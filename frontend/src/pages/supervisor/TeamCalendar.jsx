import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useTeamLeaves } from '../../hooks/useSupervisor'
import StatusBadge from '../../components/StatusBadge'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const COLORS = [
  'bg-blue-400', 'bg-purple-400', 'bg-orange-400',
  'bg-pink-400', 'bg-teal-400', 'bg-indigo-400',
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function isDateInRange(date, from, to) {
  const d = date.getTime()
  return d >= new Date(from).getTime() && d <= new Date(to).getTime()
}

export default function TeamCalendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const { data: teamLeaves = [], isLoading } = useTeamLeaves()

  const activeLeaves = useMemo(() =>
    teamLeaves.filter(l =>
      ['APPROVED', 'SUPERVISOR_REVIEW', 'HR_REVIEW', 'HR_CHECK'].includes(l.status)
    ),
    [teamLeaves]
  )

  const employeeColors = useMemo(() => {
    const map = {}
    const names = [...new Set(activeLeaves.map(l => l.employee_name))]
    names.forEach((name, i) => { map[name] = COLORS[i % COLORS.length] })
    return map
  }, [activeLeaves])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const getLeavesOnDay = (day) => {
    const date = new Date(viewYear, viewMonth, day)
    return activeLeaves.filter(l => isDateInRange(date, l.from_date, l.to_date))
  }

  const selectedDayLeaves = selectedDay ? getLeavesOnDay(selectedDay) : []

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">Team Calendar</h1>
        <p className="text-gray-500 text-sm">See who is on leave when</p>
      </div>

      {/* Calendar card */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-kfs-dark">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const leavesOnDay = getLeavesOnDay(day)
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear()
            const isSelected = selectedDay === day
            const isWeekend = new Date(viewYear, viewMonth, day).getDay() % 6 === 0

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center rounded-lg py-1.5
                            min-h-[44px] transition-colors text-sm
                            ${isToday ? 'bg-kfs-green text-white font-bold' : ''}
                            ${isSelected && !isToday ? 'bg-kfs-accent' : ''}
                            ${isWeekend && !isToday ? 'text-gray-400' : ''}
                            ${!isToday && !isSelected ? 'hover:bg-gray-50' : ''}
                          `}
              >
                <span className="text-xs leading-none mb-1">{day}</span>
                {leavesOnDay.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center px-1">
                    {leavesOnDay.slice(0, 3).map((l, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday ? 'bg-white' :
                          employeeColors[l.employee_name] || 'bg-gray-400'
                        }`}
                      />
                    ))}
                    {leavesOnDay.length > 3 && (
                      <span className={`text-[9px] leading-none ${
                        isToday ? 'text-white' : 'text-gray-500'
                      }`}>
                        +{leavesOnDay.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card mb-4">
          <h3 className="section-title">
            {MONTHS[viewMonth]} {selectedDay}, {viewYear}
          </h3>
          {selectedDayLeaves.length === 0 ? (
            <p className="text-gray-400 text-sm">No one on leave this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedDayLeaves.map(leave => (
                <div key={leave.id} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0
                                   ${employeeColors[leave.employee_name]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {leave.employee_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leave.leave_type_name} •{' '}
                      {leave.from_date} → {leave.to_date}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="card mb-4">
        <h3 className="section-title">Team Members</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : Object.keys(employeeColors).length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
            <Users size={16} />
            No active or upcoming leaves.
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(employeeColors).map(([name, color]) => {
              const empLeaves = activeLeaves.filter(l => l.employee_name === name)
              return (
                <div key={name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">
                      {empLeaves.length} active leave{empLeaves.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* All team leaves list */}
      <div className="mb-8">
        <h3 className="section-title">All Team Leaves</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : teamLeaves.length === 0 ? (
          <div className="card text-center py-8">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">No team leave records found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teamLeaves.map(leave => (
              <div key={leave.id} className="card flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0
                                 ${employeeColors[leave.employee_name] || 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">
                    {leave.employee_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave.leave_type_name} •{' '}
                    {leave.from_date} → {leave.to_date} •{' '}
                    {leave.days_requested}d
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}