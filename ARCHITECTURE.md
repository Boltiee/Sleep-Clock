# Architecture Overview

Detailed technical architecture for the Go To Sleep Clock PWA.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     React App (Next.js)                   │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Pages    │  │  Components  │  │   Contexts      │  │  │
│  │  │  (Routes)  │  │  (UI Logic)  │  │  (App State)    │  │  │
│  │  └─────┬──────┘  └──────┬───────┘  └────────┬────────┘  │  │
│  │        └─────────────────┴──────────────────┬─┘          │  │
│  │                                              │            │  │
│  │  ┌───────────────────────────────────────────▼─────────┐ │  │
│  │  │              Utilities Layer                        │ │  │
│  │  │  • Schedule calculation  • PIN handling             │ │  │
│  │  │  • Storage (IndexedDB)   • Audio system             │ │  │
│  │  │  • Sync logic            • Validation               │ │  │
│  │  └───────────────────┬────────────────┬────────────────┘ │  │
│  │                      │                │                   │  │
│  │                      ▼                ▼                   │  │
│  │            ┌──────────────┐  ┌──────────────┐           │  │
│  │            │  IndexedDB   │  │    Network   │           │  │
│  │            │  (Offline    │  │  (Supabase)  │           │  │
│  │            │   Storage)   │  │              │           │  │
│  │            └──────────────┘  └──────┬───────┘           │  │
│  └───────────────────────────────────────┼──────────────────┘  │
│                                          │                     │
│  ┌──────────────────────────────────────▼───────────────────┐ │
│  │                    Service Worker                         │ │
│  │         (Offline caching, background sync)                │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │         Supabase Backend              │
         │  ┌─────────────┐  ┌────────────────┐ │
         │  │ PostgreSQL  │  │  Realtime      │ │
         │  │  Database   │  │  (WebSocket)   │ │
         │  └─────────────┘  └────────────────┘ │
         │  ┌─────────────┐  ┌────────────────┐ │
         │  │    Auth     │  │  Row Level     │ │
         │  │   System    │  │   Security     │ │
         │  └─────────────┘  └────────────────┘ │
         └───────────────────────────────────────┘
```

## Core Components

### 1. App Context (`contexts/AppContext.tsx`)

**Purpose**: Global state management for the entire application.

**State Managed**:
- Current mode (GET_READY, SLEEP, etc.)
- Profile information
- Settings
- Daily state (chores/books progress)
- Lock status
- Audio status
- Online/offline status
- Test time override

**Key Functions**:
- `setProfile()`: Switch active profile
- `setSettings()`: Update settings and sync to server
- `updateDailyState()`: Update chores/books progress
- `unlock()`/`lock()`: Manage PIN lock state
- `enableAudio()`: Prime audio for iOS
- `refreshSettings()`: Force sync from server

**Realtime Subscriptions**:
- Subscribes to settings changes for active profile
- Updates state when server changes detected
- Fallback polling every 60 seconds

### 2. Schedule System (`lib/schedule.ts`)

**Purpose**: Calculate active mode based on time and schedule.

**Key Functions**:

```typescript
calculateCurrentMode(schedule: ScheduleBlock[], currentTime?: string): Mode
```
- Determines active mode for given time
- Handles overnight blocks (end < start)
- Used for mode screen display

```typescript
validateSchedule(schedule: ScheduleBlock[]): { valid: boolean, errors: string[] }
```
- Checks for overlaps
- Checks for gaps
- Validates time format

```typescript
timeToMinutes(time: string): number
```
- Converts HH:mm to minutes since midnight
- Used for time comparisons

**Overnight Block Handling**:
```typescript
if (endMinutes < startMinutes) {
  // Overnight block (e.g., 19:00 - 06:30)
  if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
    return block.mode
  }
}
```

### 3. Storage Layer (`lib/storage.ts`)

**Purpose**: IndexedDB wrapper for offline persistence.

**Object Stores**:
- `settings`: Key = profileId
- `dailyState`: Key = [profileId, date]
- `profiles`: Key = profileId
- `metadata`: Key = string (flexible)

**Key Operations**:

```typescript
// Settings
saveSettingsLocal(settings: Settings): Promise<void>
getSettingsLocal(profileId: string): Promise<Settings | null>

// Daily State
saveDailyStateLocal(dailyState: DailyState): Promise<void>
getDailyStateLocal(profileId: string, date: string): Promise<DailyState | null>

// Profiles
saveProfileLocal(profile: Profile): Promise<void>
getAllProfilesLocal(): Promise<Profile[]>

