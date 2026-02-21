// app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft, FiActivity, FiCheckCircle } from 'react-icons/fi'

type FormData = {
  email: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error('Failed to send reset email. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <FiActivity className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-gray-900 text-lg">VIF Training</span>
        </div>

        {emailSent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              We sent a password reset link to{' '}
              <span className="font-medium text-gray-800">{getValues('email')}</span>.
              Check your inbox and follow the instructions to reset your password.
            </p>
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="btn-outline inline-flex"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Reset your password
              </h2>
              <p className="text-gray-600">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@viftraining\.com$/i,
                        message: 'Must be a @viftraining.com email address'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="input-field pl-10"
                    placeholder="yourname@viftraining.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base shadow-lg shadow-blue-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
