// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/utils'
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <LoadingSpinner />
        <p className="text-sm text-gray-500">Loading your dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.is_admin ? (
        <AdminDashboard user={user} />
      ) : (
        <EmployeeDashboard user={user} />
      )}
    </div>
  )
}
