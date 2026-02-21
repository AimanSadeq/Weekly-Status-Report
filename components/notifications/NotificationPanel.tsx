// components/notifications/NotificationPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { FiBell, FiCheck, FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  activity_submitted: { icon: FiCheckCircle, color: 'text-blue-500 bg-blue-50' },
  activity_reviewed: { icon: FiCheckCircle, color: 'text-green-500 bg-green-50' },
  needs_clarification: { icon: FiAlertCircle, color: 'text-amber-500 bg-amber-50' },
  reminder: { icon: FiBell, color: 'text-purple-500 bg-purple-50' },
  default: { icon: FiInfo, color: 'text-gray-500 bg-gray-50' }
}

export default function NotificationPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [userId])

  async function loadNotifications() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      setNotifications(data)
    }
    setIsLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function dismissNotification(id: string) {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBell className="w-4 h-4 text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <FiCheck className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-6 flex justify-center">
          <div className="w-6 h-6 spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiBell className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.default
            const TypeIcon = config.icon

            return (
              <div
                key={notification.id}
                className={`px-4 sm:px-6 py-3 hover:bg-gray-50/50 transition-colors relative group ${
                  !notification.is_read ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(notification.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded"
                      >
                        <FiX className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
