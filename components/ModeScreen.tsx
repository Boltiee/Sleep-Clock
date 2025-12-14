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
      className="relative min-h-screen flex flex-col items-center p-4 md:p-8 py-12 md:py-16 transition-colors duration-1000"
      style={{ backgroundColor: color }}
    >
      <DimOverlay opacity={dimOpacity} nightDimEnabled={nightDimEnabled} />

      <div className="relative z-10 text-center max-w-5xl w-full my-auto">
        {/* Icon - BIGGER and more animated */}
        <div className="text-[12rem] md:text-[16rem] mb-6 md:mb-8 animate-bounce-gentle drop-shadow-2xl">
          {display.icon}
        </div>

        {/* Title - BIGGER and more playful */}
        <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black text-white mb-4 md:mb-6 drop-shadow-2xl animate-pulse-gentle">
          {display.title}
        </h1>

        {/* Subtitle - BIGGER and friendlier */}
        <p className="text-4xl md:text-5xl lg:text-6xl text-white/95 mb-8 md:mb-12 font-bold drop-shadow-lg">
          {display.subtitle}
        </p>

        {/* Clock */}
        {showClock && (
          <div className="text-6xl md:text-7xl font-mono text-white/80 mb-8 font-bold drop-shadow-lg">
            {timeString}
          </div>
        )}

        {/* Children (interactive elements) */}
        {children}
      </div>
    </div>
  )
}

