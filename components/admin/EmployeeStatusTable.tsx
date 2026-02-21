// components/admin/EmployeeStatusTable.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import {
  FiCheckCircle, FiXCircle, FiClock, FiUser,
  FiSearch, FiChevronDown, FiChevronUp
} from 'react-icons/fi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Employee = {
  id: string
  full_name: string
  email: string
  is_active: boolean
  employee_departments?: Array<{
    department_id: string
    is_primary: boolean
    departments: { id: string; name: string }
  }>
}

type EmployeeStatus = {
  employee: Employee
  activityCount: number
  reviewedCount: number
  pendingCount: number
  hasSubmitted: boolean
}

export default function EmployeeStatusTable({
  employees,
  selectedWeek,
}: {
  employees: Employee[]
  selectedWeek: number
}) {
  const [statuses, setStatuses] = useState<EmployeeStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'activities' | 'status'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const supabase = createClient()

  useEffect(() => {
    loadStatuses()
  }, [employees, selectedWeek])

  async function loadStatuses() {
    setIsLoading(true)

    const targetDate = subWeeks(new Date(), selectedWeek)
    const startDate = startOfWeek(targetDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(targetDate, { weekStartsOn: 1 })

    const { data: activities } = await supabase
      .from('activities')
      .select('employee_id, status')
      .gte('report_date', format(startDate, 'yyyy-MM-dd'))
      .lte('report_date', format(endDate, 'yyyy-MM-dd'))

    const activityMap: Record<string, { total: number; reviewed: number; pending: number }> = {}
    activities?.forEach((a: any) => {
      if (!activityMap[a.employee_id]) {
        activityMap[a.employee_id] = { total: 0, reviewed: 0, pending: 0 }
      }
      activityMap[a.employee_id].total++
      if (a.status === 'reviewed') activityMap[a.employee_id].reviewed++
      if (a.status === 'submitted') activityMap[a.employee_id].pending++
    })

    const results: EmployeeStatus[] = employees.map(emp => ({
      employee: emp,
      activityCount: activityMap[emp.id]?.total || 0,
      reviewedCount: activityMap[emp.id]?.reviewed || 0,
      pendingCount: activityMap[emp.id]?.pending || 0,
      hasSubmitted: (activityMap[emp.id]?.total || 0) > 0,
    }))

    setStatuses(results)
    setIsLoading(false)
  }

  const handleSort = (field: 'name' | 'activities' | 'status') => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const filteredStatuses = statuses
    .filter(s =>
      s.employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'name':
          return a.employee.full_name.localeCompare(b.employee.full_name) * dir
        case 'activities':
          return (a.activityCount - b.activityCount) * dir
        case 'status':
          return (Number(a.hasSubmitted) - Number(b.hasSubmitted)) * dir
        default:
          return 0
      }
    })

  const submittedCount = statuses.filter(s => s.hasSubmitted).length
  const totalEmployees = statuses.length

  const targetDate = subWeeks(new Date(), selectedWeek)
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
        <p className="text-center text-sm text-gray-500 mt-3">Loading employee status...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {submittedCount} of {totalEmployees} employees have submitted activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">{submittedCount} Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-gray-600">{totalEmployees - submittedCount} Missing</span>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${totalEmployees > 0 ? (submittedCount / totalEmployees) * 100 : 0}%` }}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees..."
          className="input-field pl-10 h-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-5 py-3 grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <button
            className="col-span-5 sm:col-span-4 flex items-center gap-1 hover:text-gray-700"
            onClick={() => handleSort('name')}
          >
            Employee
            {sortBy === 'name' && (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />)}
          </button>
          <div className="col-span-3 sm:col-span-3 hidden sm:block">Department</div>
          <button
            className="col-span-3 sm:col-span-2 flex items-center gap-1 hover:text-gray-700"
            onClick={() => handleSort('activities')}
          >
            Activities
            {sortBy === 'activities' && (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />)}
          </button>
          <div className="col-span-2 hidden sm:block">Progress</div>
          <button
            className="col-span-4 sm:col-span-1 flex items-center gap-1 hover:text-gray-700 justify-end"
            onClick={() => handleSort('status')}
          >
            Status
            {sortBy === 'status' && (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />)}
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {filteredStatuses.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              No employees found matching your search.
            </div>
          ) : (
            filteredStatuses.map((status) => {
              const primaryDept = status.employee.employee_departments?.find(d => d.is_primary)
              const initials = status.employee.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={status.employee.id}
                  className={`px-4 sm:px-5 py-3 grid grid-cols-12 gap-3 items-center hover:bg-gray-50/50 transition-colors ${
                    !status.hasSubmitted ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Employee */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      status.hasSubmitted
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{status.employee.full_name}</p>
                      <p className="text-xs text-gray-500 truncate hidden sm:block">{status.employee.email}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-3 hidden sm:block">
                    {primaryDept ? (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {primaryDept.departments.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Activity Count */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{status.activityCount}</span>
                      {status.reviewedCount > 0 && (
                        <span className="text-[10px] text-green-600">
                          ({status.reviewedCount} reviewed)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="col-span-2 hidden sm:block">
                    {status.activityCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${(status.reviewedCount / status.activityCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {Math.round((status.reviewedCount / status.activityCount) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-4 sm:col-span-1 flex justify-end">
                    {status.hasSubmitted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Done</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiXCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Missing</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
