#!/bin/bash

# Add background music to demo video
# Usage: ./scripts/add-music.sh [music-file.mp3] [output-name]

set -e

INPUT_VIDEO="demos/go-to-sleep-clock-demo.webm"
OUTPUT_VIDEO="${2:-demos/go-to-sleep-clock-demo-with-music.mp4}"

# Check if input video exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "❌ Error: Input video not found: $INPUT_VIDEO"
    echo "Please run: npx tsx scripts/record-demo.ts first"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Install it with: brew install ffmpeg"
    exit 1
fi

# Check if music file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <music-file.mp3> [output-name]"
    echo ""
    echo "Example:"
    echo "  $0 music/gentle-lullaby.mp3"
    echo "  $0 music/soft-piano.mp3 demos/custom-demo.mp4"
    echo ""
    echo "Music recommendations for a sleep clock app:"
    echo "  - Gentle lullaby (soft, calming)"
    echo "  - Soft piano or acoustic guitar"
    echo "  - Nature sounds with light music"
    echo "  - Ambient/atmospheric music"
    echo ""
    echo "Free music sources:"
    echo "  - YouTube Audio Library (royalty-free)"
    echo "  - Pixabay: https://pixabay.com/music/"
    echo "  - Incompetech: https://incompetech.com/music/"
    echo "  - Free Music Archive: https://freemusicarchive.org/"
    exit 1
fi

MUSIC_FILE="$1"

# Check if music file exists
if [ ! -f "$MUSIC_FILE" ]; then
    echo "❌ Error: Music file not found: $MUSIC_FILE"
    exit 1
fi

echo "🎵 Adding background music to demo video..."
echo "   Video: $INPUT_VIDEO"
echo "   Music: $MUSIC_FILE"
echo "   Output: $OUTPUT_VIDEO"
echo ""

# Get video duration
VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_VIDEO")
echo "Video duration: ${VIDEO_DURATION}s"

# Add music with fade-in and fade-out, adjust volume to 30% (not overpowering)
ffmpeg -i "$INPUT_VIDEO" -i "$MUSIC_FILE" \
    -filter_complex "[1:a]volume=0.3,afade=t=in:st=0:d=2,afade=t=out:st=$(echo "$VIDEO_DURATION - 2" | bc):d=2[audio]" \
    -map 0:v -map "[audio]" \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 128k \
    -shortest \
    "$OUTPUT_VIDEO"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Video with music created successfully!"
    echo "📹 Output: $OUTPUT_VIDEO"
    ls -lh "$OUTPUT_VIDEO"
    echo ""
    echo "Preview the video to check audio levels."
    echo "To adjust volume, edit the 'volume=0.3' value in this script."
else
    echo ""
    echo "❌ Failed to add music to video"
    exit 1
fi
