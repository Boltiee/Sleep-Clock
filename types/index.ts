// Core mode types
export type Mode = 'GET_READY' | 'SLEEP' | 'ALMOST_WAKE' | 'WAKE'

// Schedule block
export interface ScheduleBlock {
  mode: Mode
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

// Colors configuration
export interface ColorConfig {
  GET_READY: string
  SLEEP: string
  ALMOST_WAKE: string
  WAKE: string
}

// Dim overlay configuration (0-80% opacity for all modes)
export interface DimConfig {
  dimLevel: number // Single dim level applied to all modes (0-80%)
  nightDimEnabled: boolean // Quick night dim toggle (adds 20%)
  autoDimAfterRoutine: boolean // Auto-dim deeper after chores/books
}

// Chore item
export interface Chore {
  id: string
  text: string
  emoji?: string
}

// Tonie character
export interface Tonie {
  id: string
  name: string
  emoji: string
  imageUrl?: string
}

// Settings for a profile
export interface Settings {
  profileId: string
  schedule: ScheduleBlock[]
  colors: ColorConfig
  colorTheme: string // Theme name: 'watercolor', 'pastel', 'sunset', etc. or 'custom'
  dim: DimConfig
  choresEnabled: boolean
  chores: Chore[]
  rewardText: string
  tonieEnabled: boolean
  tonieList: Tonie[]
  tonieChooserDuration: number // seconds, 0 = wait until chosen
  lastTonieId: string | null
  soundEnabled: boolean
  soundVolume: number // 0-100
  showClock: boolean
  pinHash: string
  updatedAt?: string
}

// Daily state (progress for chores/books)
export interface DailyState {
  profileId: string
  date: string // yyyy-mm-dd
  choresDone: string[] // array of chore IDs
  booksCount: number // 0-3
  lastCompletedStep: 'none' | 'chores' | 'reward-claimed' | 'books' | 'ready-for-sleep'
  updatedAt?: string
}

// Profile
export interface Profile {
  id: string
  userId: string
  name: string
  createdAt?: string
}

// Current app state
export interface AppState {
  currentMode: Mode
  profile: Profile | null
  settings: Settings | null
  dailyState: DailyState | null
  isLocked: boolean
  audioPrimed: boolean
  lastSyncTime: Date | null
  isOnline: boolean
  testTimeOverride: string | null // HH:mm for testing
}

// Default configurations
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { mode: 'GET_READY', startTime: '18:30', endTime: '19:00' },
  { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' },
  { mode: 'ALMOST_WAKE', startTime: '06:30', endTime: '07:00' },
  { mode: 'WAKE', startTime: '07:00', endTime: '18:30' },
]

export const DEFAULT_COLORS: ColorConfig = {
  GET_READY: '#9FB8E8', // Soft periwinkle blue (watercolor theme)
  SLEEP: '#C19EB8', // Muted mauve
  ALMOST_WAKE: '#F4C896', // Soft peachy-yellow
  WAKE: '#A8D8B8', // Soft sage green
}

export const DEFAULT_DIM: DimConfig = {
  dimLevel: 40, // Single dim level for all modes
  nightDimEnabled: false,
  autoDimAfterRoutine: true,
}

export const DEFAULT_CHORES: Chore[] = [
  { id: 'chore-1', text: 'Water plant', emoji: '🌱' },
  { id: 'chore-2', text: 'Brush teeth', emoji: '🪥' },
  { id: 'chore-3', text: 'Clean lounge room', emoji: '🧹' },
]

export const DEFAULT_TONIES: Tonie[] = [
  { id: 'tonie-1', name: 'Creative Tonie', emoji: '🎨' },
  { id: 'tonie-2', name: 'Elsa', emoji: '❄️' },
  { id: 'tonie-3', name: 'Lightning McQueen', emoji: '🏎️' },
  { id: 'tonie-4', name: 'Benjamin Blümchen', emoji: '🐘' },
]

// Mode display configuration
export interface ModeDisplay {
  icon: string
  title: string
  subtitle: string
}

export const MODE_DISPLAYS: Record<Mode, ModeDisplay> = {
  GET_READY: {
    icon: '🌙',
    title: 'Bedtime Jobs',
    subtitle: 'Time to get ready for sleep',
  },
  SLEEP: {
    icon: '😴',
    title: 'Sleep Time',
    subtitle: 'Good night, sweet dreams',
  },
  ALMOST_WAKE: {
    icon: '🌅',
    title: 'Almost Time',
    subtitle: 'Nearly time to wake up',
  },
  WAKE: {
    icon: '☀️',
    title: 'Good Morning!',
    subtitle: 'Time to start the day',
  },
}

