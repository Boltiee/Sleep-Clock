'use client'

import { useState, useEffect } from 'react'
import { Tonie } from '@/types'

interface TonieChooserProps {
  tonies: Tonie[]
  lastTonieId: string | null
  duration: number // seconds, 0 = wait until chosen
  onTonieSelected: (tonieId: string) => void
  onSkip?: () => void
}

export default function TonieChooser({
  tonies,
  lastTonieId,
  duration,
  onTonieSelected,
  onSkip,
}: TonieChooserProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            // Auto-select last tonie or first one
            const defaultTonie = lastTonieId || tonies[0]?.id
            if (defaultTonie) {
              onTonieSelected(defaultTonie)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [duration, lastTonieId, tonies, onTonieSelected])

  const handleTonieClick = (tonieId: string) => {
    onTonieSelected(tonieId)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="max-w-6xl w-full">
        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-center text-white mb-4">
          Choose Your Tonie
        </h1>

        {/* Timer */}
        {duration > 0 && timeLeft > 0 && (
          <p className="text-3xl text-center text-white/80 mb-8">
            Auto-selecting in {timeLeft}s
          </p>
        )}

        {/* Tonie grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {tonies.map((tonie) => {
            const isLastUsed = tonie.id === lastTonieId

            return (
              <button
                key={tonie.id}
                onClick={() => handleTonieClick(tonie.id)}
                className={`relative bg-white/95 hover:bg-white rounded-3xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                  isLastUsed ? 'ring-8 ring-yellow-400' : ''
                }`}
              >
                {/* Last used badge */}
                {isLastUsed && (
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                    ⭐ Last
                  </div>
                )}

                {/* Tonie image/emoji */}
                <div className="text-8xl mb-4 text-center">
                  {tonie.imageUrl ? (
                    <img
                      src={tonie.imageUrl}
                      alt={tonie.name}
                      className="w-full h-32 object-contain rounded-2xl"
                    />
                  ) : (
                    tonie.emoji
                  )}
                </div>

                {/* Tonie name */}
                <p className="text-2xl font-bold text-gray-800 text-center">
                  {tonie.name}
                </p>
              </button>
            )
          })}
        </div>

        {/* Skip button (parent only - could be hidden) */}
        {onSkip && (
          <div className="text-center">
            <button
              onClick={onSkip}
              className="bg-white/20 hover:bg-white/30 text-white text-xl font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Skip (Parent)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

