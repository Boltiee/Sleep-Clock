import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export const isLocalMode = !isSupabaseConfigured

// Helper to check if user is authenticated
export async function getCurrentUser() {
  if (!supabase) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper to sign in
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Helper to sign up
export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Helper to sign out
export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Magic link sign in
export async function signInWithMagicLink(email: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  })
  
  if (error) throw error
  return data
}

// Password reset request
export async function resetPassword(email: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) throw error
  return data
}

// Update password (after reset)
export async function updatePassword(newPassword: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  if (error) throw error
  return data
}

