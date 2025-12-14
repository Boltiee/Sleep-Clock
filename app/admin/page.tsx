'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isLocalMode } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalProfiles: number
  recentSignups: number
  activeToday: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProfiles: 0,
    recentSignups: 0,
    activeToday: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      if (isLocalMode) {
        setError('Admin dashboard not available in local mode')
        setLoading(false)
        return
      }

      const user = await getCurrentUser()
      
      if (!user) {
        router.push('/setup')
        return
      }

      // Check if user is admin (configure this in environment variable)
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
      
      if (user.email !== adminEmail) {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      setIsAuthorized(true)
      await loadStats()
    } catch (err: any) {
      setError(err.message || 'Failed to verify admin access')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      // TODO: Implement actual API calls to get stats
      // For now, showing placeholder
      setStats({
        totalUsers: 0,
        totalProfiles: 0,
        recentSignups: 0,
        activeToday: 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load stats')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg"
          >
            Back to App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and monitor application health</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Profiles</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProfiles}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Recent Signups (7d)</div>
            <div className="text-3xl font-bold text-green-600">{stats.recentSignups}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Active Today</div>
            <div className="text-3xl font-bold text-blue-600">{stats.activeToday}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-2">Supabase Dashboard</h3>
              <p className="text-sm text-gray-600">Manage database and authentication</p>
            </a>
            
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-2">Vercel Dashboard</h3>
              <p className="text-sm text-gray-600">View deployments and analytics</p>
            </a>
            
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-2">Sentry Dashboard</h3>
              <p className="text-sm text-gray-600">Monitor errors and performance</p>
            </a>
            
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-2">Health Check</h3>
              <p className="text-sm text-gray-600">View application health status</p>
            </a>
            
            <button
              onClick={loadStats}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors text-left"
            >
              <h3 className="font-bold text-gray-900 mb-2">Refresh Stats</h3>
              <p className="text-sm text-gray-600">Reload dashboard statistics</p>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors text-left"
            >
              <h3 className="font-bold text-gray-900 mb-2">Back to App</h3>
              <p className="text-sm text-gray-600">Return to main application</p>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">System Information</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">{process.env.NODE_ENV || 'development'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Mode</dt>
                <dd className="mt-1 text-sm text-gray-900">{isLocalMode ? 'Local' : 'Online'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Supabase</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not configured'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Sentry</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Not configured'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <a href="/OPERATIONS.md" className="text-blue-700 hover:text-blue-900 underline">
              Operations Runbook
            </a>
            <a href="/BACKUP_STRATEGY.md" className="text-blue-700 hover:text-blue-900 underline">
              Backup Strategy
            </a>
            <a href="/MONITORING_SETUP.md" className="text-blue-700 hover:text-blue-900 underline">
              Monitoring Setup
            </a>
            <a href="/SECURITY_HEADERS.md" className="text-blue-700 hover:text-blue-900 underline">
              Security Documentation
            </a>
            <a href="/RATE_LIMITING.md" className="text-blue-700 hover:text-blue-900 underline">
              Rate Limiting Guide
            </a>
            <a href="/EMAIL_TEMPLATES.md" className="text-blue-700 hover:text-blue-900 underline">
              Email Templates
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
