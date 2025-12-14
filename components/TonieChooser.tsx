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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-purple-900 to-blue-900 overflow-y-auto smooth-scroll">
      <div className="max-w-6xl w-full">
        {/* Title - BIGGER and friendlier */}
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-center text-white mb-6 md:mb-8 drop-shadow-2xl animate-pulse-gentle">
          Pick a Story! 📚
        </h1>

        {/* Timer - simpler language */}
        {duration > 0 && timeLeft > 0 && (
          <p className="text-4xl md:text-5xl text-center text-white/90 mb-8 md:mb-12 font-bold drop-shadow-lg">
            Picking in {timeLeft}...
          </p>
        )}

        {/* Tonie grid - BIGGER cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-12">
          {tonies.map((tonie) => {
            const isLastUsed = tonie.id === lastTonieId

            return (
              <button
                key={tonie.id}
                onClick={() => handleTonieClick(tonie.id)}
                className={`relative bg-white/95 hover:bg-white rounded-[2.5rem] p-10 md:p-12 transition-all transform hover:scale-105 active:scale-95 shadow-2xl border-8 ${
                  isLastUsed ? 'border-yellow-400 ring-8 ring-yellow-300' : 'border-purple-400'
                }`}
              >
                {/* Last used badge - BIGGER */}
                {isLastUsed && (
                  <div className="absolute -top-5 -right-5 bg-yellow-400 text-yellow-900 text-2xl md:text-3xl font-black px-6 py-3 rounded-full shadow-2xl border-4 border-white animate-bounce-gentle">
                    ⭐ Last Time
                  </div>
                )}

                {/* Tonie image/emoji - BIGGER */}
                <div className="text-[8rem] md:text-[10rem] mb-6 text-center">
                  {tonie.imageUrl ? (
                    <img
                      src={tonie.imageUrl}
                      alt={tonie.name}
                      className="w-full h-40 md:h-48 object-contain rounded-2xl"
                    />
                  ) : (
                    tonie.emoji
                  )}
                </div>

                {/* Tonie name - BIGGER */}
                <p className="text-4xl md:text-5xl font-black text-gray-900 text-center">
                  {tonie.name}
                </p>
              </button>
            )
          })}
        </div>

        {/* Skip button - hidden for kids, smaller for parents */}
        {onSkip && (
          <div className="text-center opacity-30 hover:opacity-100 transition-opacity">
            <button
              onClick={onSkip}
              className="bg-white/20 hover:bg-white/30 text-white text-base font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

