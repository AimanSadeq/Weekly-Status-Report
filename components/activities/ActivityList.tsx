// components/activities/ActivityList.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle,
  FiMessageSquare, FiChevronDown, FiChevronUp, FiEdit3,
  FiTrash2, FiRefreshCw
} from 'react-icons/fi'

type Activity = {
  id: string
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  status: string
  bsc_category?: string
  submitted_at?: string
  activity_types?: { name: string }
  departments?: { name: string }
  activity_feedback?: Array<{
    id: string
    comment: string
    is_admin_comment: boolean
    created_at: string
  }>
}

const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
  submitted: {
    label: 'Submitted',
    icon: FiClock,
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  reviewed: {
    label: 'Reviewed',
    icon: FiCheckCircle,
    classes: 'bg-green-50 text-green-700 border-green-200'
  },
  needs_clarification: {
    label: 'Needs Clarification',
    icon: FiAlertTriangle,
    classes: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  draft: {
    label: 'Draft',
    icon: FiEdit3,
    classes: 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export default function ActivityList({
  activities,
  onRefresh,
  isEmployee = false
}: {
  activities: Activity[]
  onRefresh: () => void
  isEmployee?: boolean
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Failed to delete activity')
      } else {
        toast.success('Activity deleted')
        onRefresh()
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No activities this week</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {isEmployee
              ? 'Start by adding your first activity for this week using the button above.'
              : 'No activities have been submitted for the selected period.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Activities
          <span className="ml-2 text-sm font-normal text-gray-500">({activities.length})</span>
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const status = statusConfig[activity.status] || statusConfig.submitted
          const StatusIcon = status.icon
          const isExpanded = expandedId === activity.id
          const feedbackCount = activity.activity_feedback?.length || 0

          return (
            <div key={activity.id} className="hover:bg-gray-50/50 transition-colors">
              <div
                className="px-4 sm:px-6 py-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {activity.activity_types?.name || 'Activity'}
                      </span>
                      {activity.departments?.name && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {activity.departments.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {format(new Date(activity.report_date), 'MMM dd, yyyy')}
                      </span>
                      {activity.units_completed > 0 && (
                        <span>{activity.units_completed} units</span>
                      )}
                      {feedbackCount > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <FiMessageSquare className="w-3 h-3" />
                          {feedbackCount} comment{feedbackCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Progress */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(activity.percentage_complete || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {activity.percentage_complete || 0}%
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.classes}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{status.label}</span>
                    </span>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-4 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-gray-500 text-xs block">Date</span>
                        <span className="font-medium text-gray-900">
                          {format(new Date(activity.report_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Units</span>
                        <span className="font-medium text-gray-900">
                          {activity.units_completed || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Progress</span>
                        <span className="font-medium text-gray-900">
                          {activity.percentage_complete || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Category</span>
                        <span className="font-medium text-gray-900">
                          {activity.bsc_category || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  {feedbackCount > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback</h4>
                      {activity.activity_feedback?.map((fb) => (
                        <div
                          key={fb.id}
                          className={`rounded-lg p-3 text-sm ${
                            fb.is_admin_comment
                              ? 'bg-indigo-50 border border-indigo-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              fb.is_admin_comment ? 'text-indigo-600' : 'text-gray-600'
                            }`}>
                              {fb.is_admin_comment ? 'Admin' : 'You'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(fb.created_at), 'MMM dd, h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-700">{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {isEmployee && activity.status !== 'reviewed' && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(activity.id)
                        }}
                        disabled={deletingId === activity.id}
                        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        {deletingId === activity.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
