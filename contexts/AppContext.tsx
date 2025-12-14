'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Mode, Settings, DailyState, Profile, DEFAULT_SCHEDULE, DEFAULT_COLORS, DEFAULT_DIM } from '@/types'
import { calculateCurrentMode } from '@/lib/schedule'
import {
  syncSettingsFromServer,
  syncSettingsToServer,
  syncDailyStateFromServer,
  syncDailyStateToServer,
  subscribeToSettingsChanges,
  getLastSyncTime,
} from '@/lib/sync'
import { getTodayDateString, getMetadata, setMetadata } from '@/lib/storage'
import { isAudioPrimed, primeAudio } from '@/lib/audio'

interface AppContextType {
  currentMode: Mode
  profile: Profile | null
  settings: Settings | null
  dailyState: DailyState | null
  isLocked: boolean
  audioPrimed: boolean
  lastSyncTime: Date | null
  isOnline: boolean
  testTimeOverride: string | null
  setProfile: (profile: Profile | null) => void
  setSettings: (settings: Settings) => void
  updateDailyState: (updates: Partial<DailyState>) => void
  unlock: () => void
  lock: () => void
  enableAudio: () => Promise<void>
  setTestTimeOverride: (time: string | null) => void
  refreshSettings: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<Mode>('WAKE')
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [dailyState, setDailyStateState] = useState<DailyState | null>(null)
  const [isLocked, setIsLocked] = useState(true)
  const [audioPrimed, setAudioPrimed] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [testTimeOverride, setTestTimeOverride] = useState<string | null>(null)
  const [previousMode, setPreviousMode] = useState<Mode>('WAKE')

  // Update current mode every minute
  useEffect(() => {
    const updateMode = () => {
      if (settings) {
        const newMode = calculateCurrentMode(
          settings.schedule,
          testTimeOverride || undefined
        )
        
        if (newMode !== currentMode) {
          setPreviousMode(currentMode)
          setCurrentMode(newMode)
          
          // Handle mode transitions
          handleModeTransition(currentMode, newMode)
        }
      }
    }

    updateMode()
    const interval = setInterval(updateMode, 60000) // Every minute

    return () => clearInterval(interval)
  }, [settings, testTimeOverride, currentMode])

  // Handle mode transitions (play chimes, show Tonie chooser)
  const handleModeTransition = useCallback(
    async (from: Mode, to: Mode) => {
      if (!settings || !audioPrimed) return

      // Play chime for GET_READY and SLEEP transitions
      if (settings.soundEnabled) {
        if (to === 'GET_READY' || to === 'SLEEP') {
          try {
            const { playChime } = await import('@/lib/audio')
            await playChime(settings.soundVolume)
          } catch (err) {
            console.error('Error playing chime:', err)
          }
        }
      }

      // Handle Tonie chooser for SLEEP transition
      if (to === 'SLEEP' && settings.tonieEnabled) {
        // This would trigger Tonie chooser - handled in main page
      }

      // Reset daily state for GET_READY transition (new day)
      if (to === 'GET_READY' && from !== 'GET_READY') {
        const today = getTodayDateString()
        if (dailyState && dailyState.date !== today) {
          // New day - reset daily state
          const newDailyState: DailyState = {
            profileId: profile!.id,
            date: today,
            choresDone: [],
            booksCount: 0,
            lastCompletedStep: 'none',
          }
          setDailyStateState(newDailyState)
          await syncDailyStateToServer(newDailyState)
        }
      }
    },
    [settings, audioPrimed, dailyState, profile]
  )

  // Load profile and settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentProfileId = await getMetadata('currentProfileId')
        
