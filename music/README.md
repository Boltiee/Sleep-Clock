# Background Music for Demo Video

This directory is for storing background music files to add to your demo video.

## Recommended Music Style

For a children's sleep clock app, choose music that is:
- 🌙 **Calming and gentle** - Promotes relaxation
- 🎵 **Soft volume** - Not startling or overpowering
- ⏰ **30-60 seconds** - Matches video length
- 😌 **Instrumental** - No distracting lyrics
- 🌟 **Positive mood** - Reassuring and comforting

## Music Themes That Work Well

1. **Lullabies** - Soft, repetitive melodies
2. **Gentle Piano** - Calm, simple arrangements
3. **Music Box** - Classic bedtime sound
4. **Nature Sounds + Light Music** - Rain, ocean waves with soft instruments
5. **Ambient/Atmospheric** - Subtle, peaceful backgrounds

## Free Royalty-Free Music Sources

### 1. Pixabay Music (Recommended)
- Website: https://pixabay.com/music/
- License: Free for commercial use
- Search terms: "lullaby", "gentle piano", "calm", "peaceful"

**How to download:**
1. Visit https://pixabay.com/music/
2. Search for "gentle piano" or "lullaby"
3. Listen to previews
4. Download MP3
5. Save to this `music/` directory

### 2. YouTube Audio Library
- Website: https://studio.youtube.com (requires Google account)
- License: Free, some require attribution
- Filter by mood: "Calm", "Happy"

### 3. Incompetech
- Website: https://incompetech.com/music/
- License: Free with attribution
- Browse: "Quiet" or "Tender"

### 4. Free Music Archive
- Website: https://freemusicarchive.org/
- License: Various Creative Commons
- Search: "lullaby" or "music box"

### 5. Bensound
- Website: https://www.bensound.com/
- License: Free with attribution
- Try: "Sunny", "Little Idea", "Happy Rock"

## Recommended Tracks (Examples)

Here are some specific track suggestions from Pixabay (free to use):

1. **"Good Night"** by Lexin_Music - Gentle piano lullaby
2. **"Sleeping Baby"** by Grand_Project - Soft music box
3. **"Peaceful Garden"** by Pufino - Calm ambient
4. **"Sweet Dreams"** by SoundGalleryBy - Gentle instrumental
5. **"Little Star"** by Tokyo_Music_Walker - Soft piano

## Quick Download Command

For Pixabay (example):

```bash
# Download a sample gentle piano track
curl -L "https://pixabay.com/music/[track-url]" -o music/demo-music.mp3
```

Or simply download manually from the website and save here.

## Using the Music

Once you have a music file in this directory:

```bash
# Add music to your demo video
bash scripts/add-music.sh music/your-music-file.mp3

# This creates: demos/go-to-sleep-clock-demo-with-music.mp4
```

## Music File Guidelines

- **Format**: MP3, WAV, or M4A (MP3 recommended)
- **Length**: 30-60 seconds minimum (script will loop if needed)
- **Volume**: Medium (script reduces to 30% automatically)
- **Bitrate**: 128kbps or higher
- **Sample rate**: 44.1kHz standard

## Attribution

If using music that requires attribution, add credits here:

```
Music Credits:
- Track Name by Artist Name
  Source: [URL]
  License: [License Type]
```

Example:
```
Music Credits:
- "Gentle Lullaby" by Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0 License
  http://creativecommons.org/licenses/by/4.0/
```

## Testing Music

Before finalizing, test that the music:
1. ✅ Doesn't overpower the visual demonstration
2. ✅ Matches the app's calming bedtime theme
3. ✅ Fades in/out smoothly (automatic in script)
4. ✅ Is appropriate for children/families
5. ✅ Has proper licensing for your use case

## Notes

- The `add-music.sh` script automatically:
  - Adjusts volume to 30% (customizable)
  - Adds 2-second fade-in at start
  - Adds 2-second fade-out at end
  - Loops music if shorter than video
  - Outputs to MP4 format

- To adjust volume, edit `scripts/add-music.sh` line:
  ```bash
  volume=0.3  # Change 0.3 to 0.2 (quieter) or 0.4 (louder)
  ```

## File Structure

```
music/
├── README.md                    # This file
├── your-music-file.mp3         # Your downloaded music
├── gentle-lullaby.mp3          # Example names
├── soft-piano.mp3              # Example names
└── credits.txt                 # Attribution if needed
```

---

**Need help choosing?** Try searching Pixabay for "gentle piano music box" - usually perfect for sleep apps!
