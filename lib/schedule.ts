import { Mode, ScheduleBlock } from '@/types'

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTime(testTimeOverride?: string | null): string {
  if (testTimeOverride) {
    return testTimeOverride
  }
  
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Calculate current mode based on schedule and time
 * Handles overnight blocks where end < start (wraps past midnight)
 */
export function calculateCurrentMode(
  schedule: ScheduleBlock[],
  currentTime?: string
): Mode {
  const time = currentTime || getCurrentTime()
  const currentMinutes = timeToMinutes(time)
  
  // Sort schedule by start time
  const sortedSchedule = [...schedule].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )
  
  // Find active block
  for (const block of sortedSchedule) {
    const startMinutes = timeToMinutes(block.startTime)
    const endMinutes = timeToMinutes(block.endTime)
    
    if (endMinutes < startMinutes) {
      // Overnight block (wraps past midnight)
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return block.mode
      }
    } else {
      // Normal block (same day)
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return block.mode
      }
    }
  }
  
  // Fallback to WAKE if no match
  return 'WAKE'
}

/**
 * Check if we just transitioned into a new mode
 */
export function checkModeTransition(
  previousMode: Mode,
  currentMode: Mode
): boolean {
  return previousMode !== currentMode
}

/**
 * Validate schedule blocks for overlaps or gaps
 */
export function validateSchedule(schedule: ScheduleBlock[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (schedule.length === 0) {
    errors.push('Schedule must have at least one block')
    return { valid: false, errors }
  }
  
  // Check for valid time format
  for (const block of schedule) {
    if (!/^\d{2}:\d{2}$/.test(block.startTime)) {
      errors.push(`Invalid start time format: ${block.startTime}`)
    }
    if (!/^\d{2}:\d{2}$/.test(block.endTime)) {
      errors.push(`Invalid end time format: ${block.endTime}`)
    }
  }
  
  // Sort by start time
  const sorted = [...schedule].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )
  
  // Check for gaps (basic check - more complex validation could be added)
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    
    const currentEnd = timeToMinutes(current.endTime)
    const nextStart = timeToMinutes(next.startTime)
    
    // For non-overnight blocks, check if they connect properly
    if (currentEnd < timeToMinutes(current.startTime)) {
      // Current block is overnight, skip detailed gap check
      continue
    }
    
    if (currentEnd !== nextStart && currentEnd < nextStart) {
      errors.push(`Gap detected between ${current.endTime} and ${next.startTime}`)
    }
    
    if (currentEnd > nextStart) {
      errors.push(`Overlap detected: ${current.mode} ends at ${current.endTime} but ${next.mode} starts at ${next.startTime}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get next mode transition time
 */
export function getNextTransitionTime(
  schedule: ScheduleBlock[],
  currentTime?: string
): { mode: Mode; time: string } | null {
  const time = currentTime || getCurrentTime()
  const currentMinutes = timeToMinutes(time)
  const currentMode = calculateCurrentMode(schedule, time)
  
  // Find current block
  const currentBlock = schedule.find(block => {
    const startMinutes = timeToMinutes(block.startTime)
    const endMinutes = timeToMinutes(block.endTime)
    
    if (endMinutes < startMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes
    }
  })
  
  if (!currentBlock) return null
  
  // Find next block
  const sorted = [...schedule].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )
  
  const currentIndex = sorted.findIndex(b => b.mode === currentBlock.mode)
  const nextBlock = sorted[(currentIndex + 1) % sorted.length]
  
  return {
    mode: nextBlock.mode,
    time: nextBlock.startTime,
  }
}

