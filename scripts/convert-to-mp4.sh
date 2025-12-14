#!/bin/bash

# Convert demo video from WebM to MP4
# Usage: ./scripts/convert-to-mp4.sh

INPUT="demos/go-to-sleep-clock-demo.webm"
OUTPUT="demos/go-to-sleep-clock-demo.mp4"

if [ ! -f "$INPUT" ]; then
    echo "Error: Input file $INPUT not found"
    echo "Please run: npx tsx scripts/record-demo.ts first"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install it with: brew install ffmpeg"
    exit 1
fi

echo "Converting $INPUT to $OUTPUT..."
ffmpeg -i "$INPUT" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "✅ Conversion complete: $OUTPUT"
    ls -lh "$OUTPUT"
else
    echo "❌ Conversion failed"
    exit 1
fi
