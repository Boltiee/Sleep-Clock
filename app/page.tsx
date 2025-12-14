'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import ModeScreen from '@/components/ModeScreen'
import ChoresFlow from '@/components/ChoresFlow'
import BookCounter from '@/components/BookCounter'
import TonieChooser from '@/components/TonieChooser'
import SettingsPanel from '@/components/SettingsPanel'

export default function HomePage() {
  const router = useRouter()
  const {
    currentMode,
    profile,
    settings,
    dailyState,
    isLocked,
    audioPrimed,
    enableAudio,
    updateDailyState,
    setSettings,
  } = useApp()

  const [showSettings, setShowSettings] = useState(false)
  const [showTonieChooser, setShowTonieChooser] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [showAudioPrompt, setShowAudioPrompt] = useState(false)

  // Check if profile is set, redirect to setup if not
  useEffect(() => {
    if (!profile || !settings) {
      router.push('/setup')
    }
  }, [profile, settings, router])

  // Check if locked, redirect to PIN if locked
  useEffect(() => {
    if (isLocked && profile) {
      router.push('/pin')
    }
  }, [isLocked, profile, router])

  // Show audio prompt if not primed
  useEffect(() => {
    if (!audioPrimed && profile && !isLocked) {
      setShowAudioPrompt(true)
    }
  }, [audioPrimed, profile, isLocked])

  // Handle Tonie chooser for SLEEP transition
  useEffect(() => {
    if (
      currentMode === 'SLEEP' &&
      settings?.tonieEnabled &&
      dailyState?.lastCompletedStep !== 'ready-for-sleep'
    ) {
      // Show Tonie chooser once per sleep transition
      setShowTonieChooser(true)
    }
  }, [currentMode, settings, dailyState])

  if (!profile || !settings || !dailyState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="text-white text-3xl font-semibold">Loading...</div>
      </div>
    )
  }

  const handleChoreToggle = (choreId: string) => {
    const newChoresDone = dailyState.choresDone.includes(choreId)
      ? dailyState.choresDone.filter((id) => id !== choreId)
      : [...dailyState.choresDone, choreId]

    updateDailyState({ choresDone: newChoresDone })
  }

  const handleRewardClaimed = () => {
    updateDailyState({ lastCompletedStep: 'reward-claimed' })
  }

  const handleBookFinished = () => {
    const newBooksCount = Math.min(dailyState.booksCount + 1, 3)
    updateDailyState({ booksCount: newBooksCount })
  }

  const handleAllBooksComplete = () => {
    updateDailyState({ lastCompletedStep: 'ready-for-sleep' })
  }

  const handleTonieSelected = (tonieId: string) => {
    setSettings({ ...settings, lastTonieId: tonieId })
    setShowTonieChooser(false)
  }

  const handleSettingsLongPress = () => {
    setShowSettings(true)
  }

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      handleSettingsLongPress()
    }, 3000)
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleAudioEnable = async () => {
    await enableAudio()
    setShowAudioPrompt(false)
  }

  // Determine what to show in GET_READY mode
  const getReadyContent = () => {
    if (!settings.choresEnabled) {
      // Skip to books
      if (dailyState.booksCount >= 3) {
        return null // Show ready for sleep
      }
      return (
        <BookCounter
          booksCount={dailyState.booksCount}
          onBookFinished={handleBookFinished}
          onAllBooksComplete={handleAllBooksComplete}
        />
      )
    }

    // Check chores completion
    const allChoresDone = settings.chores.every((chore) =>
      dailyState.choresDone.includes(chore.id)
    )

    if (!allChoresDone || dailyState.lastCompletedStep === 'none') {
      return (
        <ChoresFlow
          chores={settings.chores}
          choresDone={dailyState.choresDone}
          rewardText={settings.rewardText}
          onChoreToggle={handleChoreToggle}
          onRewardClaimed={handleRewardClaimed}
        />
      )
    }

    if (dailyState.lastCompletedStep === 'reward-claimed' || dailyState.booksCount < 3) {
      return (
        <BookCounter
          booksCount={dailyState.booksCount}
          onBookFinished={handleBookFinished}
          onAllBooksComplete={handleAllBooksComplete}
        />
      )
    }

    return null
  }

  // Show Tonie chooser overlay
  if (showTonieChooser) {
    return (
      <TonieChooser
        tonies={settings.tonieList}
        lastTonieId={settings.lastTonieId}
        duration={settings.tonieChooserDuration}
        onTonieSelected={handleTonieSelected}
        onSkip={() => setShowTonieChooser(false)}
      />
    )
  }

  return (
    <>
      {/* Audio prompt */}
      {showAudioPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-12 max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-6">☀️</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Enable Sounds?</h2>
            <p className="text-gray-600 mb-8">
              Tap to enable chimes and celebration sounds
            </p>
            <button
              onClick={handleAudioEnable}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold py-4 rounded-xl transition-colors"
            >
              Enable Sounds
            </button>
            <button
              onClick={() => setShowAudioPrompt(false)}
              className="w-full mt-4 text-gray-600 underline text-lg"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Visible settings button (top-right corner) */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        aria-label="Open Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Hidden settings trigger (bottom-left corner, long press) - kept for production use */}
      <div
        className="fixed bottom-0 left-0 w-20 h-20 z-30"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      />

      {/* Main mode screen */}
      <div className="no-select relative z-0 min-h-screen">
        <ModeScreen
          mode={currentMode}
          color={settings.colors[currentMode]}
          dimOpacity={settings.dim[currentMode]}
          nightDimEnabled={settings.dim.nightDimEnabled}
          showClock={settings.showClock}
        >
          {currentMode === 'GET_READY' && getReadyContent()}
        </ModeScreen>
      </div>
    </>
  )
}

