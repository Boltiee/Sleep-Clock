'use client'

import { useState, useRef, useEffect } from 'react'
import { ScheduleBlock, Mode, MODE_DISPLAYS, ColorConfig } from '@/types'

interface TimelineScheduleProps {
  schedule: ScheduleBlock[]
  colors: ColorConfig
  onChange: (schedule: ScheduleBlock[]) => void
}

export default function TimelineSchedule({ schedule, colors, onChange }: TimelineScheduleProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{ index: number; edge: 'start' | 'end' } | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)
  const [warningBlocks, setWarningBlocks] = useState<Set<number>>(new Set())

  // Convert HH:mm to minutes since midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Convert minutes since midnight to HH:mm
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Calculate duration in hours
  const calculateDuration = (startTime: string, endTime: string): number => {
    let start = timeToMinutes(startTime)
    let end = timeToMinutes(endTime)
    
    // Handle overnight blocks
    if (end <= start) {
      end += 24 * 60
    }
    
    return (end - start) / 60
  }

  // Format duration for display
  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  // Get current time for preview
  const getCurrentTimeMinutes = (): number => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }

  const [currentTime, setCurrentTime] = useState(getCurrentTimeMinutes())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeMinutes())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Minimum duration in minutes
  const MIN_DURATION_MINUTES = 30

  // Check if a duration is valid (at least minimum)
  const isValidDuration = (startTime: string, endTime: string): boolean => {
    const duration = calculateDuration(startTime, endTime)
    return duration >= MIN_DURATION_MINUTES / 60
  }

  // Adjust adjacent blocks when one changes
  const adjustAdjacentBlocks = (index: number, newBlock: ScheduleBlock): ScheduleBlock[] => {
    const newSchedule = [...schedule]
    const newWarnings = new Set<number>()
    
    // Check if the new block itself has valid duration
    if (!isValidDuration(newBlock.startTime, newBlock.endTime)) {
      // If current block would be too small, don't allow the change
      newWarnings.add(index)
      setWarningBlocks(newWarnings)
      return schedule
    }

    newSchedule[index] = newBlock

    // Adjust next block's start time to match this block's end time
    const nextIndex = (index + 1) % schedule.length
    if (nextIndex !== index) {
      const nextBlock = {
        ...newSchedule[nextIndex],
        startTime: newBlock.endTime,
      }
      
      // Check if next block would become too small
      if (!isValidDuration(nextBlock.startTime, nextBlock.endTime)) {
        // Don't allow the change if it would make next block too small
        newWarnings.add(nextIndex)
        setWarningBlocks(newWarnings)
        return schedule
      }
      
      newSchedule[nextIndex] = nextBlock
    }

    // Adjust previous block's end time to match this block's start time
    const prevIndex = (index - 1 + schedule.length) % schedule.length
    if (prevIndex !== index) {
      const prevBlock = {
        ...newSchedule[prevIndex],
        endTime: newBlock.startTime,
      }
      
      // Check if previous block would become too small
      if (!isValidDuration(prevBlock.startTime, prevBlock.endTime)) {
        // Don't allow the change if it would make previous block too small
        newWarnings.add(prevIndex)
        setWarningBlocks(newWarnings)
        return schedule
      }
      
      newSchedule[prevIndex] = prevBlock
    }

    // Clear warnings if adjustment succeeded
    setWarningBlocks(new Set())
    return newSchedule
  }

  // Quick adjust time by minutes
  const quickAdjust = (index: number, edge: 'start' | 'end', deltaMinutes: number) => {
    const block = schedule[index]
    const time = edge === 'start' ? block.startTime : block.endTime
    const minutes = (timeToMinutes(time) + deltaMinutes + 24 * 60) % (24 * 60)
    const newTime = minutesToTime(minutes)

    const newBlock = {
      ...block,
      [edge === 'start' ? 'startTime' : 'endTime']: newTime,
    }

    onChange(adjustAdjacentBlocks(index, newBlock))
  }

  // Handle dragging
  const handleMouseDown = (index: number, edge: 'start' | 'end') => {
    setDragging({ index, edge })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    const minutes = Math.round(percent * 24 * 60 / 15) * 15 // Snap to 15-minute intervals
    const newTime = minutesToTime(minutes)

    const block = schedule[dragging.index]
    const newBlock = {
      ...block,
      [dragging.edge === 'start' ? 'startTime' : 'endTime']: newTime,
    }

    onChange(adjustAdjacentBlocks(dragging.index, newBlock))
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  // Calculate block position on timeline (percentage)
  const getBlockPosition = (startTime: string, endTime: string) => {
    let start = timeToMinutes(startTime)
    let end = timeToMinutes(endTime)

    // Handle overnight blocks
    if (end < start) {
      // Split into two parts: start to midnight, midnight to end
      return [
        { left: (start / (24 * 60)) * 100, width: ((24 * 60 - start) / (24 * 60)) * 100 },
        { left: 0, width: (end / (24 * 60)) * 100 }
      ]
    }

    return [{ left: (start / (24 * 60)) * 100, width: ((end - start) / (24 * 60)) * 100 }]
  }

  // Get mode display info
  const getModeDisplay = (mode: Mode) => MODE_DISPLAYS[mode]

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Schedule Timeline</h3>

      {/* Current time indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-900">Current Mode Preview:</span>
          <div className="flex items-center gap-2">
            {schedule.map((block, index) => {
              let start = timeToMinutes(block.startTime)
              let end = timeToMinutes(block.endTime)
              let current = currentTime
              
              let isActive = false
              if (end < start) {
                // Overnight block
                isActive = current >= start || current < end
              } else {
                isActive = current >= start && current < end
              }

              if (isActive) {
                const display = getModeDisplay(block.mode)
                return (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: colors[block.mode] }}>
                    <span className="text-3xl">{display.icon}</span>
                    <div className="text-white">
                      <div className="font-bold">{display.title}</div>
                      <div className="text-sm opacity-90">{minutesToTime(currentTime)}</div>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-600">Drag the edges to adjust times</div>
        
        {/* Hour markers */}
        <div className="relative h-8 text-xs text-gray-500">
          {Array.from({ length: 25 }, (_, i) => {
            // Responsive display: Show different intervals based on screen size
            // Mobile (default): every 4 hours (0, 4, 8, 12, 16, 20)
            // Tablet (md): every 3 hours
            // Desktop (lg): every 2 hours
            const showOnMobile = i % 4 === 0
            const showOnTablet = i % 3 === 0
            const showOnDesktop = i % 2 === 0
            
            return (
              <div
                key={i}
                className="absolute top-0 text-center"
                style={{ left: `${(i / 24) * 100}%`, transform: 'translateX(-50%)' }}
              >
                {/* Tick mark - always show */}
                <div className="w-px h-2 bg-gray-300 mx-auto mb-1" />
                
                {/* Time label - responsive */}
                {i < 24 && (
                  <>
                    <span className={`${showOnMobile ? 'block' : 'hidden'} md:hidden`}>
                      {i.toString().padStart(2, '0')}:00
                    </span>
                    <span className={`hidden ${showOnTablet ? 'md:block' : 'md:hidden'} lg:hidden`}>
                      {i.toString().padStart(2, '0')}:00
                    </span>
                    <span className={`hidden ${showOnDesktop ? 'lg:block' : 'lg:hidden'}`}>
                      {i.toString().padStart(2, '0')}:00
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Timeline with blocks */}
        <div
          ref={timelineRef}
          className="relative h-32 bg-gray-100 rounded-lg border-2 border-gray-300 cursor-crosshair"
          onMouseMove={handleMouseMove}
        >
          {/* Current time indicator line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
            style={{ left: `${(currentTime / (24 * 60)) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full" />
          </div>

          {/* Schedule blocks */}
          {schedule.map((block, index) => {
            const positions = getBlockPosition(block.startTime, block.endTime)
            const duration = calculateDuration(block.startTime, block.endTime)
            const display = getModeDisplay(block.mode)
            const hasWarning = warningBlocks.has(index)
            const isSmall = duration < 1

            return positions.map((pos, posIndex) => (
              <div
                key={`${index}-${posIndex}`}
                className={`absolute top-2 bottom-2 rounded transition-all ${
                  hoveredBlock === index ? 'shadow-lg ring-2 ring-white' : ''
                } ${hasWarning ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                style={{
                  left: `${pos.left}%`,
                  width: `${pos.width}%`,
                  backgroundColor: colors[block.mode],
                  opacity: isSmall ? 0.8 : 1,
                }}
                onMouseEnter={() => setHoveredBlock(index)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                {/* Content (only show in first position for split blocks) */}
                {posIndex === 0 && pos.width > 8 && (
                  <div className="flex items-center justify-center h-full px-2 text-white">
                    <span className="text-2xl mr-1">{display.icon}</span>
                    <div className="text-xs font-semibold">
                      <div>{display.title}</div>
                    </div>
                  </div>
                )}

                {/* Drag handles */}
                {posIndex === 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(index, 'start')
                    }}
                  />
                )}
                {posIndex === positions.length - 1 && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(index, 'end')
                    }}
                  />
                )}
              </div>
            ))
          })}
        </div>
      </div>

      {/* Minimum duration notice */}
      {warningBlocks.size > 0 && (
        <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">
              Cannot adjust: blocks must be at least 30 minutes long
            </span>
          </div>
        </div>
      )}

      {/* Block details with quick adjust */}
      <div className="space-y-3">
        {schedule.map((block, index) => {
          const duration = calculateDuration(block.startTime, block.endTime)
          const display = getModeDisplay(block.mode)
          const hasWarning = warningBlocks.has(index)
          const isSmall = duration < 1 // Less than 1 hour

          return (
            <div
              key={index}
              className={`bg-white border-2 rounded-lg p-4 shadow-sm ${
                hasWarning ? 'ring-2 ring-amber-400 border-amber-400' : ''
              }`}
              style={{ borderColor: hasWarning ? '#fbbf24' : colors[block.mode] }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{display.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{display.title}</div>
                    <div className={`text-sm ${isSmall ? 'text-amber-600 font-semibold' : 'text-gray-600'}`}>
                      {formatDuration(duration)}
                      {isSmall && ' ⚠️'}
                    </div>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: colors[block.mode] }}
                >
                  {block.mode.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start time controls */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Start Time</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quickAdjust(index, 'start', -15)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm"
                    >
                      -15m
                    </button>
                    <div className="flex-1 text-center font-mono text-lg font-bold">
                      {block.startTime}
                    </div>
                    <button
                      onClick={() => quickAdjust(index, 'start', 15)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm"
                    >
                      +15m
                    </button>
                  </div>
                </div>

                {/* End time controls */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">End Time</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quickAdjust(index, 'end', -15)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm"
                    >
                      -15m
                    </button>
                    <div className="flex-1 text-center font-mono text-lg font-bold">
                      {block.endTime}
                    </div>
                    <button
                      onClick={() => quickAdjust(index, 'end', 15)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm"
                    >
                      +15m
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
