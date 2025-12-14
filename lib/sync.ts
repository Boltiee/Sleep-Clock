import { supabase, isLocalMode } from './supabase'
import { Settings, DailyState, Profile } from '@/types'
import {
  saveSettingsLocal,
  getSettingsLocal,
  saveDailyStateLocal,
  getDailyStateLocal,
  saveProfileLocal,
  getProfileLocal,
  getAllProfilesLocal,
  setMetadata,
  getMetadata,
} from './storage'

// Sync settings from Supabase to local storage
export async function syncSettingsFromServer(
  profileId: string
): Promise<Settings | null> {
  if (isLocalMode || !supabase) {
    return await getSettingsLocal(profileId)
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    if (error) {
      console.error('Error syncing settings from server:', error)
      // Fall back to local storage
      return await getSettingsLocal(profileId)
    }

    if (data) {
      const settings: Settings = {
        profileId: data.profile_id,
        schedule: data.schedule_json,
        colors: data.colors_json,
        dim: data.dim_json,
        choresEnabled: data.chores_enabled,
        chores: data.chores_json,
        rewardText: data.reward_text,
        tonieEnabled: data.tonie_enabled,
        tonieList: data.tonie_list_json,
        tonieChooserDuration: data.tonie_chooser_duration || 0,
        lastTonieId: data.last_tonie_id,
        soundEnabled: data.sound_enabled,
        soundVolume: data.sound_volume,
        showClock: data.show_clock || false,
        pinHash: data.pin_hash,
        updatedAt: data.updated_at,
      }

      // Save to local storage
      await saveSettingsLocal(settings)
      await setMetadata('lastSyncTime', new Date().toISOString())

      return settings
    }

    return null
  } catch (err) {
    console.error('Exception syncing settings:', err)
    return await getSettingsLocal(profileId)
  }
}

// Sync settings to server
export async function syncSettingsToServer(settings: Settings): Promise<void> {
  if (isLocalMode || !supabase) {
    await saveSettingsLocal(settings)
    return
  }

  try {
    const { error } = await supabase.from('settings').upsert({
      profile_id: settings.profileId,
      schedule_json: settings.schedule,
      colors_json: settings.colors,
      dim_json: settings.dim,
      chores_enabled: settings.choresEnabled,
      chores_json: settings.chores,
      reward_text: settings.rewardText,
      tonie_enabled: settings.tonieEnabled,
      tonie_list_json: settings.tonieList,
      tonie_chooser_duration: settings.tonieChooserDuration,
      last_tonie_id: settings.lastTonieId,
      sound_enabled: settings.soundEnabled,
      sound_volume: settings.soundVolume,
      show_clock: settings.showClock,
      pin_hash: settings.pinHash,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error syncing settings to server:', error)
    }

    // Always save locally
    await saveSettingsLocal(settings)
    await setMetadata('lastSyncTime', new Date().toISOString())
  } catch (err) {
    console.error('Exception syncing settings to server:', err)
    await saveSettingsLocal(settings)
  }
}

// Sync daily state from server
export async function syncDailyStateFromServer(
  profileId: string,
  date: string
): Promise<DailyState | null> {
  if (isLocalMode || !supabase) {
    return await getDailyStateLocal(profileId, date)
  }

  try {
    const { data, error } = await supabase
      .from('daily_state')
      .select('*')
      .eq('profile_id', profileId)
      .eq('date', date)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return null
        return null
      }
      console.error('Error syncing daily state from server:', error)
      return await getDailyStateLocal(profileId, date)
    }

    if (data) {
      const dailyState: DailyState = {
        profileId: data.profile_id,
        date: data.date,
        choresDone: data.chores_done_json,
        booksCount: data.books_count,
        lastCompletedStep: data.last_completed_step,
        updatedAt: data.updated_at,
      }

      await saveDailyStateLocal(dailyState)
      return dailyState
    }

    return null
  } catch (err) {
    console.error('Exception syncing daily state:', err)
    return await getDailyStateLocal(profileId, date)
  }
}

// Sync daily state to server
export async function syncDailyStateToServer(
  dailyState: DailyState
): Promise<void> {
  if (isLocalMode || !supabase) {
    await saveDailyStateLocal(dailyState)
    return
  }

  try {
    const { error } = await supabase.from('daily_state').upsert({
      profile_id: dailyState.profileId,
      date: dailyState.date,
      chores_done_json: dailyState.choresDone,
      books_count: dailyState.booksCount,
      last_completed_step: dailyState.lastCompletedStep,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error syncing daily state to server:', error)
    }

    await saveDailyStateLocal(dailyState)
  } catch (err) {
    console.error('Exception syncing daily state to server:', err)
    await saveDailyStateLocal(dailyState)
  }
}

// Sync profiles from server
export async function syncProfilesFromServer(
  userId: string
): Promise<Profile[]> {
  if (isLocalMode || !supabase) {
    return await getAllProfilesLocal()
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error syncing profiles from server:', error)
      return await getAllProfilesLocal()
    }

    if (data) {
      const profiles: Profile[] = data.map((p) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        createdAt: p.created_at,
      }))

      // Save all profiles locally
      for (const profile of profiles) {
        await saveProfileLocal(profile)
      }

      return profiles
    }

    return []
  } catch (err) {
    console.error('Exception syncing profiles:', err)
    return await getAllProfilesLocal()
  }
}

// Create profile on server
export async function createProfile(
  userId: string,
  name: string,
  forceLocal: boolean = false
): Promise<Profile | null> {
  if (forceLocal || isLocalMode || !supabase) {
    // In local mode, create a local profile
    const profile: Profile = {
      id: `local-${Date.now()}`,
      userId: 'local-user',
      name,
      createdAt: new Date().toISOString(),
    }
    await saveProfileLocal(profile)
    return profile
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    const profile: Profile = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      createdAt: data.created_at,
    }

    await saveProfileLocal(profile)
    return profile
  } catch (err) {
    console.error('Exception creating profile:', err)
    return null
  }
}

// Subscribe to realtime changes
export function subscribeToSettingsChanges(
  profileId: string,
  callback: (settings: Settings) => void
) {
  if (isLocalMode || !supabase) {
    return null
  }

  const channel = supabase
    .channel(`settings-${profileId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'settings',
        filter: `profile_id=eq.${profileId}`,
      },
      async (payload) => {
        console.log('Settings changed:', payload)
        const settings = await syncSettingsFromServer(profileId)
        if (settings) {
          callback(settings)
        }
      }
    )
    .subscribe()

  return channel
}

// Get last sync time
export async function getLastSyncTime(): Promise<Date | null> {
  const lastSyncStr = await getMetadata('lastSyncTime')
  return lastSyncStr ? new Date(lastSyncStr) : null
}

