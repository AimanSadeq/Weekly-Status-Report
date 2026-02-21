// components/dashboard/EmployeeDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { FiPlus, FiCalendar, FiCheckCircle, FiClock, FiBell } from 'react-icons/fi'
import ActivityList from '@/components/activities/ActivityList'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import DashboardHeader from '@/components/layout/DashboardHeader'

type ActivityFormData = {
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  activity_type_id: string
  department_id: string
  bsc_category: string
}

export default function EmployeeDashboard({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [activityTypes, setActivityTypes] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [filteredActivityTypes, setFilteredActivityTypes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [weeklyStatus, setWeeklyStatus] = useState<any>(null)
  
  const supabase = createClient()
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ActivityFormData>()
  
  const watchedDepartment = watch('department_id')
  const watchedActivityType = watch('activity_type_id')

  // Load initial data
  useEffect(() => {
    loadUserDepartments()
    loadActivities()
    loadWeeklyStatus()
  }, [])

  // Update activity types when department changes
  useEffect(() => {
    if (watchedDepartment) {
      loadActivityTypesForDepartment(watchedDepartment)
    }
  }, [watchedDepartment])

  // Update BSC category when activity type changes
  useEffect(() => {
    if (watchedActivityType) {
      const activityType = activityTypes.find(at => at.id === watchedActivityType)
      if (activityType) {
        setValue('bsc_category', activityType.category || 'Other')
      }
    }
  }, [watchedActivityType, activityTypes])

  async function loadUserDepartments() {
    const { data, error } = await supabase
      .from('employee_departments')
      .select(`
        department_id,
        is_primary,
        departments (
          id,
          name
        )
      `)
      .eq('employee_id', user.id)

    if (data && !error) {
      setDepartments(data.map((d: any) => d.departments))
      // Set default department to primary
      const primary = data.find((d: any) => d.is_primary)
      if (primary) {
        setSelectedDepartment(primary.departments.id)
        setValue('department_id', primary.departments.id)
      }
    }
  }

  async function loadActivityTypesForDepartment(departmentId: string) {
    const { data, error } = await supabase
      .from('department_activities')
      .select(`
        activity_types (
          id,
          name,
          is_mandatory,
          category
        )
      `)
      .eq('department_id', departmentId)
      .order('activity_types(name)')

    if (data && !error) {
      const types = data.map((d: any) => d.activity_types).filter(Boolean)
      setActivityTypes(types)
      setFilteredActivityTypes(types)
    }
  }

  async function loadActivities() {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
    const endDate = endOfWeek(new Date(), { weekStartsOn: 1 })

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_types (name),
        departments (name),
        activity_feedback (
          id,
          comment,
          is_admin_comment,
          created_at
        )
      `)
      .eq('employee_id', user.id)
      .gte('report_date', format(startDate, 'yyyy-MM-dd'))
      .lte('report_date', format(endDate, 'yyyy-MM-dd'))
      .order('report_date', { ascending: false })

    if (data && !error) {
      setActivities(data)
    }
  }

  async function loadWeeklyStatus() {
    const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)
    const currentYear = new Date().getFullYear()

    const { data, error } = await supabase
      .from('activities')
      .select('id')
      .eq('employee_id', user.id)
      .eq('week_number', currentWeek)
      .eq('year', currentYear)
      .eq('status', 'submitted')
      .limit(1)

    setWeeklyStatus({
      submitted: data && data.length > 0,
      week: currentWeek,
      year: currentYear
    })
  }

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          employee_id: user.id,
          ...data,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })

      if (error) {
        toast.error('Failed to submit activity')
        console.error(error)
      } else {
        toast.success('Activity submitted successfully!')
        reset()
        setShowForm(false)
        loadActivities()
        loadWeeklyStatus()
        
        // Notify admin
        await notifyAdmin(data.report_date)
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function notifyAdmin(reportDate: string) {
    // Get admin user
    const { data: adminData } = await supabase
      .from('employees')
      .select('id')
      .eq('is_admin', true)
      .single()

    if (adminData) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: adminData.id,
          type: 'activity_submitted',
          title: 'New Activity Report Submitted',
          message: `${user.full_name} has submitted an activity report for ${format(new Date(reportDate), 'MMM dd, yyyy')}`
        })
    }
  }

  return (
    <div>
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Weekly Status Banner */}
        <div className="mb-4 sm:mb-6">
          <div className={`card p-3 sm:p-4 ${weeklyStatus?.submitted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                {weeklyStatus?.submitted ? (
                  <>
                    <FiCheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-green-800 font-medium text-sm sm:text-base">
                      Weekly activities submitted for Week {weeklyStatus.week}
                    </span>
                  </>
                ) : (
                  <>
                    <FiClock className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <span className="text-yellow-800 font-medium text-sm sm:text-base">
                      Please submit your activities by Thursday EOD
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center w-full sm:w-auto justify-center"
              >
                <FiPlus className="mr-2" />
                Add Activity
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Form */}
            {showForm && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Activity</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Report Date
                      </label>
                      <input
                        {...register('report_date', { required: 'Date is required' })}
                        type="date"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="input-field"
                      />
                      {errors.report_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.report_date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        {...register('department_id', { required: 'Department is required' })}
                        className="select-field"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Type
                      </label>
                      <select
                        {...register('activity_type_id', { required: 'Activity type is required' })}
                        className="select-field"
                        disabled={!watchedDepartment}
                      >
                        <option value="">Select Activity Type</option>
                        {filteredActivityTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                            {type.is_mandatory && ' (Mandatory)'}
                          </option>
                        ))}
                      </select>
                      {errors.activity_type_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.activity_type_id.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BSC/Other Category
                      </label>
                      <input
                        {...register('bsc_category')}
                        type="text"
                        className="input-field"
                        readOnly
                        placeholder="Auto-filled based on activity"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description of Activity
                    </label>
                    <textarea
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' }
                      })}
                      rows={3}
                      className="input-field"
                      placeholder="Describe the activity in detail..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Units Completed (#)
                      </label>
                      <input
                        {...register('units_completed', { 
                          valueAsNumber: true,
                          min: { value: 0, message: 'Units must be 0 or greater' }
                        })}
                        type="number"
                        className="input-field"
                        placeholder="0"
                      />
                      {errors.units_completed && (
                        <p className="mt-1 text-sm text-red-600">{errors.units_completed.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Percentage Complete (%)
                      </label>
                      <input
                        {...register('percentage_complete', { 
                          valueAsNumber: true,
                          min: { value: 0, message: 'Must be between 0 and 100' },
                          max: { value: 100, message: 'Must be between 0 and 100' }
                        })}
                        type="number"
                        className="input-field"
                        placeholder="0"
                      />
                      {errors.percentage_complete && (
                        <p className="mt-1 text-sm text-red-600">{errors.percentage_complete.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        reset()
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Activity'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Activities List */}
            <ActivityList 
              activities={activities} 
              onRefresh={loadActivities}
              isEmployee={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NotificationPanel userId={user.id} />
            
            {/* Quick Stats */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">This Week's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Activities Submitted</span>
                  <span className="font-medium">{activities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Review</span>
                  <span className="font-medium">
                    {activities.filter(a => a.status === 'submitted').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Needs Clarification</span>
                  <span className="font-medium text-yellow-600">
                    {activities.filter(a => a.status === 'needs_clarification').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
