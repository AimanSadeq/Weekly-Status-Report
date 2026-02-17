// components/analytics/AnalyticsChart.tsx
'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { FiTrendingUp, FiBarChart2, FiPieChart } from 'react-icons/fi'

type Activity = {
  id: string
  status: string
  bsc_category: string
  department_id: string
  employee_id: string
  units_completed: number
  percentage_complete: number
  employees: { full_name: string; email: string } | null
  activity_types: { name: string; is_mandatory: boolean; category: string } | null
  departments: { name: string } | null
}

type AnalyticsChartProps = {
  activities: Activity[]
  employees: any[]
  departments: any[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function AnalyticsChart({ activities, employees, departments }: AnalyticsChartProps) {
  // Activities by department
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach((a) => {
      const dept = a.departments?.name || 'Unknown'
      counts[dept] = (counts[dept] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [activities])

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach((a) => {
      const label = a.status === 'submitted' ? 'Pending' : a.status === 'reviewed' ? 'Reviewed' : a.status === 'needs_clarification' ? 'Needs Clarification' : a.status
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [activities])

  // Activities per employee
  const employeeData = useMemo(() => {
    const counts: Record<string, { name: string; submitted: number; reviewed: number; clarification: number }> = {}
    activities.forEach((a) => {
      const name = a.employees?.full_name || 'Unknown'
      if (!counts[name]) {
        counts[name] = { name, submitted: 0, reviewed: 0, clarification: 0 }
      }
      if (a.status === 'submitted') counts[name].submitted++
      else if (a.status === 'reviewed') counts[name].reviewed++
      else if (a.status === 'needs_clarification') counts[name].clarification++
    })
    return Object.values(counts).sort((a, b) =>
      (b.submitted + b.reviewed + b.clarification) - (a.submitted + a.reviewed + a.clarification)
    )
  }, [activities])

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach((a) => {
      const cat = a.bsc_category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [activities])

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <FiTrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
        <p className="text-gray-500 text-sm">
          There are no activities for the selected period to generate analytics.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{activities.length}</p>
          <p className="text-sm text-blue-600">Total Activities</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">
            {new Set(activities.map((a) => a.employee_id)).size}
          </p>
          <p className="text-sm text-green-600">Active Employees</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {activities.reduce((sum, a) => sum + (a.units_completed || 0), 0)}
          </p>
          <p className="text-sm text-purple-600">Total Units</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">
            {activities.length > 0
              ? Math.round(activities.reduce((sum, a) => sum + (a.percentage_complete || 0), 0) / activities.length)
              : 0}%
          </p>
          <p className="text-sm text-orange-600">Avg. Completion</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities by Employee */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4" />
            Activities by Employee
          </h3>
          <div className="bg-gray-50 rounded-lg p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviewed" stackId="a" fill="#10B981" name="Reviewed" />
                <Bar dataKey="submitted" stackId="a" fill="#F59E0B" name="Pending" />
                <Bar dataKey="clarification" stackId="a" fill="#EF4444" name="Clarification" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiPieChart className="h-4 w-4" />
            Status Distribution
          </h3>
          <div className="bg-gray-50 rounded-lg p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activities by Department */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4" />
            Activities by Department
          </h3>
          <div className="bg-gray-50 rounded-lg p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Activities" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiPieChart className="h-4 w-4" />
            Category Breakdown
          </h3>
          <div className="bg-gray-50 rounded-lg p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
