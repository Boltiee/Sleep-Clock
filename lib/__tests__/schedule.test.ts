import {
  timeToMinutes,
  getCurrentTime,
  calculateCurrentMode,
  validateSchedule,
  getNextTransitionTime,
  checkModeTransition,
} from '../schedule'
import { ScheduleBlock } from '@/types'

describe('schedule utilities', () => {
  describe('timeToMinutes', () => {
    it('should convert time to minutes correctly', () => {
      expect(timeToMinutes('00:00')).toBe(0)
      expect(timeToMinutes('00:30')).toBe(30)
      expect(timeToMinutes('01:00')).toBe(60)
      expect(timeToMinutes('12:30')).toBe(750)
      expect(timeToMinutes('23:59')).toBe(1439)
    })

    it('should handle leading zeros', () => {
      expect(timeToMinutes('09:05')).toBe(545)
      expect(timeToMinutes('00:01')).toBe(1)
    })
  })

  describe('getCurrentTime', () => {
    it('should return current time in HH:mm format', () => {
      const time = getCurrentTime()
      expect(time).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should use test time override when provided', () => {
      expect(getCurrentTime('15:30')).toBe('15:30')
      expect(getCurrentTime('09:00')).toBe('09:00')
    })

    it('should ignore null override', () => {
      const time = getCurrentTime(null)
      expect(time).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('calculateCurrentMode', () => {
    const testSchedule: ScheduleBlock[] = [
      { mode: 'GET_READY', startTime: '18:00', endTime: '19:00' },
      { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' },
      { mode: 'ALMOST_WAKE', startTime: '06:30', endTime: '07:00' },
      { mode: 'WAKE', startTime: '07:00', endTime: '18:00' },
    ]

    it('should return correct mode for normal (same-day) blocks', () => {
      expect(calculateCurrentMode(testSchedule, '18:30')).toBe('GET_READY')
      expect(calculateCurrentMode(testSchedule, '10:00')).toBe('WAKE')
      expect(calculateCurrentMode(testSchedule, '06:45')).toBe('ALMOST_WAKE')
    })

    it('should handle overnight blocks correctly', () => {
      // SLEEP block: 19:00 - 06:30 (overnight)
      expect(calculateCurrentMode(testSchedule, '19:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '22:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '23:59')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '00:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '03:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '06:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '06:29')).toBe('SLEEP')
    })

    it('should handle transitions correctly', () => {
      expect(calculateCurrentMode(testSchedule, '18:00')).toBe('GET_READY')
      expect(calculateCurrentMode(testSchedule, '19:00')).toBe('SLEEP')
      expect(calculateCurrentMode(testSchedule, '06:30')).toBe('ALMOST_WAKE')
      expect(calculateCurrentMode(testSchedule, '07:00')).toBe('WAKE')
    })

    it('should return WAKE as fallback if no match', () => {
      const emptySchedule: ScheduleBlock[] = []
      expect(calculateCurrentMode(emptySchedule, '12:00')).toBe('WAKE')
    })

    it('should work with unsorted schedule', () => {
      const unsortedSchedule: ScheduleBlock[] = [
        { mode: 'WAKE', startTime: '07:00', endTime: '18:00' },
        { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' },
        { mode: 'GET_READY', startTime: '18:00', endTime: '19:00' },
        { mode: 'ALMOST_WAKE', startTime: '06:30', endTime: '07:00' },
      ]
      expect(calculateCurrentMode(unsortedSchedule, '18:30')).toBe('GET_READY')
      expect(calculateCurrentMode(unsortedSchedule, '22:00')).toBe('SLEEP')
    })
  })

  describe('validateSchedule', () => {
    it('should validate correct schedule', () => {
      const validSchedule: ScheduleBlock[] = [
        { mode: 'GET_READY', startTime: '18:00', endTime: '19:00' },
        { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' },
        { mode: 'ALMOST_WAKE', startTime: '06:30', endTime: '07:00' },
        { mode: 'WAKE', startTime: '07:00', endTime: '18:00' },
      ]
      const result = validateSchedule(validSchedule)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty schedule', () => {
      const result = validateSchedule([])
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Schedule must have at least one block')
    })

    it('should detect invalid time format', () => {
      const invalidSchedule: ScheduleBlock[] = [
        { mode: 'WAKE', startTime: '7:00', endTime: '18:00' }, // Missing leading zero
      ]
      const result = validateSchedule(invalidSchedule)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid start time format'))).toBe(true)
    })

    it('should detect gaps between blocks', () => {
      const scheduleWithGap: ScheduleBlock[] = [
        { mode: 'WAKE', startTime: '07:00', endTime: '18:00' },
        { mode: 'GET_READY', startTime: '18:30', endTime: '19:00' }, // 30 min gap
      ]
      const result = validateSchedule(scheduleWithGap)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Gap detected'))).toBe(true)
    })

    it('should detect overlaps between blocks', () => {
      const scheduleWithOverlap: ScheduleBlock[] = [
        { mode: 'WAKE', startTime: '07:00', endTime: '18:30' },
        { mode: 'GET_READY', startTime: '18:00', endTime: '19:00' }, // 30 min overlap
      ]
      const result = validateSchedule(scheduleWithOverlap)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Overlap detected'))).toBe(true)
    })
  })

  describe('checkModeTransition', () => {
    it('should detect mode transitions', () => {
      expect(checkModeTransition('WAKE', 'GET_READY')).toBe(true)
      expect(checkModeTransition('GET_READY', 'SLEEP')).toBe(true)
      expect(checkModeTransition('SLEEP', 'ALMOST_WAKE')).toBe(true)
    })

    it('should return false for same mode', () => {
      expect(checkModeTransition('WAKE', 'WAKE')).toBe(false)
      expect(checkModeTransition('SLEEP', 'SLEEP')).toBe(false)
    })
  })

  describe('getNextTransitionTime', () => {
    const testSchedule: ScheduleBlock[] = [
      { mode: 'GET_READY', startTime: '18:00', endTime: '19:00' },
      { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' },
      { mode: 'ALMOST_WAKE', startTime: '06:30', endTime: '07:00' },
      { mode: 'WAKE', startTime: '07:00', endTime: '18:00' },
    ]

    it('should return next transition time', () => {
      const result = getNextTransitionTime(testSchedule, '10:00')
      expect(result).not.toBeNull()
      expect(result?.mode).toBe('GET_READY')
      expect(result?.time).toBe('18:00')
    })

    it('should return null for empty schedule', () => {
      const result = getNextTransitionTime([], '10:00')
      expect(result).toBeNull()
    })
  })
})
