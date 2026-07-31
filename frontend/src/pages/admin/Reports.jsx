import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from 'recharts'
import {
  Download, TrendingUp, Users,
  CheckCircle, XCircle, FileText
} from 'lucide-react'
import { useReportsData } from '../../hooks/useHeadHR'
import { useAllLeaves } from '../../hooks/useHR'

const currentYear = new Date().getFullYear()
const years = [currentYear, currentYear - 1, currentYear - 2]

const COLORS = [
  '#4f46e5', '#818cf8', '#3730a3',
  '#a5b4fc', '#6366f1', '#c7d2fe'
]

const STATUS_COLORS = {
  APPROVED:  '#4f46e5',
  REJECTED:  '#ef4444',
  PENDING:   '#f59e0b',
  DRAFT:     '#9ca3af',
}

export default function AdminReports() {
  const [year, setYear] = useState(String(currentYear))
  const { data: allData, isLoading } = useAllLeaves({ year })
  const all = allData?.results || allData || []

  const stats = useMemo(() => ({
    total:    all.length,
    approved: all.filter(l => l.status === 'APPROVED').length,
    rejected: all.filter(l => l.status === 'REJECTED').length,
    pending:  all.filter(l => !['APPROVED','REJECTED','DRAFT'].includes(l.status)).length,
    totalDays: all
      .filter(l => l.status === 'APPROVED')
      .reduce((s, l) => s + l.days_requested, 0),
    totalAllowance: all
      .filter(l => l.status === 'APPROVED')
      .reduce((s, l) => s + parseFloat(l.leave_allowance_ksh || 0), 0),
  }), [all])

  const byType = useMemo(() => {
    const map = {}
    all.forEach(l => {
      const type = l.leave_type_name || 'Unknown'
      if (!map[type]) map[type] = { name: type, count: 0, days: 0 }
      map[type].count++
      if (l.status === 'APPROVED') map[type].days += l.days_requested
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [all])

  const byDept = useMemo(() => {
    const map = {}
    all.forEach(l => {
      const dept = l.employee_department || 'Unknown'
      if (!map[dept]) map[dept] = { name: dept, count: 0 }
      map[dept].count++
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [all])

  const byStatus = useMemo(() => [
    { name: 'Approved', value: stats.approved,  color: STATUS_COLORS.APPROVED },
    { name: 'Rejected', value: stats.rejected,  color: STATUS_COLORS.REJECTED },
    { name: 'Pending',  value: stats.pending,   color: STATUS_COLORS.PENDING },
    { name: 'Draft',    value: all.filter(l => l.status === 'DRAFT').length,
      color: STATUS_COLORS.DRAFT },
  ].filter(s => s.value > 0), [stats, all])

  const byMonth = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('en', { month: 'short' }),
      count: 0,
      days:  0,
    }))
    all.filter(l => l.status === 'APPROVED').forEach(l => {
      const m = new Date(l.from_date).getMonth()
      months[m].count++
      months[m].days += l.days_requested
    })
    return months
  }, [all])

  const exportCSV = () => {
    const headers = [
      'ID', 'Employee', 'Department', 'Leave Type',
      'From', 'To', 'Days', 'Status',
      'Allowance (KSh)', 'Applied On'
    ]
    const rows = all.map(l => [
      `LV-${String(l.id).padStart(5, '0')}`,
      l.employee_name,
      l.employee_department || '',
      l.leave_type_name,
      l.from_date,
      l.to_date,
      l.days_requested,
      l.status,
      l.leave_allowance_ksh || '',
      new Date(l.created_at).toLocaleDateString('en-KE'),
    ])

    const csvContent = [headers, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `Leave_Report_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mt-2 mb-5">
        <div>
          <h1 className="text-brand-dark">Reports</h1>
          <p className="text-gray-500 text-sm">
            Leave utilization and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input-field w-28 py-2"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 btn-secondary
                       w-auto px-4 py-2 text-sm"
          >
            <Download size={15} /> CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-gray-600' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500' },
              { label: 'Pending', value: stats.pending, icon: TrendingUp, color: 'text-yellow-600' },
              { label: 'Total Days Approved', value: stats.totalDays, icon: Users, color: 'text-blue-600' },
              { label: 'Total Allowance (KSh)', value: stats.totalAllowance.toLocaleString(), icon: TrendingUp, color: 'text-brand' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={color} />
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="card mb-5">
            <h3 className="section-title">
              Monthly Approved Leave — {year}
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byMonth}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="days" name="Days" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="card">
              <h3 className="section-title">Status Breakdown</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {byStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">By Leave Type</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byType}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
                      {byType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {byDept.length > 0 && (
            <div className="card mb-5">
              <h3 className="section-title">Leave by Department</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byDept}
                    margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, angle: -20, textAnchor: 'end' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title mb-0">
                All Records — {year}
              </h3>
              <span className="text-xs text-gray-400">
                {all.length} records
              </span>
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['ID','Employee','Type','From','To','Days','Status','Allowance'].map(h => (
                      <th key={h} className="text-left text-gray-500 font-medium py-2 pr-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {all.map(l => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 pr-3 text-gray-500">
                        LV-{String(l.id).padStart(5,'0')}
                      </td>
                      <td className="py-2 pr-3 font-medium text-gray-800">
                        {l.employee_name}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {l.leave_type_name}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {l.from_date}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {l.to_date}
                      </td>
                      <td className="py-2 pr-3 text-brand font-medium">
                        {l.days_requested}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs
                          font-medium ${
                            l.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : l.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {l.leave_allowance_ksh
                          ? `${Number(l.leave_allowance_ksh).toLocaleString()}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}