// components/layout/DashboardHeader.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/utils'
import toast from 'react-hot-toast'
import { FiActivity, FiUser, FiLogOut, FiChevronDown, FiBell } from 'react-icons/fi'

export default function DashboardHeader({ user }: { user: any }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/auth/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const initials = user?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FiActivity className="text-white w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-tight">VIF Tracker</span>
              <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                {user?.is_admin ? 'Admin Dashboard' : 'Employee Dashboard'}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                user?.is_admin
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/20'
              }`}>
                {user?.is_admin ? 'Admin' : 'Employee'}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 py-1.5 px-2 sm:px-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-tight truncate max-w-[140px]">
                    {user?.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                    {user?.email}
                  </p>
                </div>
                <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        // Navigate to profile if needed
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
