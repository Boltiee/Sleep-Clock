# Go To Sleep Clock - Demo Video

This directory contains the demo video for the Go To Sleep Clock app.

## Demo Video

**File**: `go-to-sleep-clock-demo.webm` (2.4MB)

### What's Included

The demo showcases the following features in approximately 30-45 seconds:

1. **Onboarding Flow** (0:00-0:15)
   - Mode selection (Local Mode)
   - Child profile creation
   - PIN setup with confirmation
   - Setup completion
   - ✨ **Visual click indicators** show where interactions happen

2. **Main App Screen** (0:15-0:20)
   - Current mode display with full-screen color background
   - Mode-specific UI elements

3. **Settings Panel** (0:20-0:40)
   - Opening settings interface
   - Schedule tab with timeline view
   - Colors tab with color pickers per mode
   - Chores tab with editable checklist
   - Sounds tab with volume controls
   - Closing settings

### Visual Enhancements

- **Click Indicators**: Blue circular pulses appear on every click
- **Smooth Animations**: Professional-looking transitions
- **High Quality**: 720p HD recording

### Video Format

- **Format**: WebM (VP8/VP9)
- **Resolution**: 1280x720 (720p HD)
- **Duration**: ~30-45 seconds
- **Size**: 2.4MB

### Adding Background Music 🎵

To add calming background music to your demo:

```bash
# 1. Get royalty-free music (see music/README.md for sources)
# 2. Add music to the video
bash scripts/add-music.sh music/your-music-file.mp3

# Output: demos/go-to-sleep-clock-demo-with-music.mp4
```

**Music recommendations for sleep apps:**
- Gentle lullabies
- Soft piano or music box
- Nature sounds with light music
- Ambient/atmospheric

**Free music sources:** Pixabay, YouTube Audio Library, Incompetech (see `music/README.md`)

### Converting to MP4 (Without Music)

If you need to convert the video to MP4 format for sharing:

```bash
# Option 1: Use the conversion script (requires ffmpeg)
bash scripts/convert-to-mp4.sh

# Option 2: Manual conversion with ffmpeg
ffmpeg -i demos/go-to-sleep-clock-demo.webm -c:v libx264 -c:a aac demos/go-to-sleep-clock-demo.mp4
```

**Installing ffmpeg** (if not already installed):
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Re-recording the Demo

To record a new demo video:

```bash
# 1. Ensure dev server is running
npm run dev

# 2. In a new terminal, run the recording script
npx tsx scripts/record-demo.ts

# The new video will be saved in the demos/ folder
```

### Notes

- The demo runs in headless=false mode so you can watch it being recorded
- Browser storage is cleared before each recording for a fresh start
- All interactions are automated with appropriate delays for visibility
- The script handles the complete onboarding flow automatically

### Sharing the Video

The WebM format is widely supported by:
- Modern web browsers (Chrome, Firefox, Edge)
- Video players (VLC, MPV)
- Social media platforms (YouTube, Twitter)

For maximum compatibility, convert to MP4 before sharing on platforms that don't support WebM.
