'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { isLocalMode, getCurrentUser, signIn, signUp } from '@/lib/supabase'
import { createProfile } from '@/lib/sync'
import { hashPin, isValidPinFormat } from '@/lib/pin'
import {
  DEFAULT_SCHEDULE,
  DEFAULT_COLORS,
  DEFAULT_DIM,
  DEFAULT_CHORES,
  DEFAULT_TONIES,
  Settings,
} from '@/types'
import { syncSettingsToServer } from '@/lib/sync'

export default function SetupPage() {
  const router = useRouter()
  const { setProfile, setSettings, unlock } = useApp()
  
  const [step, setStep] = useState<'mode' | 'auth' | 'profile' | 'pin'>('mode')
  const [selectedMode, setSelectedMode] = useState<'local' | 'online'>('online')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profileName, setProfileName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      if (!isLocalMode) {
        const user = await getCurrentUser()
        if (user) {
          setStep('profile')
        }
      }
    }
    checkAuth()
  }, [])

  const handleModeSelect = (mode: 'local' | 'online') => {
    setSelectedMode(mode)
    if (mode === 'local' || isLocalMode) {
      setStep('profile')
    } else {
      setStep('auth')
    }
  }

  const handleAuth = async () => {
    setError('')
    setLoading(true)

    try {
      if (authMode === 'signup') {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      setStep('profile')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileCreate = async () => {
    if (!profileName.trim()) {
      setError('Profile name is required')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Use local mode if Supabase is not configured OR if local mode is selected
      const useLocalMode = isLocalMode || selectedMode === 'local'
      const userId = useLocalMode ? 'local-user' : (await getCurrentUser())?.id
      
      if (!userId) {
        setError('User not found. Please sign in or use Local Mode.')
        setLoading(false)
        return
      }

      const profile = await createProfile(userId, profileName, useLocalMode)
      if (!profile) {
        setError('Failed to create profile')
        setLoading(false)
        return
      }

      setProfile(profile)
      setStep('pin')
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePinSetup = async () => {
    setError('')

    if (!isValidPinFormat(pin)) {
      setError('PIN must be 4 digits')
      return
    }

    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setLoading(true)

    try {
      const pinHash = await hashPin(pin)
      
      // Get current profile from context (set in previous step)
      const { getMetadata } = await import('@/lib/storage')
      const currentProfileId = await getMetadata('currentProfileId')
      
      if (!currentProfileId) {
        setError('Profile not found')
        setLoading(false)
        return
      }

      // Create default settings
      const defaultSettings: Settings = {
        profileId: currentProfileId,
        schedule: DEFAULT_SCHEDULE,
        colors: DEFAULT_COLORS,
        dim: DEFAULT_DIM,
        choresEnabled: true,
        chores: DEFAULT_CHORES,
        rewardText: 'Nice work!',
        tonieEnabled: false,
        tonieList: DEFAULT_TONIES,
        tonieChooserDuration: 30,
        lastTonieId: null,
        soundEnabled: true,
        soundVolume: 50,
        showClock: false,
        pinHash,
      }

      await syncSettingsToServer(defaultSettings)
      setSettings(defaultSettings)
      unlock()
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Failed to setup PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Setup
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Mode selection */}
        {step === 'mode' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Choose setup mode
            </p>
            <button
              onClick={() => handleModeSelect('online')}
              disabled={isLocalMode}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
            >
              Online Mode (Multi-device sync)
            </button>
            <button
              onClick={() => handleModeSelect('local')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Local Mode (This device only)
            </button>
            {isLocalMode && (
              <p className="text-sm text-gray-600 text-center mt-4">
                Supabase not configured. Running in Local Mode.
              </p>
            )}
          </div>
        )}

        {/* Auth */}
        {step === 'auth' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  authMode === 'signin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  authMode === 'signup'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl"
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl"
            >
              {loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
            {authMode === 'signin' && (
              <button
                type="button"
                onClick={() => window.location.href = '/reset-password'}
                className="w-full text-purple-600 underline text-sm"
              >
                Forgot Password?
              </button>
            )}
            <button
              onClick={() => setStep('mode')}
              className="w-full text-gray-600 underline"
            >
              Back
            </button>
          </div>
        )}

        {/* Profile creation */}
        {step === 'profile' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Create a child profile
            </p>
            <input
              type="text"
              placeholder="Child's name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl"
            />
            <button
              onClick={handleProfileCreate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        )}

        {/* PIN setup */}
        {step === 'pin' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Set a 4-digit PIN for parent access
            </p>
            <input
              type="password"
              inputMode="numeric"
              placeholder="PIN (4 digits)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 border rounded-xl text-center text-2xl"
              maxLength={4}
            />
            <input
              type="password"
              inputMode="numeric"
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 border rounded-xl text-center text-2xl"
              maxLength={4}
            />
            <button
              onClick={handlePinSetup}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

