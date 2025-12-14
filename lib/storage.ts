import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Settings, DailyState, Profile } from '@/types'

interface SleepClockDB extends DBSchema {
  settings: {
    key: string
    value: Settings
  }
  dailyState: {
    key: string
    value: DailyState
    indexes: { 'by-profile': string }
  }
  profiles: {
    key: string
    value: Profile
  }
  metadata: {
    key: string
    value: any
  }
}

let dbPromise: Promise<IDBPDatabase<SleepClockDB>> | null = null

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SleepClockDB>('sleep-clock-db', 3, {
      upgrade(db, oldVersion) {
        // Create object stores
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'profileId' })
        }
        
        // Recreate dailyState store if upgrading from version 1
        if (oldVersion < 2 && db.objectStoreNames.contains('dailyState')) {
          db.deleteObjectStore('dailyState')
        }
        if (!db.objectStoreNames.contains('dailyState')) {
          const dailyStateStore = db.createObjectStore('dailyState')
          dailyStateStore.createIndex('by-profile', 'profileId')
        }
        
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata')
        }
      },
    })
  }
  return dbPromise
}

/**
 * Migrate settings from old DimConfig structure to new
 */
function migrateSettings(settings: any): Settings {
  // Check if dim config needs migration (has per-mode values)
  if (settings.dim && typeof settings.dim.GET_READY === 'number') {
    // Old structure - migrate to new
    const oldDim = settings.dim
    const avgDim = Math.round((
      (oldDim.GET_READY || 0) +
      (oldDim.SLEEP || 40) +
      (oldDim.ALMOST_WAKE || 20) +
      (oldDim.WAKE || 0)
    ) / 4)
    
    settings.dim = {
      dimLevel: avgDim,
      nightDimEnabled: oldDim.nightDimEnabled || false,
      autoDimAfterRoutine: oldDim.autoDimAfterRoutine !== false,
    }
  }
  
  // Add colorTheme if missing (default to 'watercolor' for new, 'custom' for existing)
  if (!settings.colorTheme) {
    // If colors match default watercolor, use that theme
    const isDefaultColors = 
      settings.colors?.GET_READY === '#9FB8E8' &&
      settings.colors?.SLEEP === '#C19EB8' &&
      settings.colors?.ALMOST_WAKE === '#F4C896' &&
      settings.colors?.WAKE === '#A8D8B8'
    
    settings.colorTheme = isDefaultColors ? 'watercolor' : 'custom'
  }
  
  return settings as Settings
}

// Settings storage
export async function saveSettingsLocal(settings: Settings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}

export async function getSettingsLocal(profileId: string): Promise<Settings | null> {
  const db = await getDB()
  const settings = await db.get('settings', profileId)
  if (!settings) return null
  
  // Migrate if needed
  const migrated = migrateSettings(settings)
  
  // Save migrated version if changed
  if (JSON.stringify(migrated) !== JSON.stringify(settings)) {
    await db.put('settings', migrated)
  }
  
  return migrated
}

export async function deleteSettingsLocal(profileId: string): Promise<void> {
  const db = await getDB()
  await db.delete('settings', profileId)
}

// Daily state storage
export async function saveDailyStateLocal(dailyState: DailyState): Promise<void> {
  const db = await getDB()
  const key = `${dailyState.profileId}:${dailyState.date}`
  await db.put('dailyState', dailyState, key)
}

export async function getDailyStateLocal(
  profileId: string,
  date: string
): Promise<DailyState | null> {
  const db = await getDB()
  const key = `${profileId}:${date}`
  const dailyState = await db.get('dailyState', key)
  return dailyState || null
}

export async function getAllDailyStatesForProfile(
  profileId: string
): Promise<DailyState[]> {
  const db = await getDB()
  const tx = db.transaction('dailyState', 'readonly')
  const index = tx.store.index('by-profile')
  const states = await index.getAll(profileId)
  return states
}

export async function deleteDailyStateLocal(
  profileId: string,
  date: string
): Promise<void> {
  const db = await getDB()
  const key = `${profileId}:${date}`
  await db.delete('dailyState', key)
}

// Profile storage
export async function saveProfileLocal(profile: Profile): Promise<void> {
  const db = await getDB()
  await db.put('profiles', profile)
}

export async function getProfileLocal(profileId: string): Promise<Profile | null> {
  const db = await getDB()
  const profile = await db.get('profiles', profileId)
  return profile || null
}

export async function getAllProfilesLocal(): Promise<Profile[]> {
  const db = await getDB()
  const profiles = await db.getAll('profiles')
  return profiles
}

export async function deleteProfileLocal(profileId: string): Promise<void> {
  const db = await getDB()
  await db.delete('profiles', profileId)
}

// Metadata storage (last sync time, current profile, etc.)
export async function setMetadata(key: string, value: any): Promise<void> {
  const db = await getDB()
  await db.put('metadata', value, key)
}

export async function getMetadata(key: string): Promise<any> {
  const db = await getDB()
  return await db.get('metadata', key)
}

export async function deleteMetadata(key: string): Promise<void> {
  const db = await getDB()
  await db.delete('metadata', key)
}

// Utility: Get current date string
export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Utility: Clear old daily states (keep last 30 days)
export async function cleanupOldDailyStates(profileId: string): Promise<void> {
  const db = await getDB()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const tx = db.transaction('dailyState', 'readwrite')
  const index = tx.store.index('by-profile')
  const states = await index.getAll(profileId)
  
  for (const state of states) {
    const stateDate = new Date(state.date)
    if (stateDate < thirtyDaysAgo) {
      const key = `${profileId}:${state.date}`
      await tx.store.delete(key)
    }
  }
  
  await tx.done
}

