'use client'

import { useState } from 'react'

interface PinPadProps {
  onSuccess: () => void
  onCancel?: () => void
  title?: string
  subtitle?: string
}

export default function PinPad({ onSuccess, onCancel, title, subtitle }: PinPadProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')

      if (newPin.length === 4) {
        verifyPin(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const verifyPin = async (pinToVerify: string) => {
    setIsVerifying(true)

    try {
      // Import dynamically to avoid SSR issues
      const { verifyPin: verifyPinFn } = await import('@/lib/pin')
      const { getSettingsLocal } = await import('@/lib/storage')
      const { getMetadata } = await import('@/lib/storage')

      // Get current profile ID
      const currentProfileId = await getMetadata('currentProfileId')
      
      if (!currentProfileId) {
        setError('No profile selected')
        setPin('')
        setIsVerifying(false)
        return
      }

      // Get settings for the profile
      const settings = await getSettingsLocal(currentProfileId)
      
      if (!settings) {
        setError('Settings not found')
        setPin('')
        setIsVerifying(false)
        return
      }

      // Verify PIN
      const isValid = await verifyPinFn(pinToVerify, settings.pinHash)

      if (isValid) {
        onSuccess()
      } else {
        setError('Incorrect PIN')
        setPin('')
      }
    } catch (err) {
      console.error('Error verifying PIN:', err)
      setError('Error verifying PIN')
      setPin('')
    } finally {
      setIsVerifying(false)
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#4A8484] to-[#78B8D8] p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {title || 'Enter PIN'}
        </h1>
        {subtitle && (
          <p className="text-center text-gray-600 mb-6">{subtitle}</p>
        )}

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < pin.length
                  ? 'scale-110'
                  : 'bg-gray-300'
              }`}
              style={i < pin.length ? { backgroundColor: '#6FB8B8' } : {}}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* PIN pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {digits.map((digit, index) => {
            if (digit === '') {
              return <div key={index} />
            }

            if (digit === '⌫') {
              return (
                <button
                  key={index}
                  onClick={handleBackspace}
                  disabled={isVerifying || pin.length === 0}
                  className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold text-gray-700 rounded-2xl h-16 transition-colors active:scale-95"
                >
                  {digit}
                </button>
              )
            }

            return (
              <button
                key={index}
                onClick={() => handleDigit(digit)}
                disabled={isVerifying || pin.length >= 4}
                className="bg-[#6FB8B8] hover:bg-[#5CA5A5] disabled:opacity-50 disabled:cursor-not-allowed text-3xl font-bold text-white rounded-2xl h-16 transition-colors active:scale-95"
              >
                {digit}
              </button>
            )
          })}
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isVerifying}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}

        {isVerifying && (
          <p className="text-center text-gray-600 mt-4">Verifying...</p>
        )}
      </div>
    </div>
  )
}

