# Go To Sleep Clock

A production-ready, offline-first Progressive Web App (PWA) designed for iPad as a child's bedtime routine companion. Features an "OK to wake" clock with customizable schedules, interactive chores checklist, book counter, Tonie story chooser, and multi-device parent control.

## ✨ Features

### Core Features
- **4 Mode Screens**: GET_READY, SLEEP, ALMOST_WAKE, WAKE
- **Interactive Bedtime Routine**:
  - Customizable chores checklist with emojis
  - Reward celebration with confetti animation
  - Book counter (0/3) with completion tracking
  - Optional Tonie story chooser
- **Customizable Everything**:
  - Schedule times (supports overnight blocks)
  - Colors per mode
  - Brightness/dim overlay per mode (0-80% opacity)
  - Chores list and reward text
  - Sound chimes at transitions
- **Multi-Device Sync**:
  - Parents control from phone
  - Changes appear on iPad in real-time via Supabase Realtime
  - Offline-first with automatic sync when online
- **PIN Protection**: 4-digit PIN for parent-only settings access
- **iOS Audio Support**: Audio priming flow for iOS restrictions

### PWA Features
- Offline-first architecture with IndexedDB storage
- Service worker for asset caching
- Add to Home Screen support
- Full-screen display mode
- Works without internet after first load

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Storage**: IndexedDB (via `idb`)
- **PWA**: next-pwa
- **Animations**: canvas-confetti

### Why This Architecture?

1. **Next.js App Router**: Modern React framework with excellent PWA support, built-in optimizations, and great DX.

2. **Supabase**: Provides auth, PostgreSQL database, Row Level Security, and Realtime subscriptions out of the box. Perfect for multi-device sync with minimal backend code.

3. **Offline-First Design**: 
   - IndexedDB for local data persistence
   - Settings, daily state, and profiles cached locally
   - App continues functioning without network
   - Automatic sync when online

4. **TypeScript**: Type safety prevents runtime errors, especially important for schedule calculations and state management.

5. **Tailwind CSS**: Utility-first CSS for rapid UI development with consistent design system.

### Data Flow

```
┌─────────────────┐
│  Parent Phone   │
│   (Settings)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Supabase Backend            │
│  (Auth, PostgreSQL, Realtime)       │
└────────┬────────────────────────────┘
         │
         ▼ (Realtime subscription)
┌─────────────────────────────────────┐
│          iPad Display               │
│  (Mode Screen, Chores, Books)       │
│  ↕ IndexedDB (Offline cache)        │
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional - works in Local Mode without it)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Go To Sleep Clock"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

For **Online Mode** (multi-device sync):
- Create a Supabase project at https://supabase.com
- Copy your project URL and anon key to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For **Local Mode** (single device, no sync):
- Leave the Supabase variables blank or omit the `.env.local` file entirely

4. Set up Supabase database (if using Online Mode):

Go to your Supabase project SQL editor and run:
```bash
cat supabase/migrations/001_initial_schema.sql
```

Copy and paste the SQL into the Supabase SQL editor and execute.

5. Run the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

### First-Time Setup

1. Navigate to `/setup`
2. Choose mode:
   - **Online Mode**: Sign up/sign in with email
   - **Local Mode**: Skip auth
3. Create a child profile
4. Set a 4-digit PIN for parent access
5. You're ready!

## 📱 iPad Setup

### 1. Add to Home Screen
1. Open the app in Safari
2. Tap Share button → "Add to Home Screen"
3. Tap "Add"

### 2. Disable Auto-Lock
1. Settings → Display & Brightness → Auto-Lock → **Never**
2. Keep iPad plugged in 24/7

### 3. Enable Guided Access (Optional)
1. Settings → Accessibility → Guided Access → Enable
2. Set a passcode
3. Open Sleep Clock app
4. Triple-click side button → Start

### 4. Adjust Brightness
- Set iPad brightness to 50-70%
- Use app's dim overlay for night-safe display
- Enable "Night Dim" in settings for extra dimming

For detailed instructions, visit `/instructions` in the app.

## 🎨 Customization

### Settings (Parent-Only)
Access settings by long-pressing (3 seconds) the bottom-left corner of the screen, then enter PIN.

#### Schedule Tab
- Set start/end times for each mode
- Supports overnight blocks (e.g., SLEEP 19:00 → 06:30)
- Validates for overlaps and gaps

#### Colors Tab
- Customize background color for each mode
- Uses color picker for easy selection

#### Dim Tab
- Set dim overlay opacity per mode (0-80%)
- Toggle "Night Dim" for extra 20% dimming
- Auto-dim deeper after routine completion

#### Chores Tab
- Enable/disable chores feature
- Add/edit/remove chores with emojis
- Set custom reward text

#### Tonies Tab
- Enable/disable Tonie chooser
- Add/edit/remove Tonies with emojis
- Set auto-select duration (0 = wait until chosen)

#### Sounds Tab
- Enable/disable chimes at transitions
- Adjust volume (0-100%)
- Toggle digital clock display

## 🔄 Multi-Device Sync

### Setup on Parent Phone
1. Open the same app URL on your phone
2. Add to Home Screen
3. Sign in with the same account
4. Select the child's profile

### Making Changes
1. Long-press bottom-left corner (or access settings)
2. Enter PIN
3. Modify schedule, colors, chores, etc.
4. Save

Changes appear on iPad within seconds via Supabase Realtime.

### Offline Behavior
- iPad continues with last known settings when offline
- Changes made offline sync when connection returns
- "Last synced" indicator shown in settings (parent view only)

## 🏗️ Development

### Project Structure
```
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Main mode screen
│   ├── pin/page.tsx       # PIN entry
│   ├── setup/page.tsx     # First-time setup
│   └── instructions/      # iPad setup guide
├── components/            # React components
│   ├── ModeScreen.tsx     # Mode display wrapper
│   ├── ChoresFlow.tsx     # Chores checklist
│   ├── BookCounter.tsx    # Book reading counter
│   ├── TonieChooser.tsx   # Tonie selection
│   ├── PinPad.tsx         # PIN entry UI
│   ├── DimOverlay.tsx     # Brightness overlay
│   └── SettingsPanel.tsx  # Settings UI
├── contexts/              # React contexts
│   └── AppContext.tsx     # Global app state
├── lib/                   # Utilities
│   ├── supabase.ts        # Supabase client
│   ├── schedule.ts        # Schedule calculations
│   ├── storage.ts         # IndexedDB operations
│   ├── sync.ts            # Data sync logic
│   ├── pin.ts             # PIN hashing/verification
│   └── audio.ts           # Audio system
├── types/                 # TypeScript types
│   └── index.ts           # All type definitions
├── supabase/              # Database
│   └── migrations/        # SQL migrations
└── public/                # Static assets
    └── manifest.json      # PWA manifest
