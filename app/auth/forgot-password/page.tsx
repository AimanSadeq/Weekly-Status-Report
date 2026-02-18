// app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { resetPassword } from '@/lib/auth/utils'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft } from 'react-icons/fi'

type FormData = {
  email: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const { error } = await resetPassword(data.email)

      if (error) {
        toast.error(error)
      } else {
        setIsEmailSent(true)
        toast.success('Password reset email sent!')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            VIF Training
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-700">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {isEmailSent ? (
          <div className="card p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiMail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to your email address.
              Please check your inbox and follow the instructions.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80"
            >
              <FiArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80"
              >
                <FiArrowLeft className="mr-1 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
