// components/notifications/NotificationPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { FiBell, FiCheck, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_activity_id: string | null
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'activity_submitted':
      return <FiInfo className="h-4 w-4 text-blue-500" />
    case 'admin_feedback':
      return <FiCheckCircle className="h-4 w-4 text-green-500" />
    case 'submission_reminder':
      return <FiAlertCircle className="h-4 w-4 text-yellow-500" />
    default:
      return <FiBell className="h-4 w-4 text-gray-500" />
  }
}

export default function NotificationPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  async function loadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data && !error) {
      setNotifications(data)
    }
    setIsLoading(false)
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="card">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBell className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge badge-warning">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary hover:underline flex items-center"
          >
            <FiCheck className="mr-1 h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <FiBell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id)
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notification.created_at), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
