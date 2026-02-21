// components/dashboard/AdminDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { 
  FiUsers, FiActivity, FiCheckCircle, FiAlertCircle, 
  FiDownload, FiFilter, FiCalendar, FiTrendingUp 
} from 'react-icons/fi'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ActivityReviewList from '@/components/activities/ActivityReviewList'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import EmployeeStatusTable from '@/components/admin/EmployeeStatusTable'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export default function AdminDashboard({ user }: { user: any }) {
  const [activities, setActivities] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalActivities: 0,
    pendingReview: 0,
    reviewed: 0,
    needsClarification: 0
  })
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, 1 = last week, etc.
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'review' | 'analytics' | 'employees'>('review')

  const supabase = createClient()

  useEffect(() => {
    loadDepartments()
    loadEmployees()
  }, [])

  useEffect(() => {
    loadActivities()
    loadStats()
  }, [selectedWeek, selectedDepartment, selectedEmployee])

  async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (data && !error) {
      setDepartments(data)
    }
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        employee_departments (
          department_id,
          is_primary,
          departments (
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .eq('is_admin', false)
      .order('full_name')

    if (data && !error) {
      setEmployees(data)
    }
  }

  async function loadActivities() {
    setIsLoading(true)
    
    const targetDate = subWeeks(new Date(), selectedWeek)
    const startDate = startOfWeek(targetDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(targetDate, { weekStartsOn: 1 })

    let query = supabase
      .from('activities')
      .select(`
        *,
        employees (
          full_name,
          email
        ),
        activity_types (
          name,
          is_mandatory,
          category
        ),
        departments (
          name
        ),
        activity_feedback (
          id,
          comment,
          is_admin_comment,
          created_at,
          commenter_id
        )
      `)
      .gte('report_date', format(startDate, 'yyyy-MM-dd'))
      .lte('report_date', format(endDate, 'yyyy-MM-dd'))
      .order('report_date', { ascending: false })

    if (selectedDepartment !== 'all') {
      query = query.eq('department_id', selectedDepartment)
    }

    if (selectedEmployee !== 'all') {
      query = query.eq('employee_id', selectedEmployee)
    }

    const { data, error } = await query

    if (data && !error) {
      setActivities(data)
    }
    setIsLoading(false)
  }

  async function loadStats() {
    const targetDate = subWeeks(new Date(), selectedWeek)
    const startDate = startOfWeek(targetDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(targetDate, { weekStartsOn: 1 })

    let query = supabase
      .from('activities')
      .select('status', { count: 'exact' })
      .gte('report_date', format(startDate, 'yyyy-MM-dd'))
      .lte('report_date', format(endDate, 'yyyy-MM-dd'))

    if (selectedDepartment !== 'all') {
      query = query.eq('department_id', selectedDepartment)
    }

    if (selectedEmployee !== 'all') {
      query = query.eq('employee_id', selectedEmployee)
    }

    const { data, count } = await query

    if (data) {
      const statusCounts = data.reduce((acc: any, activity: any) => {
        acc[activity.status] = (acc[activity.status] || 0) + 1
        return acc
      }, {})

      setStats({
        totalActivities: count || 0,
        pendingReview: statusCounts['submitted'] || 0,
        reviewed: statusCounts['reviewed'] || 0,
        needsClarification: statusCounts['needs_clarification'] || 0
      })
    }
  }

  async function handleExport() {
    try {
      // Prepare data for export
      const exportData = activities.map(activity => ({
        'Employee': activity.employees?.full_name,
        'Email': activity.employees?.email,
        'Department': activity.departments?.name,
        'Report Date': format(new Date(activity.report_date), 'yyyy-MM-dd'),
        'Activity Type': activity.activity_types?.name,
        'Description': activity.description,
        'Units Completed': activity.units_completed,
        'Percentage Complete': activity.percentage_complete,
        'BSC Category': activity.bsc_category,
        'Status': activity.status,
        'Submitted At': activity.submitted_at ? format(new Date(activity.submitted_at), 'yyyy-MM-dd HH:mm') : '',
        'Reviewed At': activity.reviewed_at ? format(new Date(activity.reviewed_at), 'yyyy-MM-dd HH:mm') : ''
      }))

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Activities')

      // Generate filename
      const filename = `activities_week${selectedWeek ? `-${selectedWeek}` : ''}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      // Download file
      XLSX.writeFile(wb, filename)
      toast.success('Activities exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export activities')
    }
  }

  return (
    <div>
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Activities</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalActivities}</p>
              </div>
              <FiActivity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </div>

          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending Review</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
              </div>
              <FiAlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </div>

          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Reviewed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.reviewed}</p>
              </div>
              <FiCheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </div>

          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Needs Clarification</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.needsClarification}</p>
              </div>
              <FiUsers className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <span className="font-medium text-sm sm:text-base">Filters:</span>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-4 flex-1">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="select-field sm:w-auto"
              >
                <option value={0}>Current Week</option>
                <option value={1}>Last Week</option>
                <option value={2}>2 Weeks Ago</option>
                <option value={3}>3 Weeks Ago</option>
                <option value={4}>4 Weeks Ago</option>
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="select-field sm:w-auto"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="select-field sm:w-auto"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExport}
              className="btn-outline sm:ml-auto flex items-center justify-center w-full sm:w-auto"
            >
              <FiDownload className="mr-2" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b overflow-x-auto -mx-px">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('review')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'review'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Review Activities
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'employees'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employee Status
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'review' && (
              <ActivityReviewList
                activities={activities}
                onRefresh={loadActivities}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsChart
                activities={activities}
                employees={employees}
                departments={departments}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeStatusTable
                employees={employees}
                selectedWeek={selectedWeek}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
