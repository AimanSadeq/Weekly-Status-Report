// components/activities/ActivityReviewList.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { FiCheck, FiAlertCircle, FiMessageSquare, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

type Activity = {
  id: string
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  status: string
  bsc_category: string
  submitted_at: string
  employees: { full_name: string; email: string } | null
  activity_types: { name: string; is_mandatory: boolean; category: string } | null
  departments: { name: string } | null
  activity_feedback: Array<{
    id: string
    comment: string
    is_admin_comment: boolean
    created_at: string
    commenter_id: string
  }>
}

type ActivityReviewListProps = {
  activities: Activity[]
  onRefresh: () => void
  isLoading: boolean
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted':
      return <span className="badge badge-warning">Pending</span>
    case 'reviewed':
      return <span className="badge badge-success">Reviewed</span>
    case 'needs_clarification':
      return <span className="badge badge-danger">Clarification</span>
    default:
      return <span className="badge badge-default">{status}</span>
  }
}

export default function ActivityReviewList({ activities, onRefresh, isLoading }: ActivityReviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  const handleReview = async (activityId: string, newStatus: 'reviewed' | 'needs_clarification') => {
    if (newStatus === 'needs_clarification' && !feedbackText.trim()) {
      toast.error('Please provide feedback when requesting clarification')
      return
    }

    setActionLoading(activityId)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update activity status
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', activityId)

      if (updateError) {
        toast.error('Failed to update activity')
        return
      }

      // Add feedback comment if provided
      if (feedbackText.trim()) {
        await supabase
          .from('activity_feedback')
          .insert({
            activity_id: activityId,
            commenter_id: user?.id,
            comment: feedbackText.trim(),
            is_admin_comment: true,
          })
      }

      // Notify employee
      const activity = activities.find(a => a.id === activityId)
      if (activity) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: activity.id, // will be resolved by employee_id from activity
            type: newStatus === 'reviewed' ? 'admin_feedback' : 'admin_feedback',
            title: newStatus === 'reviewed' ? 'Activity Reviewed' : 'Clarification Requested',
            message: newStatus === 'reviewed'
              ? `Your activity "${activity.activity_types?.name}" has been reviewed.`
              : `Clarification requested for "${activity.activity_types?.name}": ${feedbackText}`,
            related_activity_id: activityId,
          })
      }

      toast.success(
        newStatus === 'reviewed' ? 'Activity marked as reviewed' : 'Clarification requested'
      )
      setFeedbackText('')
      setExpandedId(null)
      onRefresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
        <p className="text-center text-gray-500 mt-4 text-sm">Loading activities...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <FiCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Activities to Review</h3>
        <p className="text-gray-500 text-sm">
          All activities for the selected period have been reviewed, or none have been submitted yet.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {activities.map((activity) => {
        const isExpanded = expandedId === activity.id
        const isPending = activity.status === 'submitted'
        const hasFeedback = activity.activity_feedback?.length > 0

        return (
          <div key={activity.id} className="py-4">
            {/* Activity Row */}
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <FiUser className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">
                    {activity.employees?.full_name || 'Unknown'}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-sm text-gray-600">
                    {activity.activity_types?.name}
                  </span>
                  {getStatusBadge(activity.status)}
                  {activity.activity_types?.is_mandatory && (
                    <span className="badge badge-default text-xs">Mandatory</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate ml-6">{activity.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 ml-6">
                  <span>{format(new Date(activity.report_date), 'MMM dd, yyyy')}</span>
                  <span>{activity.departments?.name}</span>
                  {activity.units_completed > 0 && <span>{activity.units_completed} units</span>}
                  <span>{activity.percentage_complete || 0}%</span>
                  {activity.bsc_category && <span>{activity.bsc_category}</span>}
                  {hasFeedback && (
                    <span className="flex items-center text-primary">
                      <FiMessageSquare className="mr-1 h-3 w-3" />
                      {activity.activity_feedback.length}
                    </span>
                  )}
                </div>
              </div>
              <button className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                {isExpanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {/* Expanded Review Panel */}
            {isExpanded && (
              <div className="mt-4 ml-6 space-y-4">
                {/* Full Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                  <div className="flex gap-6 mt-3 text-sm text-gray-500">
                    <span>Units: <strong>{activity.units_completed || 0}</strong></span>
                    <span>Progress: <strong>{activity.percentage_complete || 0}%</strong></span>
                    <span>Category: <strong>{activity.bsc_category || 'N/A'}</strong></span>
                    {activity.submitted_at && (
                      <span>Submitted: <strong>{format(new Date(activity.submitted_at), 'MMM dd, h:mm a')}</strong></span>
                    )}
                  </div>
                </div>

                {/* Existing Feedback */}
                {hasFeedback && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Feedback History</h4>
                    {activity.activity_feedback.map((fb) => (
                      <div
                        key={fb.id}
                        className={`rounded-lg p-3 text-sm ${
                          fb.is_admin_comment
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-xs">
                            {fb.is_admin_comment ? 'Admin' : activity.employees?.full_name || 'Employee'}
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

                {/* Admin Actions */}
                {isPending && (
                  <div className="space-y-3">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Add feedback or notes (required for clarification requests)..."
                      rows={2}
                      className="input-field"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReview(activity.id, 'reviewed')
                        }}
                        disabled={actionLoading === activity.id}
                        className="btn-primary flex items-center text-sm"
                      >
                        <FiCheck className="mr-1 h-4 w-4" />
                        {actionLoading === activity.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReview(activity.id, 'needs_clarification')
                        }}
                        disabled={actionLoading === activity.id}
                        className="btn-outline flex items-center text-sm text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <FiAlertCircle className="mr-1 h-4 w-4" />
                        Request Clarification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