```

### Key Utilities

#### Schedule Calculation (`lib/schedule.ts`)
- `calculateCurrentMode(schedule, time)`: Determines active mode
- `validateSchedule(schedule)`: Checks for overlaps/gaps
- Handles overnight blocks (end < start)

#### Storage (`lib/storage.ts`)
- IndexedDB wrapper using `idb`
- Stores settings, daily state, profiles, metadata
- Auto-cleanup of old daily states (>30 days)

#### Sync (`lib/sync.ts`)
- Bidirectional sync with Supabase
- Realtime subscriptions for live updates
- Fallback polling (60s) if realtime drops
- Conflict resolution (server wins for settings)

#### Audio (`lib/audio.ts`)
- Web Audio API for chimes
- iOS-compatible audio priming
- Chime and celebration sounds

### Building for Production

```bash
npm run build
npm start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab/Bitbucket

2. Import project to Vercel:
   - Visit https://vercel.com
   - Click "Import Project"
   - Select your repository

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

Vercel automatically:
- Builds the Next.js app
- Configures PWA service worker
- Provides a production URL

### Netlify

1. Push code to Git repository

2. Import to Netlify:
   - Visit https://netlify.com
   - Click "Add new site"
   - Select repository

3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

4. Add environment variables in Netlify dashboard

5. Deploy

### Custom Server

```bash
# Build
npm run build

# Start
npm start
```

Serve on port 3000 or configure via `PORT` environment variable.

## 🗄️ Database Schema

### Tables

#### `profiles`
- `id` (uuid, pk)
- `user_id` (uuid, fk auth.users)
- `name` (text)
- `created_at` (timestamp)

#### `settings`
- `profile_id` (uuid, pk, fk profiles)
- `schedule_json` (jsonb)
- `colors_json` (jsonb)
- `dim_json` (jsonb)
- `chores_enabled` (bool)
- `chores_json` (jsonb)
- `reward_text` (text)
- `tonie_enabled` (bool)
- `tonie_list_json` (jsonb)
- `last_tonie_id` (text)
- `sound_enabled` (bool)
- `sound_volume` (int)
- `pin_hash` (text)
- `updated_at` (timestamp)

#### `daily_state`
- `profile_id` (uuid, fk profiles)
- `date` (date)
- `chores_done_json` (jsonb)
- `books_count` (int)
- `last_completed_step` (text)
- `updated_at` (timestamp)

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access data for profiles they own (via `user_id`).

## 🔐 Security

- **PIN Protection**: bcrypt-hashed (10 rounds)
- **Row Level Security**: Enforced at database level
- **Auth**: Supabase Auth with email/password
- **Client-side validation**: All user inputs validated
- **Offline security**: Local data encrypted via IndexedDB

## 🐛 Troubleshooting

### Sounds not playing
- iOS requires user interaction to enable audio
- Tap "Enable Sounds" button after PIN unlock
- Check volume settings in app

### Settings not syncing
- Check internet connection
- Verify Supabase credentials
- Check "Last synced" time in settings
- Try manual refresh (reopen settings)

### Mode not updating
- Check schedule times in settings
- Ensure no overlaps or gaps
- Test with "Test Time" override in settings

### App not loading
- Clear browser cache
- Reinstall PWA (delete from Home Screen, re-add)
- Check console for errors (Safari → Develop → Inspect)

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- Icons: System emojis
- Animations: canvas-confetti
- Supabase team for excellent backend platform
- Next.js team for PWA-ready framework

## 📞 Support

For issues, questions, or feature requests, please open a GitHub issue.

---

Built with ❤️ for better bedtimes