// Metadata
setMetadata(key: string, value: any): Promise<void>
getMetadata(key: string): Promise<any>
```

**Cleanup**:
- Automatically removes daily states older than 30 days
- Prevents database bloat

### 4. Sync Layer (`lib/sync.ts`)

**Purpose**: Bidirectional sync between local storage and Supabase.

**Sync Strategy**:
1. **Read Priority**: Try server first, fall back to local
2. **Write Strategy**: Write to server, always cache locally
3. **Conflict Resolution**: Server wins for settings, local wins for in-progress state

**Key Functions**:

```typescript
syncSettingsFromServer(profileId: string): Promise<Settings | null>
```
- Fetches settings from Supabase
- Caches locally
- Returns local cache on error

```typescript
syncSettingsToServer(settings: Settings): Promise<void>
```
- Writes to Supabase (upsert)
- Caches locally regardless of network result
- Fails gracefully

```typescript
subscribeToSettingsChanges(profileId: string, callback: (settings: Settings) => void)
```
- Creates Realtime subscription
- Calls callback when settings change
- Returns channel for unsubscribe

**Realtime Flow**:
```
1. Parent changes settings on phone
2. Supabase receives update
3. Realtime broadcast to subscribed clients
4. iPad receives update via WebSocket
5. Callback updates React state
6. UI re-renders with new settings
```

### 5. PIN System (`lib/pin.ts`)

**Purpose**: Secure PIN storage and verification.

**Security**:
- bcrypt hashing with 10 rounds
- Never stores plaintext PIN
- Constant-time comparison

**Functions**:

```typescript
hashPin(pin: string): Promise<string>
```
- Hashes 4-digit PIN
- Returns bcrypt hash string

```typescript
verifyPin(pin: string, hash: string): Promise<boolean>
```
- Compares PIN against hash
- Returns true if match

```typescript
isValidPinFormat(pin: string): boolean
```
- Validates PIN is exactly 4 digits
- Used in UI validation

### 6. Audio System (`lib/audio.ts`)

**Purpose**: Play sounds with iOS compatibility.

**iOS Constraints**:
- Audio requires user gesture to unlock
- Auto-play is blocked
- WebAudio context must be resumed

**Priming Flow**:
1. User unlocks with PIN (gesture)
2. Show "Enable Sounds" prompt
3. User taps button (another gesture)
4. Call `primeAudio()`
5. Audio now works for rest of session

**Sound Types**:

```typescript
playChime(volume: number): Promise<void>
```
- Pleasant 3-note chime (C5, E5, G5)
- Plays at mode transitions
- Oscillator-based (offline-compatible)

```typescript
playCelebration(volume: number): Promise<void>
```
- 4-note ascending scale
- Plays when chores complete
- More upbeat than chime

### 7. PWA Configuration

**Manifest** (`public/manifest.json`):
```json
{
  "display": "fullscreen",
  "orientation": "any",
  "start_url": "/",
  "scope": "/"
}
```

**Service Worker** (via next-pwa):
- Caches all static assets
- Network-first strategy for API calls
- Offline fallback

**Caching Strategy**:
```javascript
{
  urlPattern: /^https?.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'offlineCache',
    expiration: {
      maxEntries: 200
    }
  }
}
```

## Data Flow Patterns

### 1. Initial Load

```
User opens app
  ↓
Check for profile in metadata
  ↓
Yes → Load profile, settings, daily state from IndexedDB
  ↓     Display main screen
  ↓
No → Redirect to /setup
```

### 2. Settings Update (Multi-Device)

```
Parent (Phone):
  Changes setting
    ↓
  Calls setSettings()
    ↓
  syncSettingsToServer()
    ↓
  Supabase receives update
    ↓
  Realtime broadcasts

iPad:
  Subscribed to settings changes
    ↓
  Receives broadcast via WebSocket
    ↓
  Callback updates AppContext state
    ↓
  React re-renders
    ↓
  New settings applied immediately
```

### 3. Chores Flow

```
Child taps chore
  ↓
handleChoreToggle(choreId)
  ↓
updateDailyState({ choresDone: [...] })
  ↓
syncDailyStateToServer() & saveDailyStateLocal()
  ↓
React state updates
  ↓
UI shows checkmark
  ↓
All chores done?
  ↓
Yes → Show confetti + reward card
  ↓
Claim reward → Show books counter
  ↓
3 books complete → "Ready for sleep"
```

### 4. Mode Transition

```
Clock ticks to new mode time
  ↓
calculateCurrentMode() detects change
  ↓
AppContext updates currentMode state
  ↓
ModeScreen re-renders with new color/mode
  ↓
If GET_READY or SLEEP:
  ↓
  Play chime (if enabled)
  ↓
If SLEEP and Tonie enabled:
  ↓
  Show Tonie chooser
```

### 5. Offline → Online Transition

```
Device goes offline
  ↓
App continues with cached data
  ↓
User makes changes (complete chores)
  ↓
Changes saved to IndexedDB
  ↓
syncToServer() fails silently
  ↓
Device comes online
  ↓
Next sync attempt succeeds
  ↓
Local changes pushed to server
  ↓
