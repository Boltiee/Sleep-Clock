/**
 * Storage tests
 * Note: These tests use mock implementations since IndexedDB isn't available in Node.js
 */

import { getTodayDateString } from '../storage'

// Mock idb module
jest.mock('idb', () => ({
  openDB: jest.fn(),
}))

describe('storage utilities', () => {
  describe('getTodayDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const dateStr = getTodayDateString()
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return consistent format', () => {
      const date1 = getTodayDateString()
      const date2 = getTodayDateString()
      expect(date1).toBe(date2)
    })

    it('should pad month and day with zeros', () => {
      const dateStr = getTodayDateString()
      const [year, month, day] = dateStr.split('-')
      
      expect(year.length).toBe(4)
      expect(month.length).toBe(2)
      expect(day.length).toBe(2)
    })
  })
})

// Integration tests for storage would require a real IndexedDB environment
// These would be better suited for E2E tests with Playwright
describe('storage integration (skipped in unit tests)', () => {
  it.skip('should save and retrieve settings', async () => {
    // This would test saveSettingsLocal and getSettingsLocal
    // Requires IndexedDB environment
  })

  it.skip('should save and retrieve daily state', async () => {
    // This would test saveDailyStateLocal and getDailyStateLocal
    // Requires IndexedDB environment
  })

  it.skip('should save and retrieve profiles', async () => {
    // This would test saveProfileLocal and getProfileLocal
    // Requires IndexedDB environment
  })

  it.skip('should clean up old daily states', async () => {
    // This would test cleanupOldDailyStates
    // Requires IndexedDB environment
  })
})
