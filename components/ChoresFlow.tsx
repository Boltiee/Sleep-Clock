'use client'

import { useState, useEffect } from 'react'
import { Chore } from '@/types'
import confetti from 'canvas-confetti'

interface ChoresFlowProps {
  chores: Chore[]
  choresDone: string[]
  rewardText: string
  onChoreToggle: (choreId: string) => void
  onRewardClaimed: () => void
}

export default function ChoresFlow({
  chores,
  choresDone,
  rewardText,
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
      <div className="animate-fade-in">
        <div className="bg-white/95 backdrop-blur rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl text-center mb-6">🎉</div>
          <h2 className="text-5xl font-bold text-center text-purple-900 mb-8">
            All Done!
          </h2>
          <p className="text-3xl text-center text-gray-700 mb-12">
            {rewardText}
          </p>
          <button
            onClick={handleClaimReward}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-4xl font-bold py-8 rounded-2xl transition-all active:scale-95 shadow-lg"
          >
            Claim Reward! 🎁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto max-h-[70vh] overflow-y-auto smooth-scroll px-4">
      <div className="space-y-6 pb-4">
        {chores.map((chore) => {
          const isDone = choresDone.includes(chore.id)

          return (
            <button
              key={chore.id}
              onClick={() => onChoreToggle(chore.id)}
              className={`w-full flex items-center gap-6 p-8 rounded-3xl transition-all transform active:scale-95 ${
                isDone
                  ? 'bg-green-500/90 shadow-lg'
                  : 'bg-white/90 hover:bg-white shadow-xl'
              }`}
            >
              {/* Emoji */}
              <div className="text-6xl">{chore.emoji || '✓'}</div>

              {/* Text */}
              <div className="flex-1 text-left">
                <span
                  className={`text-4xl font-bold ${
                    isDone ? 'text-white line-through' : 'text-gray-800'
                  }`}
                >
                  {chore.text}
                </span>
              </div>

              {/* Checkbox */}
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                  isDone
                    ? 'bg-white border-white'
                    : 'border-purple-600 bg-transparent'
                }`}
              >
                {isDone && <span className="text-4xl text-green-500">✓</span>}
              </div>
            </button>
          )
        })}

        {/* Progress indicator */}
        <div className="bg-white/90 rounded-2xl p-6 mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-semibold text-gray-700">Progress</span>
            <span className="text-2xl font-bold text-purple-700">
              {choresDone.length} / {chores.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
              style={{
                width: `${(choresDone.length / chores.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

