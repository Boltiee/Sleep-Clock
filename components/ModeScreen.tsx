'use client'

import { Mode, MODE_DISPLAYS } from '@/types'
import DimOverlay from './DimOverlay'

interface ModeScreenProps {
  mode: Mode
  color: string
  dimOpacity: number
  nightDimEnabled: boolean
  showClock?: boolean
  children?: React.ReactNode
}

export default function ModeScreen({
  mode,
  color,
  dimOpacity,
  nightDimEnabled,
  showClock,
  children,
}: ModeScreenProps) {
  const display = MODE_DISPLAYS[mode]
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Australia/Brisbane',
  })

  return (
    <div
      className="relative min-h-screen flex flex-col items-center p-8 py-16 transition-colors duration-1000"
      style={{ backgroundColor: color }}
    >
      <DimOverlay opacity={dimOpacity} nightDimEnabled={nightDimEnabled} />

      <div className="relative z-10 text-center max-w-4xl w-full my-auto">
        {/* Icon */}
        <div className="text-9xl mb-8 animate-bounce-gentle">{display.icon}</div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
          {display.title}
        </h1>

        {/* Subtitle */}
        <p className="text-3xl md:text-4xl text-white/90 mb-8">
          {display.subtitle}
        </p>

        {/* Clock */}
        {showClock && (
          <div className="text-5xl md:text-6xl font-mono text-white/80 mb-8">
            {timeString}
          </div>
        )}

        {/* Children (interactive elements) */}
        {children}
      </div>
    </div>
  )
}

