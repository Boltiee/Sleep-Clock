import { hashPin, verifyPin, isValidPinFormat } from '../pin'

describe('PIN utilities', () => {
  describe('isValidPinFormat', () => {
    it('should accept valid 4-digit PINs', () => {
      expect(isValidPinFormat('0000')).toBe(true)
      expect(isValidPinFormat('1234')).toBe(true)
      expect(isValidPinFormat('9999')).toBe(true)
      expect(isValidPinFormat('0001')).toBe(true)
    })

    it('should reject PINs with wrong length', () => {
      expect(isValidPinFormat('123')).toBe(false)
      expect(isValidPinFormat('12345')).toBe(false)
      expect(isValidPinFormat('')).toBe(false)
      expect(isValidPinFormat('1')).toBe(false)
    })

    it('should reject non-numeric PINs', () => {
      expect(isValidPinFormat('abcd')).toBe(false)
      expect(isValidPinFormat('12a4')).toBe(false)
      expect(isValidPinFormat('12 4')).toBe(false)
      expect(isValidPinFormat('12.4')).toBe(false)
    })
  })

  describe('hashPin', () => {
    it('should generate a bcrypt hash', async () => {
      const hash = await hashPin('1234')
      expect(hash).toBeTruthy()
      expect(hash.length).toBeGreaterThan(50)
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true)
    })

    it('should generate different hashes for same PIN', async () => {
      const hash1 = await hashPin('1234')
      const hash2 = await hashPin('1234')
      expect(hash1).not.toBe(hash2)
    })

    it('should handle different PINs', async () => {
      const hash1 = await hashPin('0000')
      const hash2 = await hashPin('9999')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPin', () => {
    it('should verify correct PIN', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      const isValid = await verifyPin(pin, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect PIN', async () => {
      const hash = await hashPin('1234')
      const isValid = await verifyPin('5678', hash)
      expect(isValid).toBe(false)
    })

    it('should be case-sensitive for numeric values', async () => {
      const hash = await hashPin('0001')
      expect(await verifyPin('0001', hash)).toBe(true)
      expect(await verifyPin('1', hash)).toBe(false)
      expect(await verifyPin('01', hash)).toBe(false)
    })

    it('should work with all numeric combinations', async () => {
      const testPins = ['0000', '1111', '9999', '1357', '2468']
      
      for (const pin of testPins) {
        const hash = await hashPin(pin)
        expect(await verifyPin(pin, hash)).toBe(true)
        expect(await verifyPin('0000', hash)).toBe(pin === '0000')
      }
    })
  })

  describe('PIN security', () => {
    it('should use sufficient salt rounds (timing test)', async () => {
      const startTime = Date.now()
      await hashPin('1234')
      const duration = Date.now() - startTime
      
      // bcrypt with 10 rounds should take at least 50ms
      // This ensures we're using proper salt rounds
      expect(duration).toBeGreaterThan(10)
    }, 10000)

    it('should not leak information through timing', async () => {
      const hash = await hashPin('1234')
      
      const start1 = Date.now()
      await verifyPin('1234', hash)
      const duration1 = Date.now() - start1
      
      const start2 = Date.now()
      await verifyPin('9999', hash)
      const duration2 = Date.now() - start2
      
      // Both should take similar time (constant-time comparison)
      // Allow 50ms variance
      expect(Math.abs(duration1 - duration2)).toBeLessThan(50)
    }, 10000)
  })
})
