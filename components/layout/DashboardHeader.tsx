// components/layout/DashboardHeader.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/utils'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { FiBell, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DashboardHeader({ user }: { user: any }) {
  const router = useRouter()
  const { unreadCount } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      router.push('/auth/login')
    }
  }

  const primaryDepartment = user.departments?.find((d: any) => d.is_primary)

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / App Name */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              VIF Training
            </h1>
            <span className="hidden sm:block ml-3 text-sm text-muted-foreground">
              Activity Tracker
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-gray-500 text-xs">
                  {user.is_admin ? 'Admin' : primaryDepartment?.departments?.name || 'Employee'}
                </p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <FiLogOut className="h-4 w-4 mr-1" />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-md"
          >
            {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t pt-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full text-sm font-medium">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-gray-500 text-sm">
                  {user.is_admin ? 'Admin' : primaryDepartment?.departments?.name || 'Employee'}
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="ml-auto badge badge-danger">{unreadCount} new</span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 py-2 px-4 rounded-md border hover:bg-gray-50 transition-colors"
            >
              <FiLogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
