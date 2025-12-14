import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hash a PIN for secure storage
 */
export async function hashPin(pin: string): Promise<string> {
  return await bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pin, hash)
}

/**
 * Validate PIN format (4 digits)
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

