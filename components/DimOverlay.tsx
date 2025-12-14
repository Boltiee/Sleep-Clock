'use client'

interface DimOverlayProps {
  opacity: number // 0-80
  nightDimEnabled?: boolean
}

export default function DimOverlay({ opacity, nightDimEnabled }: DimOverlayProps) {
  // Calculate final opacity (0-0.8 range)
  let finalOpacity = Math.min(Math.max(opacity, 0), 80) / 100
  
  // If night dim is enabled, increase by 20%
  if (nightDimEnabled && finalOpacity < 0.8) {
    finalOpacity = Math.min(finalOpacity + 0.2, 0.8)
  }

  if (finalOpacity === 0) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-1000 z-40"
      style={{ opacity: finalOpacity }}
    />
  )
}