Server state now matches local
```

## Performance Considerations

### 1. Minimize Re-renders

**Strategy**: Context splitting
- Could split AppContext into multiple contexts (SettingsContext, StateContext)
- Current approach keeps it simple for smaller app

**Optimization**:
```typescript
const memoizedValue = useMemo(() => ({
  currentMode,
  settings,
  // ... other values
}), [currentMode, settings, ...])
```

### 2. Efficient Storage Access

**IndexedDB Best Practices**:
- Single DB instance (singleton pattern)
- Batch operations when possible
- Use indexes for queries

### 3. Network Efficiency

**Realtime vs Polling**:
- Realtime: WebSocket (persistent connection, instant updates)
- Polling fallback: HTTP requests every 60s (backup only)

**Bandwidth**:
- Settings: ~5KB per sync
- Daily state: ~1KB per sync
- Minimal overhead

### 4. Bundle Size

**Current Dependencies**:
- Next.js: ~90KB (gzipped)
- React: ~40KB (gzipped)
- Supabase client: ~30KB (gzipped)
- Tailwind (purged): ~10KB (gzipped)
- Total: ~170KB initial load

**Code Splitting**:
```typescript
const { playChime } = await import('@/lib/audio')
```
Audio utilities lazy-loaded only when needed.

## Security Architecture

### 1. Authentication Flow

```
User → Email/Password → Supabase Auth → JWT Token → Row Level Security
```

### 2. Data Access Control

**RLS Policies**:
```sql
-- Users can only see their own profiles
CREATE POLICY "view_own_profiles" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only edit settings for their profiles
CREATE POLICY "edit_own_settings" ON settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = settings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );
```

### 3. Client-Side Security

**PIN Protection**:
- Never sent over network
- Hashed locally before storage
- Verified locally (hash stored in settings)

**Sensitive Data**:
- No sensitive data stored (just preferences)
- Child data is not PII

### 4. Network Security

**HTTPS Only**:
- Enforced by Vercel/Netlify
- Required for PWA

**API Keys**:
- Only `anon` key used (public)
- RLS prevents unauthorized access
- No `service_role` key in client code

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// lib/schedule.test.ts
describe('calculateCurrentMode', () => {
  it('should return SLEEP for time within SLEEP block', () => {
    const schedule = [
      { mode: 'SLEEP', startTime: '19:00', endTime: '06:30' }
    ]
    expect(calculateCurrentMode(schedule, '22:00')).toBe('SLEEP')
  })
  
  it('should handle overnight blocks', () => {
    // ...
  })
})
```

### Integration Tests

- Test complete flows (setup → use → sync)
- Mock Supabase calls
- Test offline scenarios

### Manual Testing Checklist

- [ ] Setup flow (online and local mode)
- [ ] PIN entry (correct and incorrect)
- [ ] Mode transitions
- [ ] Chores completion
- [ ] Books counter
- [ ] Tonie chooser
- [ ] Settings changes
- [ ] Multi-device sync
- [ ] Offline functionality
- [ ] Audio playback

## Monitoring & Observability

### Logging

**Console Logs** (production):
```typescript
console.log('Settings updated from server:', newSettings)
console.error('Error syncing settings:', error)
```

**Recommended**: Add structured logging
```typescript
import { log } from '@/lib/logger'
log.info('settings_updated', { profileId, updatedFields })
```

### Error Tracking

**Recommended**: Sentry or similar
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error, {
  extra: { context: 'settings_sync', profileId }
})
```

### Performance Monitoring

**Web Vitals**:
- Already tracked by Next.js
- View in Vercel Analytics

**Custom Metrics**:
```typescript
performance.mark('settings-sync-start')
// ... sync operation
performance.mark('settings-sync-end')
performance.measure('settings-sync', 'settings-sync-start', 'settings-sync-end')
```

## Scalability

### Current Limits

**Supabase Free Tier**:
- 500MB database (thousands of profiles)
- 2GB bandwidth/month (adequate for small-scale)
- Unlimited API requests

**Hosting (Vercel Free)**:
- 100GB bandwidth (sufficient)
- Serverless functions (not used)

### Scaling Up

**Database**:
- Add indexes for frequently queried fields
- Partition `daily_state` by date if needed
- Archive old data

**Realtime Connections**:
- Supabase handles 200+ concurrent connections on free tier
- Upgrade for more

**CDN**:
- Static assets already cached
- No additional CDN needed

## Future Enhancements

### Potential Features

1. **Multiple Profiles Per Device**
   - Profile switcher UI
   - Family management

2. **Analytics Dashboard**
   - Track chores completion rate
   - Sleep schedule adherence

3. **Tonie Image Uploads**
   - Supabase Storage integration
   - Image optimization

4. **Voice Announcements**
   - Web Speech API
   - "Time for bed!" announcements

5. **Customizable Themes**
   - Dark mode
   - Custom fonts
   - Background images

### Technical Improvements

1. **TypeScript Strictness**
   - Enable `strict: true` fully
   - Remove any `any` types

2. **Testing**
   - Jest + React Testing Library
   - E2E with Playwright

3. **Performance**
   - Context splitting
   - React.memo for expensive components
   - Virtual scrolling for long lists

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

---

Questions? Open a GitHub discussion.

