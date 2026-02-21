// components/analytics/AnalyticsChart.tsx
'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  FiBarChart2, FiPieChart, FiTrendingUp, FiUsers, FiActivity
} from 'react-icons/fi'

type Activity = {
  id: string
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  status: string
  bsc_category?: string
  employees?: { full_name: string; email: string }
  activity_types?: { name: string; is_mandatory: boolean; category?: string }
  departments?: { name: string }
}

type Employee = {
  id: string
  full_name: string
  email: string
}

type Department = {
  id: string
  name: string
}

export default function AnalyticsChart({
  activities,
  employees,
  departments,
}: {
  activities: Activity[]
  employees: Employee[]
  departments: Department[]
}) {
  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1
    })
    return counts
  }, [activities])

  // Department distribution
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(a => {
      const dept = a.departments?.name || 'Unknown'
      counts[dept] = (counts[dept] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [activities])

  // Daily distribution
  const dailyData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(a => {
      const day = format(new Date(a.report_date), 'EEE')
      counts[day] = (counts[day] || 0) + 1
    })
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => ({ day: d, count: counts[d] || 0 }))
  }, [activities])

  // Employee activity counts
  const employeeData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(a => {
      const name = a.employees?.full_name || 'Unknown'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [activities])

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach(a => {
      const cat = a.bsc_category || a.activity_types?.category || 'Other'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [activities])

  // Average completion
  const avgCompletion = useMemo(() => {
    if (activities.length === 0) return 0
    const total = activities.reduce((sum, a) => sum + (a.percentage_complete || 0), 0)
    return Math.round(total / activities.length)
  }, [activities])

  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)
  const maxEmployee = employeeData.length > 0 ? employeeData[0][1] : 1
  const maxDepartment = departmentData.length > 0 ? departmentData[0][1] : 1

  const statusColorMap: Record<string, string> = {
    submitted: '#3b82f6',
    reviewed: '#10b981',
    needs_clarification: '#f59e0b',
    draft: '#9ca3af',
  }

  const statusLabelMap: Record<string, string> = {
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    needs_clarification: 'Needs Info',
    draft: 'Draft',
  }

  const deptColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16']

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiBarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No data to display</h3>
        <p className="text-gray-500 text-sm">There are no activities for the selected period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{activities.length}</p>
          <p className="text-xs text-blue-600 mt-0.5">Total Activities</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{statusData['reviewed'] || 0}</p>
          <p className="text-xs text-green-600 mt-0.5">Reviewed</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">{avgCompletion}%</p>
          <p className="text-xs text-purple-600 mt-0.5">Avg Completion</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">
            {new Set(activities.map(a => a.employees?.full_name)).size}
          </p>
          <p className="text-xs text-orange-600 mt-0.5">Active Employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Distribution Chart */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Activities by Day</h3>
          </div>
          <div className="flex items-end gap-2 h-40 px-2">
            {dailyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{item.count || ''}</span>
                <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500"
                    style={{ height: `${maxDaily > 0 ? (item.count / maxDaily) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Status Distribution</h3>
          </div>

          {/* Visual Donut-style display */}
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const total = activities.length
                  let cumulative = 0
                  const segments = Object.entries(statusData).map(([status, count]) => {
                    const pct = (count / total) * 100
                    const dasharray = `${pct} ${100 - pct}`
                    const offset = -cumulative
                    cumulative += pct
                    return (
                      <circle
                        key={status}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke={statusColorMap[status] || '#9ca3af'}
                        strokeWidth="3"
                        strokeDasharray={dasharray}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    )
                  })
                  return segments
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{activities.length}</p>
                  <p className="text-[9px] text-gray-500 uppercase">Total</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {Object.entries(statusData).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColorMap[status] || '#9ca3af' }}
                    />
                    <span className="text-sm text-gray-700">
                      {statusLabelMap[status] || status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((count / activities.length) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">By Department</h3>
          </div>
          <div className="space-y-3">
            {departmentData.map(([dept, count], i) => (
              <div key={dept}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{dept}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxDepartment) * 100}%`,
                      backgroundColor: deptColors[i % deptColors.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Employees */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiUsers className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Employee Activity Count</h3>
          </div>
          <div className="space-y-2.5">
            {employeeData.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-gray-700 truncate">{name}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-2">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxEmployee) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">BSC Category Distribution</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryData.map(([cat, count]) => (
              <div
                key={cat}
                className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-700">{cat}</span>
                <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
