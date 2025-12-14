'use client'

import { useState, useEffect } from 'react'
import { Chore } from '@/types'
import confetti from 'canvas-confetti'

interface ChoresFlowProps {
  chores: Chore[]
  choresDone: string[]
  rewardText: string
  childName?: string
  onChoreToggle: (choreId: string) => void
  onRewardClaimed: () => void
}

export default function ChoresFlow({
  chores,
  choresDone,
  rewardText,
  childName,
  onChoreToggle,
  onRewardClaimed,
}: ChoresFlowProps) {
  const [showReward, setShowReward] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState(false)

  const allChoresDone = chores.every((chore) => choresDone.includes(chore.id))

  useEffect(() => {
    if (allChoresDone && !showReward && !rewardClaimed) {
      // Trigger confetti
      triggerConfetti()
      setShowReward(true)
    }
  }, [allChoresDone, showReward, rewardClaimed])

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      })
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }

  const handleClaimReward = async () => {
    // Play celebration sound
    try {
      const { playCelebration } = await import('@/lib/audio')
      await playCelebration(50)
    } catch (err) {
      console.error('Error playing celebration:', err)
    }

    setRewardClaimed(true)
    onRewardClaimed()
  }

  if (rewardClaimed) {
    return null // Parent will handle showing books flow
  }

  if (showReward) {
    return (
      <div className="animate-pop">
        <div className="bg-white/95 backdrop-blur rounded-[3rem] p-10 md:p-16 shadow-2xl max-w-3xl mx-auto border-8 border-yellow-400">
          <div className="text-[10rem] text-center mb-8 animate-bounce-gentle">🎉</div>
          <h2 className="text-6xl md:text-7xl font-black text-center text-purple-900 mb-8 animate-wiggle">
            {childName ? `Amazing Job, ${childName}!` : 'Amazing Job!'}
          </h2>
          <p className="text-4xl md:text-5xl text-center text-gray-800 mb-12 font-bold">
            {rewardText}
          </p>
          <button
            onClick={handleClaimReward}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-5xl md:text-6xl font-black py-10 md:py-12 rounded-3xl transition-all active:scale-95 shadow-2xl transform hover:scale-105 border-4 border-white"
          >
            Get Reward! 🎁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-8 pb-4">
        {chores.map((chore) => {
          const isDone = choresDone.includes(chore.id)

          return (
            <button
              key={chore.id}
              onClick={() => onChoreToggle(chore.id)}
              className={`w-full flex items-center gap-8 p-10 md:p-12 rounded-[2.5rem] transition-all transform active:scale-95 border-4 ${
                isDone
                  ? 'bg-green-500 shadow-2xl border-green-600 animate-pop'
                  : 'bg-white/95 hover:bg-white shadow-2xl hover:shadow-3xl border-purple-400 hover:border-purple-600'
              }`}
            >
              {/* Emoji - BIGGER */}
              <div className={`text-8xl md:text-9xl ${isDone ? 'animate-wiggle' : ''}`}>
                {chore.emoji || '✓'}
              </div>

              {/* Text - BIGGER and simpler */}
              <div className="flex-1 text-left">
                <span
                  className={`text-5xl md:text-6xl font-black ${
                    isDone ? 'text-white line-through' : 'text-gray-900'
                  }`}
                >
                  {chore.text}
                </span>
              </div>

              {/* Checkbox - BIGGER */}
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-8 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-white border-white scale-110'
                    : 'border-purple-600 bg-transparent scale-100'
                }`}
              >
                {isDone && <span className="text-6xl md:text-7xl text-green-600">✓</span>}
              </div>
            </button>
          )
        })}

        {/* Progress indicator - MORE FUN */}
        <div className="bg-white/95 rounded-3xl p-8 md:p-10 mt-12 shadow-2xl border-4 border-purple-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-4xl md:text-5xl font-black text-gray-900">How many done?</span>
            <span className="text-5xl md:text-6xl font-black text-purple-700">
              {choresDone.length} / {chores.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-10 md:h-12 overflow-hidden border-4 border-gray-400">
            <div
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 h-full transition-all duration-700 flex items-center justify-center"
              style={{
                width: `${(choresDone.length / chores.length) * 100}%`,
              }}
            >
              {choresDone.length > 0 && (
                <span className="text-3xl animate-bounce-gentle">⭐</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

