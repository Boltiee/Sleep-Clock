# 🎵 Music Suggestions for Demo Video

Quick guide to finding and adding perfect background music for your Go To Sleep Clock demo.

## 🎯 Best Music Style

For a children's bedtime app, you want music that is:
- **Calm and gentle** - no sudden loud parts
- **30-60 seconds long** - matches video duration  
- **Instrumental** - no distracting words
- **Positive mood** - comforting and reassuring
- **Low volume** - won't overpower the demo

## 🎼 Specific Track Recommendations

### Quick Downloads (Pixabay - No Attribution Required)

Visit these links and click "Download":

1. **"Good Night" by Lexin_Music**
   - https://pixabay.com/music/
   - Search: "good night lexin"
   - Perfect gentle lullaby

2. **"Music Box" by Lesfm**
   - https://pixabay.com/music/
   - Search: "music box lesfm"
   - Classic bedtime sound

3. **"Tender" by Tokyo_Music_Walker**  
   - https://pixabay.com/music/
   - Search: "tender tokyo music walker"
   - Soft piano melody

4. **"Sweet Dreams" by SoundGalleryBy**
   - https://pixabay.com/music/
   - Search: "sweet dreams soundgalleryby"
   - Gentle instrumental

### Alternative Sources

**YouTube Audio Library** (Free)
- Go to: https://studio.youtube.com → Audio Library
- Filter: Genre="Ambient" or "Children", Mood="Calm"
- Recommended: "Wallpaper" by Kevin MacLeod

**Incompetech** (Free with attribution)
- Go to: https://incompetech.com/music/
- Try: "Breathe", "All Smiles", "New Dawn"

## 📥 Quick Start Guide

### 1. Download Music (1 minute)

```bash
# Go to Pixabay
open "https://pixabay.com/music/search/lullaby/"

# Download your favorite track
# Save it to: Go To Sleep Clock/music/demo-music.mp3
```

### 2. Add to Video (10 seconds)

```bash
cd "Go To Sleep Clock"
bash scripts/add-music.sh music/demo-music.mp3
```

### 3. Done! 

Your video with music is ready at:
`demos/go-to-sleep-clock-demo-with-music.mp4`

## 🎚️ Adjusting Audio Levels

If the music is too loud or quiet, edit `scripts/add-music.sh`:

```bash
# Find this line (around line 56):
volume=0.3    # Current: 30% volume

# Adjust as needed:
volume=0.2    # Quieter (20%)
volume=0.4    # Louder (40%)
volume=0.5    # Even louder (50%)
```

## 🎨 Music Mood Guide

**For daytime/wake modes:** Upbeat, happy, light
- "Sunny", "Little Idea", "Happy Rock"

**For nighttime/sleep modes:** Calm, gentle, soothing  
- "Good Night", "Lullaby", "Tender"

**For full demo (mixed):** Neutral, pleasant, professional
- "Music Box", "Peaceful Garden", "Breathe"

## ⚖️ Licensing Cheat Sheet

| Source | Attribution Required? | Commercial Use OK? |
|--------|----------------------|-------------------|
| Pixabay | ❌ No | ✅ Yes |
| YouTube Audio Library | ⚠️ Some tracks | ✅ Yes |
| Incompetech | ✅ Yes | ✅ Yes |
| Bensound | ✅ Yes | ✅ Yes (with license) |

### How to Attribute (if required)

Add to your video description or credits:
```
Music: "Track Name" by Artist Name
Source: [URL]
License: Creative Commons Attribution 4.0
```

## 🚀 One-Command Setup (Example)

```bash
# Download sample track from Pixabay, add to video
# (You'll need to download manually first - no direct download API)

# 1. Download from Pixabay to music/ folder
# 2. Run:
bash scripts/add-music.sh music/gentle-lullaby.mp3

# Done! Video with music ready to share.
```

## 💡 Pro Tips

1. **Listen first** - Preview tracks before downloading
2. **Match the mood** - Calm music for a sleep app
3. **Check length** - 30-60 seconds is perfect
4. **Test volume** - Preview the output video
5. **Keep it simple** - One gentle track is better than complex music

## 🎵 My Top Pick

**For this sleep clock app, I recommend:**

**"Music Box Lullaby" from Pixabay**
- Search: "music box" on Pixabay
- Perfect length (30-90 sec)
- Calming bedtime vibe
- No attribution required
- Free for commercial use

## 📝 Quick Checklist

- [ ] Found calming, appropriate music
- [ ] Downloaded to `music/` folder
- [ ] Ran `bash scripts/add-music.sh music/[filename].mp3`
- [ ] Previewed the output video
- [ ] Volume sounds good (adjust if needed)
- [ ] Added attribution if required
- [ ] Ready to share!

---

**Having trouble?** Check `music/README.md` for detailed instructions.
