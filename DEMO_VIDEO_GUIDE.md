# Demo Video Creation Guide

## Quick Start

To create a demo video of the Go To Sleep Clock app, follow these steps:

### Prerequisites

1. **Dev server must be running:**
   ```bash
   npm run dev
   ```
   The app should be accessible at http://localhost:3000

2. **Dependencies installed:**
   ```bash
   npm install
   ```
   (Playwright is already installed as a dev dependency)

### Recording a Demo

Run the automated recording script:

```bash
npx tsx scripts/record-demo.ts
```

This will:
- Launch a Chrome browser (visible, not headless)
- **Add visual click indicators** (blue circles appear on every click!)
- Clear all browser storage for a fresh start
- Navigate through the complete onboarding flow
- Demonstrate the main app interface
- Show the settings panel with all tabs
- Save the video to `demos/go-to-sleep-clock-demo.webm`

**Duration**: Approximately 30-45 seconds

### Adding Background Music 🎵

To add calming background music to your demo:

```bash
# 1. Download royalty-free music to the music/ directory
#    See music/README.md for recommendations

# 2. Add music to the video
bash scripts/add-music.sh music/your-music-file.mp3

# Output: demos/go-to-sleep-clock-demo-with-music.mp4
```

The script automatically:
- Adjusts volume to 30% (won't overpower the demo)
- Adds 2-second fade-in and fade-out
- Converts to MP4 format
- Loops music if shorter than video

**Recommended music**: Gentle lullabies, soft piano, or music box tunes
**Free sources**: See `music/README.md` for links to Pixabay, Incompetech, etc.

### What's Recorded

The demo automatically captures:

1. **Onboarding Flow** (~15 seconds)
   - Mode selection (Local Mode)
   - Profile creation with name "Emma"
   - PIN setup (1234) with confirmation
   - Completion and redirect to main app

2. **Main App Screen** (~5 seconds)
   - Full-screen mode display
   - Current mode color and layout

3. **Settings Panel** (~20 seconds)
   - Opening settings interface
   - **Schedule tab**: Timeline view of daily schedule
   - **Colors tab**: Color pickers for each mode
   - **Chores tab**: Editable checklist with emojis
   - **Sounds tab**: Volume controls and toggles
   - Closing settings

### Video Output

**Location**: `demos/go-to-sleep-clock-demo.webm`

**Specifications**:
- Format: WebM (VP8/VP9)
- Resolution: 1280x720 (720p)
- Size: ~2-3 MB
- Duration: 30-45 seconds

### Converting to MP4

If you need MP4 format (for better compatibility):

```bash
# Use the provided conversion script
bash scripts/convert-to-mp4.sh
```

**Requirements**: ffmpeg must be installed
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

The conversion creates: `demos/go-to-sleep-clock-demo.mp4`

### Troubleshooting

#### Dev server not running
```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```
**Solution**: Start the dev server with `npm run dev`

#### Port already in use
```
Error: Port 3000 is already in use
```
**Solution**: Kill the process or use a different port:
```bash
PORT=3001 npm run dev
# Then update the script's URL
```

#### Browser doesn't close
The script is designed to close the browser automatically. If it doesn't:
- Press `Ctrl+C` to stop the script
- The video will still be saved

#### Video is too long/short
Edit `scripts/record-demo.ts` and adjust the `waitForTimeout()` values:
- Reduce timeouts to speed up (minimum 500ms recommended)
- Increase timeouts to slow down for clarity

### Customizing the Demo

Edit `scripts/record-demo.ts` to customize:

- **Child name**: Line ~62 - `await nameInput.fill('Emma')`
- **PIN**: Lines ~81-87 - `fill('1234')`
- **Demo duration**: Adjust all `waitForTimeout()` values
- **Sections shown**: Comment out sections you don't want

### Advanced Options

#### Headless Mode
To record without showing the browser:
```typescript
// In scripts/record-demo.ts, change:
browser = await chromium.launch({
  headless: true,  // Change to true
});
```

#### Different Resolution
```typescript
// In scripts/record-demo.ts, change:
recordVideo: {
  dir: 'demos/',
  size: { width: 1920, height: 1080 }  // Full HD
},
viewport: { width: 1920, height: 1080 }
```

#### Multiple Takes
The script automatically names videos with unique IDs. To keep multiple versions:
```bash
# Run multiple times
npx tsx scripts/record-demo.ts
npx tsx scripts/record-demo.ts
npx tsx scripts/record-demo.ts

# All videos are saved with unique names in demos/
```

### CI/CD Integration

To generate demos automatically in your CI pipeline:

```yaml
# .github/workflows/demo.yml
name: Generate Demo Video

on: [push]

jobs:
  demo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run dev &
      - run: sleep 10  # Wait for server
      - run: npx tsx scripts/record-demo.ts
      - uses: actions/upload-artifact@v3
        with:
          name: demo-video
          path: demos/go-to-sleep-clock-demo.webm
```

### File Structure

```
scripts/
  ├── record-demo.ts          # Main recording script
  └── convert-to-mp4.sh       # WebM to MP4 converter

demos/
  ├── go-to-sleep-clock-demo.webm   # Latest demo video
  ├── README.md                      # This directory info
  └── [other-generated-videos].webm # Previous recordings
```

### Best Practices

1. **Clean state**: The script clears browser storage automatically
2. **Consistent timing**: Use the same delays for professional results
3. **Test first**: Run the script locally before committing changes
4. **Version control**: Don't commit video files (too large)
   - Add `demos/*.webm` and `demos/*.mp4` to `.gitignore`
5. **Document changes**: Update this guide if you modify the script

### Support

For issues or questions:
1. Check `demos/README.md` for video-specific info
2. Review `scripts/record-demo.ts` for implementation details
3. See Playwright docs: https://playwright.dev/

## Summary

You now have:
- ✅ Automated demo recording script
- ✅ 30-45 second video showcasing key features
- ✅ WebM to MP4 conversion script
- ✅ Comprehensive documentation

Share your demo video to showcase the Go To Sleep Clock app!
