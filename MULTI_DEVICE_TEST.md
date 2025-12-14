# Multi-Device Sync Testing Guide

## ✅ What's Implemented

Your Go To Sleep Clock now has **full multi-device synchronization** via Supabase:

### Synced Data
- ✅ Settings (schedule, colors, theme, dim, chores, tonies, sounds)
- ✅ Daily state (chores completed, books read)
- ✅ Profile information
- ✅ Real-time updates across devices
- ✅ Offline support with automatic sync when back online

### How It Works
1. **Real-time subscriptions** - Changes on one device instantly appear on others
2. **Fallback polling** - Every 60 seconds, checks for updates (if realtime fails)
3. **Local-first** - Works offline, syncs when connection returns
4. **Conflict resolution** - Last-write-wins strategy

---

## 🧪 How to Test Multi-Device Sync

### Prerequisites
- Supabase configured (check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Account created and logged in
- At least 2 devices or browser windows

### Test Scenario 1: Settings Sync
1. **Device A:** Open settings, change a color theme (e.g., from Water Color to Ocean)
2. **Device A:** Click "Save Changes"
3. **Device B:** Wait 1-2 seconds
4. **Device B:** Should automatically show the new color theme
5. **✅ Pass if:** Colors update on Device B without refresh

### Test Scenario 2: Schedule Changes
1. **Device A:** Open settings → Schedule tab
2. **Device A:** Adjust a time (e.g., change sleep time from 19:00 to 19:30)
3. **Device A:** Save
4. **Device B:** Check the mode screen - should reflect new schedule
5. **✅ Pass if:** Device B shows correct mode based on new schedule

### Test Scenario 3: Chores Real-Time Sync
1. **Device A:** In GET_READY mode, check off a chore
2. **Device B:** Wait 1-2 seconds
3. **Device B:** Should show the same chore as completed
4. **✅ Pass if:** Chore state syncs without refresh

### Test Scenario 4: Dim Level Sync
1. **Device A:** Settings → Dim tab
2. **Device A:** Change dim level from 40% to 60%
3. **Device A:** Save
4. **Device B:** Should see screen get dimmer within 1-2 seconds
5. **✅ Pass if:** Dim overlay updates automatically

### Test Scenario 5: Offline to Online
1. **Device A:** Turn off WiFi/mobile data
2. **Device A:** Change some settings (they save locally)
3. **Device A:** Turn WiFi back on
4. **Device A:** Wait 5 seconds
5. **Device B:** Should see the changes appear
6. **✅ Pass if:** Settings sync after reconnection

### Test Scenario 6: Emoji & Theme Sync (NEW!)
1. **Device A:** Settings → Chores
2. **Device A:** Add a new chore "Brush teeth", click 🔄 or ✨ to get emoji
3. **Device A:** Save
4. **Device B:** Settings → Chores
5. **Device B:** Should see the new chore with its emoji
6. **✅ Pass if:** New chore appears with emoji on Device B

---

## 🔍 Debugging Multi-Device Issues

### Check Console Logs
Open browser DevTools → Console and look for:
- ✅ `"Settings updated from server:"` - Real-time updates working
- ✅ `"Settings changed:"` - Supabase subscription active
- ❌ `"Error syncing settings"` - Connection or auth problem

### Verify Supabase Connection
1. Check `.env.local` has correct credentials
2. Visit Supabase dashboard → Table Editor
3. Check `settings` table has your profile data
4. Check `updated_at` timestamp changes when you save

### Real-time Not Working?
If changes don't appear instantly:
- **Wait 60 seconds** - Fallback polling will catch it
- **Check browser console** for WebSocket errors
- **Verify Supabase** realtime is enabled in project settings
- **Check firewall** - Some networks block WebSocket connections

### Settings Not Syncing At All?
1. Check `isSupabaseConfigured` is `true` (see browser console)
2. Verify user is authenticated (not in local mode)
3. Check network tab for API calls to Supabase
4. Verify database schema matches (see migrations)

---

## 🚀 Performance Notes

- **Initial load:** Fetches from server, caches locally
- **Updates:** Real-time via WebSocket (< 1 second)
- **Fallback:** Polling every 60 seconds
- **Offline:** Uses local cache, syncs when online
- **Conflict:** Last write wins (newer `updated_at` timestamp)

---

## 📊 What's Been Fixed (Latest)

### ✅ Recent Improvements
- Fixed `colorTheme` not syncing to server (was only reading, not writing)
- All 7 theme presets now sync correctly across devices
- Simplified dim config syncs with single `dimLevel` value
- Settings migration ensures old devices upgrade smoothly

---

## 🎯 Expected Behavior

| Action | Device A | Device B | Sync Time |
|--------|----------|----------|-----------|
| Change color theme | Saves | Updates automatically | < 2 sec |
| Adjust schedule | Saves | Mode changes automatically | < 2 sec |
| Toggle chore | Checks off | Shows checked | < 2 sec |
| Add new chore | Appears | Appears | < 2 sec |
| Change dim level | Screen dims | Screen dims | < 2 sec |
| Offline changes | Saves locally | No change | On reconnect |

---

## 💡 Tips for Best Experience

1. **Keep devices online** for instant sync
2. **Use same account** on all devices
3. **Wait 1-2 seconds** after saving for sync to complete
4. **Check console logs** if something seems wrong
5. **Refresh page** as last resort (shouldn't be needed)

---

## 🐛 Known Limitations

- **Simultaneous edits:** Last save wins (no merge)
- **Network delays:** May take a few seconds on slow connections
- **Local mode:** No sync if Supabase not configured (works offline-only)
- **Auth required:** Must be logged in for sync to work

---

## ✨ Your Setup Status

Based on your code:
- ✅ Supabase client configured
- ✅ Real-time subscriptions active
- ✅ Fallback polling every 60 seconds
- ✅ Local-first with offline support
- ✅ Settings migration for schema changes
- ✅ colorTheme now syncs correctly!

**Everything is ready for multi-device use!** 🎉
