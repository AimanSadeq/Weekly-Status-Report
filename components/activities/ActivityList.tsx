// components/activities/ActivityList.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { FiMessageSquare, FiCalendar, FiChevronDown, FiChevronUp, FiTag } from 'react-icons/fi'
import toast from 'react-hot-toast'

type Activity = {
  id: string
  report_date: string
  description: string
  units_completed: number
  percentage_complete: number
  status: string
  bsc_category: string
  activity_types: { name: string } | null
  departments: { name: string } | null
  activity_feedback: Array<{
    id: string
    comment: string
    is_admin_comment: boolean
    created_at: string
  }>
}

type ActivityListProps = {
  activities: Activity[]
  onRefresh: () => void
  isEmployee: boolean
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted':
      return <span className="badge badge-warning">Pending Review</span>
    case 'reviewed':
      return <span className="badge badge-success">Reviewed</span>
    case 'needs_clarification':
      return <span className="badge badge-danger">Needs Clarification</span>
    case 'draft':
      return <span className="badge badge-default">Draft</span>
    default:
      return <span className="badge badge-default">{status}</span>
  }
}

export default function ActivityList({ activities, onRefresh, isEmployee }: ActivityListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const supabase = createClient()

  const handleReply = async (activityId: string) => {
    if (!replyText.trim()) return

    setIsReplying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('activity_feedback')
        .insert({
          activity_id: activityId,
          commenter_id: user?.id,
          comment: replyText.trim(),
          is_admin_comment: false,
        })

      if (error) {
        toast.error('Failed to send reply')
      } else {
        toast.success('Reply sent')
        setReplyText('')
        onRefresh()
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsReplying(false)
    }
  }

  if (activities.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Activities Yet</h3>
        <p className="text-gray-500 text-sm">
          {isEmployee
            ? 'Start by adding your first activity for this week.'
            : 'No activities found for the selected period.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">
          Activities ({activities.length})
        </h2>
      </div>

      <div className="divide-y">
        {activities.map((activity) => {
          const isExpanded = expandedId === activity.id
          const hasFeedback = activity.activity_feedback?.length > 0
          const needsClarification = activity.status === 'needs_clarification'

          return (
            <div
              key={activity.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${needsClarification ? 'bg-red-50/50' : ''}`}
            >
              {/* Activity Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">
                      {activity.activity_types?.name || 'Unknown Type'}
                    </span>
                    {getStatusBadge(activity.status)}
                    {activity.bsc_category && (
                      <span className="badge badge-default">
                        <FiTag className="mr-1 h-3 w-3" />
                        {activity.bsc_category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center">
                      <FiCalendar className="mr-1 h-3 w-3" />
                      {format(new Date(activity.report_date), 'MMM dd, yyyy')}
                    </span>
                    <span>{activity.departments?.name}</span>
                    {activity.units_completed > 0 && (
                      <span>{activity.units_completed} units</span>
                    )}
                    {activity.percentage_complete > 0 && (
                      <span>{activity.percentage_complete}% complete</span>
                    )}
                    {hasFeedback && (
                      <span className="flex items-center text-primary">
                        <FiMessageSquare className="mr-1 h-3 w-3" />
                        {activity.activity_feedback.length} comment{activity.activity_feedback.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                  {isExpanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Full Description */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                    <div className="flex gap-6 mt-2 text-sm text-gray-500">
                      <span>Units: <strong>{activity.units_completed || 0}</strong></span>
                      <span>Progress: <strong>{activity.percentage_complete || 0}%</strong></span>
                    </div>
                  </div>

                  {/* Feedback / Comments */}
                  {hasFeedback && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                      {activity.activity_feedback.map((feedback) => (
                        <div
                          key={feedback.id}
                          className={`rounded-lg p-3 text-sm ${
                            feedback.is_admin_comment
                              ? 'bg-blue-50 border border-blue-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-xs">
                              {feedback.is_admin_comment ? 'Admin' : 'You'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(feedback.created_at), 'MMM dd, h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-700">{feedback.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply (for clarification requests) */}
                  {isEmployee && needsClarification && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your clarification..."
                        className="input-field flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReply(activity.id)
                        }}
                      />
                      <button
                        onClick={() => handleReply(activity.id)}
                        disabled={isReplying || !replyText.trim()}
                        className="btn-primary text-sm"
                      >
                        {isReplying ? 'Sending...' : 'Reply'}
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
