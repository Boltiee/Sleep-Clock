let audioContext: AudioContext | null = null
let audioPrimed = false

/**
 * Initialize audio context (must be called from user interaction)
 */
export async function primeAudio(): Promise<void> {
  if (audioPrimed) return

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    // Resume audio context if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    // Play a silent sound to unlock audio on iOS
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.01)

    audioPrimed = true
    console.log('Audio primed successfully')
  } catch (err) {
    console.error('Error priming audio:', err)
  }
}

/**
 * Play a chime sound
 */
export async function playChime(volume: number = 50): Promise<void> {
  if (!audioPrimed || !audioContext) {
    console.warn('Audio not primed yet')
    return
  }

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Set volume (0-100 to 0-1)
    gainNode.gain.value = volume / 100

    // Create a pleasant chime sound (multiple notes)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // G5

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Fade out
    gainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.8
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.8)
  } catch (err) {
    console.error('Error playing chime:', err)
  }
}

/**
 * Play a celebration sound
 */
export async function playCelebration(volume: number = 50): Promise<void> {
  if (!audioPrimed || !audioContext) {
    console.warn('Audio not primed yet')
    return
  }

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const duration = 0.15

    for (let i = 0; i < notes.length; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      gainNode.gain.value = (volume / 100) * 0.8
      oscillator.type = 'sine'
      oscillator.frequency.value = notes[i]

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const startTime = audioContext.currentTime + i * duration
      const stopTime = startTime + duration

      oscillator.start(startTime)
      oscillator.stop(stopTime)

      // Fade out
      gainNode.gain.setValueAtTime(
        (volume / 100) * 0.8,
        startTime
      )
      gainNode.gain.exponentialRampToValueAtTime(0.01, stopTime)
    }
  } catch (err) {
    console.error('Error playing celebration:', err)
  }
}

/**
 * Check if audio is primed
 */
export function isAudioPrimed(): boolean {
  return audioPrimed
}

