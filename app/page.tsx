// app/page.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/utils'
import {
  FiActivity, FiBarChart2, FiCheckCircle, FiClock,
  FiShield, FiUsers, FiArrowRight, FiZap
} from 'react-icons/fi'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push('/dashboard')
          return
        }
      } catch {
        // Not logged in, show landing
      }
      setChecking(false)
    }
    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-10 h-10 spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                <FiActivity className="text-white w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg tracking-tight">VIF Training</span>
                <span className="hidden sm:inline text-gray-400 text-sm ml-2 font-normal">Activity Tracker</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary text-sm px-5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
              <FiZap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Weekly Status Reporting Made Simple</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Track activities.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Measure progress.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Streamline your team's weekly activity reporting with an intuitive platform
              designed for VIF Training employees and administrators.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="btn-primary text-base px-8 py-3 min-h-[52px] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Start Tracking
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="btn-outline text-base px-8 py-3 min-h-[52px]"
              >
                Sign in to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need for activity tracking
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A complete solution for managing weekly status reports across departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FiActivity,
                title: 'Activity Submission',
                description: 'Submit daily activities with descriptions, units completed, and progress percentages. Track work across multiple departments.',
                color: 'blue'
              },
              {
                icon: FiCheckCircle,
                title: 'Admin Review',
                description: 'Administrators can review, approve, or request clarification on submitted activities with inline feedback.',
                color: 'green'
              },
              {
                icon: FiBarChart2,
                title: 'Analytics & Reports',
                description: 'Visual dashboards with charts showing submission trends, department breakdowns, and performance metrics.',
                color: 'purple'
              },
              {
                icon: FiUsers,
                title: 'Team Management',
                description: 'Monitor employee submission status, manage departments, and track who has completed their weekly reports.',
                color: 'orange'
              },
              {
                icon: FiClock,
                title: 'Deadline Tracking',
                description: 'Weekly submission reminders with clear status indicators showing whether activities are due or completed.',
                color: 'yellow'
              },
              {
                icon: FiShield,
                title: 'Secure & Reliable',
                description: 'Domain-restricted access for @viftraining.com employees with role-based permissions and data protection.',
                color: 'indigo'
              }
            ].map((feature) => {
              const colorMap: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600 border-blue-100',
                green: 'bg-green-50 text-green-600 border-green-100',
                purple: 'bg-purple-50 text-purple-600 border-purple-100',
                orange: 'bg-orange-50 text-orange-600 border-orange-100',
                yellow: 'bg-amber-50 text-amber-600 border-amber-100',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
              }

              return (
                <div
                  key={feature.title}
                  className="group relative card p-6 sm:p-8 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colorMap[feature.color]}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interface Preview */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Designed for clarity
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Two streamlined views tailored for employees and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Employee View Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Employee Dashboard</h3>
                  <p className="text-sm text-gray-500">Submit and track your activities</p>
                </div>
              </div>

              <div className="card overflow-hidden shadow-lg shadow-gray-200/50">
                {/* Mock header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <FiActivity className="text-white w-3.5 h-3.5" />
                    </div>
                    <span className="text-white text-sm font-medium">VIF Tracker</span>
                  </div>
                  <div className="w-7 h-7 bg-slate-700 rounded-full" />
                </div>

                {/* Mock status */}
                <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 w-4 h-4" />
                  <span className="text-green-800 text-sm font-medium">Weekly activities submitted</span>
                </div>

                {/* Mock activity items */}
                <div className="divide-y divide-gray-100">
                  {[
                    { type: 'Client Meeting', dept: 'Consultants', status: 'Reviewed', pct: 100 },
                    { type: 'Report Writing', dept: 'Consultants', status: 'Submitted', pct: 75 },
                    { type: 'Research Task', dept: 'Operations', status: 'Submitted', pct: 50 },
                  ].map((item, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.dept}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.status === 'Reviewed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin View Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                  <p className="text-sm text-gray-500">Review, analyze, and export</p>
                </div>
              </div>

              <div className="card overflow-hidden shadow-lg shadow-gray-200/50">
                {/* Mock header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <FiActivity className="text-white w-3.5 h-3.5" />
                    </div>
                    <span className="text-white text-sm font-medium">VIF Tracker</span>
                  </div>
                  <div className="w-7 h-7 bg-slate-700 rounded-full" />
                </div>

                {/* Mock stats */}
                <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                  {[
                    { label: 'Total', value: '24', color: 'text-gray-900' },
                    { label: 'Pending', value: '8', color: 'text-yellow-600' },
                    { label: 'Reviewed', value: '14', color: 'text-green-600' },
                    { label: 'Needs Info', value: '2', color: 'text-orange-600' },
                  ].map((stat, i) => (
                    <div key={i} className="px-3 py-3 text-center">
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mock chart area */}
                <div className="px-5 py-4">
                  <div className="flex items-end gap-1.5 h-20 justify-center">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-400 px-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                    <span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-16 sm:px-16 sm:py-20 text-center shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to streamline your reporting?
              </h2>
              <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
                Join your team on the VIF Training Activity Tracker and never miss a weekly status update.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-lg min-h-[48px]"
                >
                  Create Account
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white border border-white/30 hover:bg-white/10 transition-colors min-h-[48px]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-md flex items-center justify-center">
                <FiActivity className="text-white w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-gray-700">VIF Training</span>
            </div>
            <p className="text-sm text-gray-500">
              VIF Training Activity Tracker &mdash; Employee Weekly Status Reporting System
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
