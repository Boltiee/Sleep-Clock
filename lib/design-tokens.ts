/**
 * Design tokens for consistent styling across the app
 * Water color/pastel theme instead of purple/blue AI colors
 */

export const DESIGN_TOKENS = {
  // Primary brand colors (water color/pastel palette)
  colors: {
    // Primary - Soft teal/aqua
    primary: {
      50: '#E8F6F6',
      100: '#D1EDED',
      200: '#A3DBDB',
      300: '#75C9C9',
      400: '#6FB8B8', // Main primary
      500: '#5CA5A5',
      600: '#4A8484',
      700: '#386363',
      800: '#264242',
      900: '#142121',
    },
    
    // Secondary - Soft coral/pink
    secondary: {
      50: '#FDF4F4',
      100: '#FBE9E9',
      200: '#F7D3D3',
      300: '#F3BDBD',
      400: '#F4A8A8', // Main secondary
      500: '#F19494',
      600: '#E66B6B',
      700: '#DB4242',
      800: '#B02D2D',
      900: '#851818',
    },
    
    // Accent - Soft lavender
    accent: {
      50: '#F4F1F9',
      100: '#E9E3F3',
      200: '#D3C7E7',
      300: '#BDABDB',
      400: '#C4B4D9', // Main accent
      500: '#A799C5',
      600: '#8A7EB1',
      700: '#6D639D',
      800: '#504889',
      900: '#332D75',
    },
    
    // Success - Soft sage green
    success: {
      50: '#F1F7F1',
      100: '#E3EFE3',
      200: '#C7DFC7',
      300: '#ABCFAB',
      400: '#B8D4B8', // Main success
      500: '#8FBF8F',
      600: '#72A572',
      700: '#558B55',
      800: '#387138',
      900: '#1B571B',
    },
    
    // Neutral - Warm grays
    neutral: {
      50: '#F9F9F8',
      100: '#F3F3F1',
      200: '#E7E7E3',
      300: '#DBDBD5',
      400: '#CFCFC7',
      500: '#A8A89F',
      600: '#818177',
      700: '#5A5A4F',
      800: '#333327',
      900: '#1A1A15',
    },
    
    // Status colors
    error: '#E66B6B',
    warning: '#F4C896',
    info: '#78B8D8',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '1.75rem',// 28px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
} as const

// Tailwind-compatible class helpers
export const tw = {
  // Primary button
  button: {
    primary: 'bg-[#6FB8B8] hover:bg-[#5CA5A5] text-white',
    secondary: 'bg-[#F4A8A8] hover:bg-[#F19494] text-white',
    accent: 'bg-[#C4B4D9] hover:bg-[#A799C5] text-white',
    success: 'bg-[#B8D4B8] hover:bg-[#8FBF8F] text-white',
  },
  
  // Gradient backgrounds
  gradient: {
    primary: 'bg-gradient-to-r from-[#6FB8B8] to-[#78B8D8]',
    secondary: 'bg-gradient-to-r from-[#F4A8A8] to-[#E89FB8]',
    warm: 'bg-gradient-to-r from-[#F4A8A8] to-[#F4C896]',
    cool: 'bg-gradient-to-r from-[#6FB8B8] to-[#C4B4D9]',
  },
  
  // Text colors
  text: {
    primary: 'text-[#6FB8B8]',
    secondary: 'text-[#F4A8A8]',
    accent: 'text-[#C4B4D9]',
    success: 'text-[#B8D4B8]',
  },
} as const

// Export color values for direct use
export const COLORS = DESIGN_TOKENS.colors
