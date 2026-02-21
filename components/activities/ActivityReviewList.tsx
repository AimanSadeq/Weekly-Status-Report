// components/activities/ActivityReviewList.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  FiCheckCircle, FiAlertTriangle, FiMessageSquare,
  FiChevronDown, FiChevronUp, FiSend, FiUser,
  FiCalendar, FiClock
} from 'react-icons/fi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Activity = {
  id: string
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  status: string
  bsc_category?: string
  submitted_at?: string
  employees?: { full_name: string; email: string }
  activity_types?: { name: string; is_mandatory: boolean; category?: string }
  departments?: { name: string }
  activity_feedback?: Array<{
    id: string
    comment: string
    is_admin_comment: boolean
    created_at: string
    commenter_id?: string
  }>
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewed: 'bg-green-50 text-green-700 border-green-200',
  needs_clarification: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function ActivityReviewList({
  activities,
  onRefresh,
  isLoading,
}: {
  activities: Activity[]
  onRefresh: () => void
  isLoading: boolean
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleReview = async (activityId: string, status: 'reviewed' | 'needs_clarification') => {
    setProcessingId(activityId)
    try {
      const updates: any = {
        status,
        reviewed_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', activityId)

      if (error) {
        toast.error('Failed to update activity')
        return
      }

      // Add feedback if provided
      const comment = feedbackText[activityId]?.trim()
      if (comment) {
        await supabase
          .from('activity_feedback')
          .insert({
            activity_id: activityId,
            comment,
            is_admin_comment: true,
          })
        setFeedbackText(prev => ({ ...prev, [activityId]: '' }))
      }

      // Notify employee
      const activity = activities.find(a => a.id === activityId)
      if (activity) {
        await supabase.from('notifications').insert({
          recipient_id: activityId, // This should be the employee id from the activity
          type: status === 'reviewed' ? 'activity_reviewed' : 'needs_clarification',
          title: status === 'reviewed' ? 'Activity Reviewed' : 'Clarification Needed',
          message: status === 'reviewed'
            ? `Your activity "${activity.activity_types?.name}" has been reviewed and approved.`
            : `Your activity "${activity.activity_types?.name}" needs clarification. Please check the feedback.`,
        })
      }

      toast.success(status === 'reviewed' ? 'Activity approved' : 'Clarification requested')
      onRefresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleSendFeedback = async (activityId: string) => {
    const comment = feedbackText[activityId]?.trim()
    if (!comment) return

    try {
      await supabase
        .from('activity_feedback')
        .insert({
          activity_id: activityId,
          comment,
          is_admin_comment: true,
        })

      setFeedbackText(prev => ({ ...prev, [activityId]: '' }))
      toast.success('Feedback sent')
      onRefresh()
    } catch {
      toast.error('Failed to send feedback')
    }
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
        <p className="text-center text-sm text-gray-500 mt-3">Loading activities...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No activities to review</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          There are no submitted activities for the selected filters and time period.
        </p>
      </div>
    )
  }

  // Group activities by employee
  const groupedActivities = activities.reduce((groups: Record<string, Activity[]>, activity) => {
    const key = activity.employees?.full_name || 'Unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(activity)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([employeeName, employeeActivities]) => (
        <div key={employeeName} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Employee Header */}
          <div className="bg-gray-50 px-4 sm:px-5 py-3 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{employeeName}</p>
                <p className="text-xs text-gray-500">
                  {employeeActivities[0]?.employees?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {employeeActivities.length} activit{employeeActivities.length === 1 ? 'y' : 'ies'}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                employeeActivities.every(a => a.status === 'reviewed')
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {employeeActivities.filter(a => a.status === 'reviewed').length}/{employeeActivities.length} reviewed
              </span>
            </div>
          </div>

          {/* Activities */}
          <div className="divide-y divide-gray-100">
            {employeeActivities.map((activity) => {
              const isExpanded = expandedId === activity.id
              const isProcessing = processingId === activity.id
              const feedbackCount = activity.activity_feedback?.length || 0

              return (
                <div key={activity.id}>
                  <div
                    className="px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {activity.activity_types?.name || 'Activity'}
                          </span>
                          {activity.activity_types?.is_mandatory && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                              Required
                            </span>
                          )}
                          {activity.departments?.name && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {activity.departments.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{activity.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {format(new Date(activity.report_date), 'MMM dd')}
                          </span>
                          <span>{activity.percentage_complete || 0}% complete</span>
                          {feedbackCount > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <FiMessageSquare className="w-3 h-3" />
                              {feedbackCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColors[activity.status] || statusColors.submitted}`}>
                          {activity.status === 'needs_clarification' ? 'Needs Info' : activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                        {isExpanded ? (
                          <FiChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Review Panel */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 space-y-4 border-t border-gray-100 bg-gray-50/30">
                      {/* Details Grid */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-3">
                        <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[60px]">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(activity.percentage_complete || 0, 100)}%` }}
                                />
                              </div>
                              <span className="font-medium text-gray-900 text-xs">
                                {activity.percentage_complete || 0}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs block">Category</span>
                            <span className="font-medium text-gray-900">
                              {activity.bsc_category || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback Thread */}
                      {feedbackCount > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments</h4>
                          <div className="space-y-2">
                            {activity.activity_feedback?.map((fb) => (
                              <div
                                key={fb.id}
                                className={`rounded-lg p-3 text-sm ${
                                  fb.is_admin_comment
                                    ? 'bg-indigo-50 border border-indigo-100 ml-4'
                                    : 'bg-white border border-gray-200 mr-4'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-medium ${
                                    fb.is_admin_comment ? 'text-indigo-600' : 'text-gray-600'
                                  }`}>
                                    {fb.is_admin_comment ? 'You (Admin)' : activity.employees?.full_name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {format(new Date(fb.created_at), 'MMM dd, h:mm a')}
                                  </span>
                                </div>
                                <p className="text-gray-700">{fb.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackText[activity.id] || ''}
                          onChange={(e) => setFeedbackText(prev => ({ ...prev, [activity.id]: e.target.value }))}
                          placeholder="Add feedback or comment..."
                          className="input-field flex-1 h-10 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendFeedback(activity.id)
                          }}
                          disabled={!feedbackText[activity.id]?.trim()}
                          className="btn-outline h-10 px-3 disabled:opacity-40"
                        >
                          <FiSend className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Review Actions */}
                      {activity.status !== 'reviewed' && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReview(activity.id, 'reviewed')
                            }}
                            disabled={isProcessing}
                            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            {isProcessing ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReview(activity.id, 'needs_clarification')
                            }}
                            disabled={isProcessing}
                            className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm text-amber-700 border-amber-300 hover:bg-amber-50"
                          >
                            <FiAlertTriangle className="w-4 h-4" />
                            Request Clarification
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
      ))}
    </div>
  )
}
