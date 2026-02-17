// components/admin/EmployeeStatusTable.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { FiCheckCircle, FiXCircle, FiSearch, FiUser } from 'react-icons/fi'

type Employee = {
  id: string
  full_name: string
  email: string
  is_active: boolean
  employee_departments: Array<{
    department_id: string
    is_primary: boolean
    departments: { id: string; name: string }
  }>
}

type EmployeeStatusTableProps = {
  employees: Employee[]
  selectedWeek: number
}

type EmployeeStatus = {
  employeeId: string
  activityCount: number
  hasSubmitted: boolean
  reviewedCount: number
  pendingCount: number
  clarificationCount: number
}

export default function EmployeeStatusTable({ employees, selectedWeek }: EmployeeStatusTableProps) {
  const [statuses, setStatuses] = useState<Record<string, EmployeeStatus>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadEmployeeStatuses()
  }, [employees, selectedWeek])

  async function loadEmployeeStatuses() {
    setIsLoading(true)

    const targetDate = subWeeks(new Date(), selectedWeek)
    const startDate = startOfWeek(targetDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(targetDate, { weekStartsOn: 1 })

    const { data, error } = await supabase
      .from('activities')
      .select('employee_id, status')
      .gte('report_date', format(startDate, 'yyyy-MM-dd'))
      .lte('report_date', format(endDate, 'yyyy-MM-dd'))

    if (data && !error) {
      const statusMap: Record<string, EmployeeStatus> = {}

      // Initialize all employees
      employees.forEach((emp) => {
        statusMap[emp.id] = {
          employeeId: emp.id,
          activityCount: 0,
          hasSubmitted: false,
          reviewedCount: 0,
          pendingCount: 0,
          clarificationCount: 0,
        }
      })

      // Aggregate activity data
      data.forEach((activity) => {
        if (statusMap[activity.employee_id]) {
          const s = statusMap[activity.employee_id]
          s.activityCount++
          s.hasSubmitted = true
          if (activity.status === 'reviewed') s.reviewedCount++
          else if (activity.status === 'submitted') s.pendingCount++
          else if (activity.status === 'needs_clarification') s.clarificationCount++
        }
      })

      setStatuses(statusMap)
    }
    setIsLoading(false)
  }

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const targetDate = subWeeks(new Date(), selectedWeek)
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })

  const submittedCount = filteredEmployees.filter((emp) => statuses[emp.id]?.hasSubmitted).length
  const notSubmittedCount = filteredEmployees.length - submittedCount

  return (
    <div className="space-y-4">
      {/* Week Info & Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="text-sm text-gray-600">
          Week: <strong>{format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</strong>
          <span className="ml-4">
            <span className="text-green-600 font-medium">{submittedCount} submitted</span>
            {' / '}
            <span className="text-red-600 font-medium">{notSubmittedCount} missing</span>
          </span>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Submitted</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Activities</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Reviewed</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Pending</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Clarification</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading employee statuses...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  <FiUser className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
                const status = statuses[employee.id]
                const primaryDept = employee.employee_departments?.find((d) => d.is_primary)

                return (
                  <tr
                    key={employee.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !status?.hasSubmitted ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 bg-gray-200 text-gray-600 rounded-full text-xs font-medium flex-shrink-0">
                          {employee.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.full_name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {primaryDept?.departments?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {status?.hasSubmitted ? (
                        <FiCheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <FiXCircle className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {status?.activityCount || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {status?.reviewedCount ? (
                        <span className="text-green-600 font-medium">{status.reviewedCount}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {status?.pendingCount ? (
                        <span className="text-yellow-600 font-medium">{status.pendingCount}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {status?.clarificationCount ? (
                        <span className="text-red-600 font-medium">{status.clarificationCount}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