        if (currentProfileId) {
          const { getProfileLocal } = await import('@/lib/storage')
          const loadedProfile = await getProfileLocal(currentProfileId)
          
          if (loadedProfile) {
            setProfileState(loadedProfile)
            
            // Load settings
            const loadedSettings = await syncSettingsFromServer(currentProfileId)
            if (loadedSettings) {
              setSettingsState(loadedSettings)
            }
            
            // Load daily state
            const today = getTodayDateString()
            const loadedDailyState = await syncDailyStateFromServer(
              currentProfileId,
              today
            )
            
            if (loadedDailyState) {
              setDailyStateState(loadedDailyState)
            } else {
              // Create new daily state for today
              const newDailyState: DailyState = {
                profileId: currentProfileId,
                date: today,
                choresDone: [],
                booksCount: 0,
                lastCompletedStep: 'none',
              }
              setDailyStateState(newDailyState)
              await syncDailyStateToServer(newDailyState)
            }
          }
        }
        
        // Load last sync time
        const lastSync = await getLastSyncTime()
        setLastSyncTime(lastSync)
        
        // Check audio primed status
        setAudioPrimed(isAudioPrimed())
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }

    loadData()
  }, [])

  // Subscribe to realtime settings changes
  useEffect(() => {
    if (!profile) return

    const channel = subscribeToSettingsChanges(profile.id, (newSettings) => {
      console.log('Settings updated from server:', newSettings)
      setSettingsState(newSettings)
      setLastSyncTime(new Date())
    })

    // Periodic refresh fallback (every 60 seconds)
    const refreshInterval = setInterval(async () => {
      const refreshedSettings = await syncSettingsFromServer(profile.id)
      if (refreshedSettings) {
        setSettingsState(refreshedSettings)
        setLastSyncTime(new Date())
      }
    }, 60000)

    return () => {
      channel?.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [profile])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Visibility change handler (recompute mode)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && settings) {
        const newMode = calculateCurrentMode(
          settings.schedule,
          testTimeOverride || undefined
        )
        if (newMode !== currentMode) {
          setPreviousMode(currentMode)
          setCurrentMode(newMode)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [settings, currentMode, testTimeOverride])

  const setProfile = useCallback(async (newProfile: Profile | null) => {
    setProfileState(newProfile)
    if (newProfile) {
      await setMetadata('currentProfileId', newProfile.id)
      
      // Load settings and daily state for new profile
      const loadedSettings = await syncSettingsFromServer(newProfile.id)
      if (loadedSettings) {
        setSettingsState(loadedSettings)
      }
      
      const today = getTodayDateString()
      const loadedDailyState = await syncDailyStateFromServer(
        newProfile.id,
        today
      )
      
      if (loadedDailyState) {
        setDailyStateState(loadedDailyState)
      } else {
        const newDailyState: DailyState = {
          profileId: newProfile.id,
          date: today,
          choresDone: [],
          booksCount: 0,
          lastCompletedStep: 'none',
        }
        setDailyStateState(newDailyState)
        await syncDailyStateToServer(newDailyState)
      }
    }
  }, [])

  const setSettings = useCallback(async (newSettings: Settings) => {
    setSettingsState(newSettings)
    await syncSettingsToServer(newSettings)
    setLastSyncTime(new Date())
  }, [])

  const updateDailyState = useCallback(
    async (updates: Partial<DailyState>) => {
      if (!dailyState) return

      const updatedState = { ...dailyState, ...updates }
      setDailyStateState(updatedState)
      await syncDailyStateToServer(updatedState)
    },
    [dailyState]
  )

  const unlock = useCallback(() => {
    setIsLocked(false)
  }, [])

  const lock = useCallback(() => {
    setIsLocked(true)
  }, [])

  const enableAudio = useCallback(async () => {
    await primeAudio()
    setAudioPrimed(true)
  }, [])

  const refreshSettings = useCallback(async () => {
    if (!profile) return
    const refreshedSettings = await syncSettingsFromServer(profile.id)
    if (refreshedSettings) {
      setSettingsState(refreshedSettings)
      setLastSyncTime(new Date())
    }
  }, [profile])

  return (
    <AppContext.Provider
      value={{
        currentMode,
        profile,
        settings,
        dailyState,
        isLocked,
        audioPrimed,
        lastSyncTime,
        isOnline,
        testTimeOverride,
        setProfile,
        setSettings,
        updateDailyState,
        unlock,
        lock,
        enableAudio,
        setTestTimeOverride,
        refreshSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

