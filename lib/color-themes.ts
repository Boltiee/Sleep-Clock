/**
 * Color theme presets for the app
 */

import { ColorConfig } from '@/types'

export type ThemeName = 
  | 'watercolor'
  | 'pastel'
  | 'sunset'
  | 'forest'
  | 'ocean'
  | 'rainbow'
  | 'monochrome'
  | 'custom'

export interface ColorTheme {
  name: ThemeName
  displayName: string
  description: string
  colors: ColorConfig
}

export const COLOR_THEMES: Record<ThemeName, ColorTheme> = {
  watercolor: {
    name: 'watercolor',
    displayName: 'Water Color',
    description: 'Soft, fluid colors with gentle watercolor aesthetics',
    colors: {
      GET_READY: '#9FB8E8', // Soft periwinkle blue
      SLEEP: '#C19EB8', // Muted mauve
      ALMOST_WAKE: '#F4C896', // Soft peachy-yellow
      WAKE: '#A8D8B8', // Soft sage green
    },
  },
  pastel: {
    name: 'pastel',
    displayName: 'Pastel',
    description: 'Light, muted pastel colors',
    colors: {
      GET_READY: '#D4B5E8', // Pastel lavender
      SLEEP: '#B5D4E8', // Pastel blue
      ALMOST_WAKE: '#F4D6A8', // Pastel peach
      WAKE: '#C8E8B5', // Pastel mint
    },
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm oranges, pinks, and purples',
    colors: {
      GET_READY: '#E89FB8', // Warm pink
      SLEEP: '#9F7EB8', // Deep lavender
      ALMOST_WAKE: '#F4B878', // Warm orange
      WAKE: '#F4D478', // Warm yellow
    },
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    description: 'Natural greens, browns, and earth tones',
    colors: {
      GET_READY: '#8B9F7E', // Olive green
      SLEEP: '#6B7F5E', // Dark sage
      ALMOST_WAKE: '#C4A878', // Warm tan
      WAKE: '#98C878', // Bright moss green
    },
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Cool blues, teals, and aqua',
    colors: {
      GET_READY: '#78B8D8', // Sky blue
      SLEEP: '#4E88A8', // Deep ocean blue
      ALMOST_WAKE: '#78D8C8', // Bright teal
      WAKE: '#A8E8D8', // Light aqua
    },
  },
  rainbow: {
    name: 'rainbow',
    displayName: 'Rainbow',
    description: 'Bright, vibrant multi-colors',
    colors: {
      GET_READY: '#9F78E8', // Bright purple
      SLEEP: '#4F6FD8', // Bright blue
      ALMOST_WAKE: '#F4A848', // Bright orange
      WAKE: '#48D878', // Bright green
    },
  },
  monochrome: {
    name: 'monochrome',
    displayName: 'Monochrome',
    description: 'Soft grays and neutrals',
    colors: {
      GET_READY: '#9FA8B8', // Cool gray
      SLEEP: '#6F7888', // Dark gray
      ALMOST_WAKE: '#B8B8A8', // Warm gray
      WAKE: '#C8D8E8', // Light blue-gray
    },
  },
  custom: {
    name: 'custom',
    displayName: 'Custom',
    description: 'Your own custom colors',
    colors: {
      GET_READY: '#7c3aed',
      SLEEP: '#dc2626',
      ALMOST_WAKE: '#f59e0b',
      WAKE: '#16a34a',
    },
  },
}

/**
 * Get all available themes (excluding custom)
 */
export function getAvailableThemes(): ColorTheme[] {
  return Object.values(COLOR_THEMES).filter(theme => theme.name !== 'custom')
}

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): ColorTheme {
  return COLOR_THEMES[name] || COLOR_THEMES.custom
}

/**
 * Check if colors match a preset theme
 */
export function detectTheme(colors: ColorConfig): ThemeName {
  for (const [name, theme] of Object.entries(COLOR_THEMES)) {
    if (name === 'custom') continue
    
    const matches = (
      colors.GET_READY === theme.colors.GET_READY &&
      colors.SLEEP === theme.colors.SLEEP &&
      colors.ALMOST_WAKE === theme.colors.ALMOST_WAKE &&
      colors.WAKE === theme.colors.WAKE
    )
    
    if (matches) return name as ThemeName
  }
  
  return 'custom'
}
