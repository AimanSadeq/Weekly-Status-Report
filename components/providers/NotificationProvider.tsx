// components/providers/NotificationProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

type NotificationContextType = {
  unreadCount: number
  refresh: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refresh: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchUnreadCount = async () => {
    if (!user) return

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()

      // Subscribe to notification changes
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
