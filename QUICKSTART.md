# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

```bash
# 1. Navigate to project directory
cd "Go To Sleep Clock"

# 2. Install dependencies
npm install

# 3. Set up environment (optional for online mode)
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials if using online mode

# 4. Run development server
npm run dev
```

## Access the App

Open http://localhost:3000 in your browser.

## First-Time Setup

1. You'll be redirected to `/setup`
2. Choose mode:
   - **Local Mode**: Works offline, single device only
   - **Online Mode**: Requires Supabase, enables multi-device sync
3. Create a child profile (enter name)
4. Set a 4-digit PIN for parent access
5. Done!

## Using the App

### Child View
- App displays current mode based on time
- In GET_READY mode:
  - Complete chores (tap to check off)
  - Claim reward when all done
  - Read 3 books (tap "Finished a book" button)
- Mode changes automatically based on schedule

### Parent Access
- Long-press bottom-left corner for 3 seconds
- Enter PIN
- Access settings:
  - Schedule times
  - Colors
  - Brightness/dim
  - Chores list
  - Tonies
  - Sounds

## Testing Mode Transitions

To test without waiting for actual times:

1. Access settings (long-press corner + PIN)
2. Adjust schedule times to near current time
3. Or modify schedule to trigger modes quickly

Example test schedule:
- GET_READY: Current time → +30 minutes
- SLEEP: +30 minutes → +2 hours
- ALMOST_WAKE: +2 hours → +2.5 hours
- WAKE: +2.5 hours → next day

## Next Steps

- **For iPad deployment**: See [README.md](README.md) iPad Setup section
- **For production**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **For architecture details**: See [ARCHITECTURE.md](ARCHITECTURE.md)

## Common Issues

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### TypeScript errors
```bash
# Check for errors
npm run lint
```

### Port already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### Supabase connection fails
- Check `.env.local` has correct URL and key
- Or use Local Mode (works without Supabase)

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Default Credentials (Local Mode)

- PIN: Set during setup (4 digits)
- No email/password required in Local Mode

## Support

Questions? Check:
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details

Or open an issue on GitHub.

---

Happy bedtimes! 🌙

