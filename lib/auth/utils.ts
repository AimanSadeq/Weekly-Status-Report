// lib/auth/utils.ts
import { createClient } from '@/lib/supabase/client'

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'viftraining.com'

export function isEmailAllowed(email: string): boolean {
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
}

export async function signUp(email: string, password: string, fullName: string) {
  if (!isEmailAllowed(email)) {
    return {
      error: `Only @${ALLOWED_DOMAIN} email addresses are allowed to register.`
    }
  }

  const supabase = createClient()
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // Create employee record
    const { error: employeeError } = await supabase
      .from('employees')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        is_admin: email === process.env.ADMIN_EMAIL,
        is_active: true
      })

    if (employeeError) {
      console.error('Error creating employee record:', employeeError)
      // You might want to delete the auth user here if employee creation fails
      return { error: 'Failed to create employee profile' }
    }

    // Trigger department assignment function
    await assignEmployeeDepartments(authData.user.id, email)
  }

  return { data: authData, error: null }
}

export async function signIn(email: string, password: string) {
  if (!isEmailAllowed(email)) {
    return {
      error: `Only @${ALLOWED_DOMAIN} email addresses are allowed.`
    }
  }

  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { data, error: null }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get employee details
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      employee_departments (
        department_id,
        is_primary,
        departments (
          id,
          name
        )
      )
    `)
    .eq('id', user.id)
    .single()

  return {
    ...user,
    ...employee,
    departments: employee?.employee_departments || []
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.is_admin || false
}

// Helper function to assign departments based on email
async function assignEmployeeDepartments(userId: string, email: string) {
  const supabase = createClient()
  
  // This is a simplified mapping - in production, you'd want to manage this through an admin interface
  const emailName = email.split('@')[0].toLowerCase()
  
  const departmentMappings: Record<string, string[]> = {
    'rakan': ['Business Development & Relationship Management'],
    'omar': ['Website (Digital/Marketing)', 'Consultants'],
    'ahmad': ['Operations', 'Consultants'],
    'aiman': ['Management', 'Consultants'],
    'hamda': ['Finance'],
    'farah': ['Consultants'],
    'leen': ['Business Development & Relationship Management'],
    'mira': ['Consultants'],
    'saja': ['Finance'],
    'adnan': ['Consultants'],
    'malak': ['Consultants'],
    'natalie': ['Operations'],
    'hani': ['Consultants'],
    'rahaf': ['Operations'],
    'faisal': ['Consultants'],
    'ahmadyounes': ['Website (Digital/Marketing)'],
    'heba': ['Operations'],
    'tala': ['Operations'],
  }

  const userDepartments = departmentMappings[emailName] || []

  for (let i = 0; i < userDepartments.length; i++) {
    const deptName = userDepartments[i]
    
    // Get department ID
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .eq('name', deptName)
      .single()

    if (dept) {
      await supabase
        .from('employee_departments')
        .insert({
          employee_id: userId,
          department_id: dept.id,
          is_primary: i === 0 // First department is primary
        })
    }
  }
}

export async function resetPassword(email: string) {
  if (!isEmailAllowed(email)) {
    return {
      error: `Only @${ALLOWED_DOMAIN} email addresses are allowed.`
    }
  }

  const supabase = createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
