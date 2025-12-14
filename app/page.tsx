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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 gap-8">
        <div className="text-[10rem] animate-bounce-gentle">⏰</div>
        <div className="text-white text-5xl md:text-6xl font-black animate-pulse-gentle">Loading...</div>
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
          childName={profile.name}
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
          childName={profile.name}
          onChoreToggle={handleChoreToggle}
          onRewardClaimed={handleRewardClaimed}
        />
      )
    }

    if (dailyState.lastCompletedStep === 'reward-claimed' || dailyState.booksCount < 3) {
      return (
        <BookCounter
          booksCount={dailyState.booksCount}
          childName={profile.name}
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
      {/* Audio prompt - CHILD FRIENDLY */}
      {showAudioPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 md:p-16 max-w-2xl text-center shadow-2xl border-8 border-yellow-400">
            <div className="text-[10rem] mb-8 animate-bounce-gentle">🔊</div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-gray-900">Turn on sounds?</h2>
            <p className="text-3xl md:text-4xl text-gray-700 mb-12 font-bold">
              Tap to hear fun sounds! 🎵
            </p>
            <button
              onClick={handleAudioEnable}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-4xl md:text-5xl font-black py-10 rounded-3xl transition-all active:scale-95 shadow-2xl border-4 border-white"
            >
              Yes! Turn On Sounds! 🎉
            </button>
            <button
              onClick={() => setShowAudioPrompt(false)}
              className="w-full mt-6 text-gray-600 underline text-2xl md:text-3xl font-bold"
            >
              No thanks
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

      {/* Hidden settings trigger (bottom-left corner, 3-second long press for parents) */}
      <div
        className="fixed bottom-0 left-0 w-24 h-24 z-30"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        aria-label="Long press for parent settings"
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

